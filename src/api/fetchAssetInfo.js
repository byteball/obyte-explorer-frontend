import axios from "axios";

export default async function fetchAssetInfo(asset, nextPageParams) {
  let type = "info";
  if (nextPageParams) {
    type = "next_page_transactions";
  }

  const { data } = await axios.get(`${import.meta.env.VITE_API_URL}/asset/${asset}/${type}`, {
    params: { ...nextPageParams },
  });
  return data;
}
