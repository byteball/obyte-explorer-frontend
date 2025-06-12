import { getPathToServer } from "~/configs/pathToExplorer.js";

export default async function fetchAssetInfo(asset, nextPageParams) {
  let type = "info";
  if (nextPageParams) {
    type = "next_page_transactions";
  }

  return $fetch(`${getPathToServer()}/api/asset/${encodeURIComponent(asset)}/${type}`, {
    params: { ...nextPageParams },
  });
}
