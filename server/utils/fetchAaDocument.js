import { lookup } from "node:dns";
import { get as getHttp } from "node:http";
import { get as getHttps } from "node:https";
import { BlockList, isIP } from "node:net";
import { parseHttpUrl } from "../../helpers/httpUrl.js";

const maxBytes = 256 * 1024;
const maxRedirects = 3;
const redirectStatuses = new Set([301, 302, 303, 307, 308]);

const blocked = new BlockList();
for (const [address, prefix] of [
  ["0.0.0.0", 8], ["10.0.0.0", 8], ["100.64.0.0", 10], ["127.0.0.0", 8],
  ["168.63.129.16", 32], ["169.254.0.0", 16], ["172.16.0.0", 12], ["192.0.0.0", 24], ["192.0.2.0", 24],
  ["192.88.99.0", 24], ["192.168.0.0", 16], ["198.18.0.0", 15],
  ["198.51.100.0", 24], ["203.0.113.0", 24], ["224.0.0.0", 4], ["240.0.0.0", 4],
]) blocked.addSubnet(address, prefix, "ipv4");
for (const [address, prefix] of [
  ["2001::", 23], ["2001:db8::", 32], ["2002::", 16], ["3fff::", 20],
]) blocked.addSubnet(address, prefix, "ipv6");

const globalUnicast = new BlockList();
globalUnicast.addSubnet("2000::", 3, "ipv6");

function isPublicAddress(address, family) {
  if (family === 4) return !blocked.check(address, "ipv4");
  return family === 6 && globalUnicast.check(address, "ipv6") && !blocked.check(address, "ipv6");
}

function lookupPublic(hostname, options, callback) {
  lookup(hostname, { ...options, all: true }, (error, addresses) => {
    if (error) return callback(error);
    if (!addresses.length || addresses.some(({ address, family }) => !isPublicAddress(address, family))) {
      return callback(new Error("AA documentation destination is not public"));
    }

    if (options.all) return callback(null, addresses);
    callback(null, addresses[0].address, addresses[0].family);
  });
}

function requestDocument(url, signal) {
  const hostname = url.hostname.replace(/^\[|\]$/g, "");
  const family = isIP(hostname);
  if (family && !isPublicAddress(hostname, family)) {
    throw new Error("AA documentation destination is not public");
  }

  const get = url.protocol === "https:" ? getHttps : getHttp;
  return new Promise((resolve, reject) => {
    get(url, {
      agent: false,
      lookup: lookupPublic,
      signal,
      headers: { Accept: "application/json", "Accept-Encoding": "identity" },
    }, resolve).on("error", reject);
  });
}

async function readDocument(response) {
  try {
    if (Number(response.headers["content-length"]) > maxBytes) throw new Error("AA documentation is too large");
    const chunks = [];
    let bytes = 0;
    for await (const chunk of response) {
      bytes += chunk.length;
      if (bytes > maxBytes) throw new Error("AA documentation is too large");
      chunks.push(chunk);
    }
    return JSON.parse(Buffer.concat(chunks).toString("utf8").replace(/^\uFEFF/, ""));
  } finally {
    response.destroy();
  }
}

function validateDocument(doc) {
  if (!doc || typeof doc !== "object" || Array.isArray(doc) || doc.version !== "1.0") {
    throw new Error("Invalid AA documentation format");
  }
  if (doc.description !== undefined && typeof doc.description !== "string") {
    throw new Error("Invalid AA documentation description");
  }

  return {
    description: doc.description || "",
    homepage_url: parseHttpUrl(doc.homepage_url)?.href || "",
    source_url: parseHttpUrl(doc.source_url)?.href || "",
  };
}

export async function fetchAaDocument(rawUrl) {
  const signal = AbortSignal.timeout(5000);
  let url = parseHttpUrl(rawUrl);
  for (let redirects = 0; url && redirects <= maxRedirects; redirects++) {
    const response = await requestDocument(url, signal);
    if (response.statusCode >= 200 && response.statusCode < 300) {
      return validateDocument(await readDocument(response));
    }

    const { location } = response.headers;
    response.destroy();
    if (!redirectStatuses.has(response.statusCode) || !location) break;
    url = parseHttpUrl(new URL(location, url).href);
  }
  throw new Error("AA documentation could not be loaded");
}
