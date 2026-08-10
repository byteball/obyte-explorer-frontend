import { defineEventHandler, sendRedirect } from "h3";
import { getCanonicalUnitRedirectPath } from "../utils/canonicalUnitRedirectPath.js";

export default defineEventHandler((event) => {
  const redirectPath = getCanonicalUnitRedirectPath(event.node.req.url);

  if (!redirectPath) return;

  return sendRedirect(event, redirectPath, 308);
});
