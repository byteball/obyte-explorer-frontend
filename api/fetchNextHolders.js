import { getPathToServer } from "~/configs/pathToExplorer.js";

export default async function fetchNextHolders(asset, params) {
  return $fetch(`${getPathToServer()}/api/asset/${encodeURIComponent(asset)}/next_page_holders`, {
    params,
  });
}
