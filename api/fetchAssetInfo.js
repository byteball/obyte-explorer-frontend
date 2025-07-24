import { getPathToServer } from "~/configs/pathToExplorer.js";

export default async function fetchAssetInfo(asset, nextPageParams) {
  const headers = useRequestHeaders()
  const ip = headers['x-forwarded-for']
  const referer = headers.referer;
  
  console.log(`Fetching ${asset} asset`, ip, referer);
  
  let type = "info";
  if (nextPageParams) {
    type = "next_page_transactions";
  }

  return $fetch(`${getPathToServer()}/api/asset/${encodeURIComponent(asset)}/${type}`, {
    params: { ...nextPageParams },
  });
}
