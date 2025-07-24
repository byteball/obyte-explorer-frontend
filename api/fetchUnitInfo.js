import { getPathToServer } from "~/configs/pathToExplorer.js";
import { isValidUnitHash } from "~/helpers/unit.js";

export default async function fetchUnitInfo(unit) {
  const headers = useRequestHeaders()
  const ua = headers['user-agent'];
  const ip = headers['x-forwarded-for']
  const referer = headers.referer
  
  console.log(`Fetching ${unit} unit`, ua, ip, referer);
  if (!isValidUnitHash(unit)) {
    return {
      deleted: true,
    };
  }

  return $fetch(`${getPathToServer()}/api/unit/${encodeURIComponent(unit)}`);
}
