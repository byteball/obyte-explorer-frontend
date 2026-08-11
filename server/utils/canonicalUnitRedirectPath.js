import { isValidUnitHash } from "../../helpers/unit.js";

export function getCanonicalUnitRedirectPath(requestUrl) {
  if (typeof requestUrl !== "string" || !requestUrl.startsWith("//")) {
    return null;
  }

  const queryStart = requestUrl.indexOf("?");
  const pathname = queryStart === -1
    ? requestUrl
    : requestUrl.slice(0, queryStart);
  const search = queryStart === -1 ? "" : requestUrl.slice(queryStart);
  const unit = pathname.slice(1);

  if (!isValidUnitHash(unit)) return null;

  const encodedUnit = unit.replaceAll("/", "%2F");
  return `/${encodedUnit}${search}`;
}
