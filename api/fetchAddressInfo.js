import { getPathToServer } from "~/configs/pathToExplorer.js";

export default async function fetchAddressInfo(address, params) {
  let type = "info";
  if (params.lastInputsROWID) {
    type = "next_page";
  }

  return $fetch(`${getPathToServer()}/api/address/${address}/${type}`, {
    params,
  });
}
