import { getPathToServer } from "~/configs/pathToExplorer.js";

export default async function fetchAddressInfo(address, params, { nextPage = false, signal } = {}) {
  const type = nextPage ? "next_page" : "info";

  return $fetch(`${getPathToServer()}/api/address/${address}/${type}`, {
    params,
    signal,
  });
}
