import axios from "axios";

export default async function fetchNextHolders(asset, params) {
  const { data } = await axios.get(
    `${import.meta.env.VITE_API_URL}/asset/${asset}/next_page_holders`,
    {
      params,
    }
  );
  return data;
}
