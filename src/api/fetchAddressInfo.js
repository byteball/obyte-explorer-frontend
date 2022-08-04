import axios from "axios";

export default async function fetchAddressInfo(address, params) {
  let type = "info";
  if (params.lastInputsROWID) {
    type = "next_page";
  }

  const { data } = await axios.get(`${import.meta.env.VITE_API_URL}/address/${address}/${type}`, {
    params,
  });
  return data;
}
