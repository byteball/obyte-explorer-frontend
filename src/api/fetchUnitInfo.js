import axios from "axios";

export default async function fetchUnitInfo(unit) {
  const { data } = await axios.get(
    `${import.meta.env.VITE_API_URL}/unit/${encodeURIComponent(unit)}`
  );
  return data;
}
