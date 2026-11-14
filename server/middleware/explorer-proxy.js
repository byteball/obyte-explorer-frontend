import { proxyUpgrade } from "httpxy";

const registeredServers = new WeakSet();

function isProxiedPath(url, prefix) {
  const path = url?.split("?", 1)[0];
  if (path !== prefix && !path?.startsWith(`${prefix}/`)) return false;
  try {
    return (
      new URL(path, "http://localhost").pathname === path &&
      !decodeURIComponent(path).split("/").includes("..")
    );
  } catch {
    return false;
  }
}

export default defineEventHandler((event) => {
  const { req } = event.node;
  const { explorerUpstream: target } = useRuntimeConfig(event);
  const server = req.socket?.server;

  if (server && !registeredServers.has(server)) {
    registeredServers.add(server);
    server.on("upgrade", (request, socket, head) => {
      if (isProxiedPath(request.url, "/socket.io")) {
        proxyUpgrade(target, request, socket, head, { changeOrigin: true }).catch(() => socket.destroy());
      } else if (server.listenerCount("upgrade") === 1) {
        socket.destroy();
      }
    });
  }

  if (isProxiedPath(req.url, "/api") || isProxiedPath(req.url, "/socket.io")) {
    return proxyRequest(event, new URL(req.url, target).href);
  }
});
