import { getPathToServer } from "~/configs/pathToExplorer.js";

export default async function fetchNextHolders(asset, params) {
  const headers = useRequestHeaders()
  const ip = headers['x-forwarded-for']
  const referer = headers.referer;
  
  console.log(`Fetching ${asset} next holders`, ip, referer);
  
  return $fetch(`${getPathToServer()}/api/asset/${asset}/next_page_holders`, {
    params,
  });
}
