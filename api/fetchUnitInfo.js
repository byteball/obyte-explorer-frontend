import { getPathToServer } from "~/configs/pathToExplorer.js";
import { isValidUnitHash } from "~/helpers/unit.js";

export default async function fetchUnitInfo(unit) {
  if (!isValidUnitHash(unit)) {
    return {
      deleted: true,
    };
  }

  return $fetch(`${getPathToServer()}/api/unit/${encodeURIComponent(unit)}`);
}
