import { getPathToServer } from "~/configs/pathToExplorer.js";

export default async function fetchNextHolders(asset, params) {
  return $fetch(`${getPathToServer()}/api/asset/${asset}/next_page_holders`, {
    params,
  });
}
