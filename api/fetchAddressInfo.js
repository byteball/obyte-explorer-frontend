import { getPathToServer } from "~/configs/pathToExplorer.js";

export default async function fetchAddressInfo(address, params) {
  const headers = useRequestHeaders();
  const ua = headers['user-agent'];
  const ip = headers['x-forwarded-for']
  const referer = headers.referer;
  
  console.log(`Fetching ${address} address`, ua, ip, referer);
  
  let type = "info";
  if (params.lastInputsROWID) {
    type = "next_page";
  }

  return $fetch(`${getPathToServer()}/api/address/${address}/${type}`, {
    params,
  });
}
