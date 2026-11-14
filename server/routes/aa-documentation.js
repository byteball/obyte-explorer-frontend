import { fetchAaDocument } from "../utils/fetchAaDocument.js";

const ALLOWED_FETCH_SITES = new Set(["same-origin", "none"]);

export default defineEventHandler(async (event) => {
  assertMethod(event, "POST");
  appendResponseHeader(event, "Vary", "Sec-Fetch-Dest, Sec-Fetch-Mode, Sec-Fetch-Site");

  const site = getRequestHeader(event, "sec-fetch-site");
  if (site && !ALLOWED_FETCH_SITES.has(site)) {
    throw createError({ statusCode: 403, statusMessage: "Cross-site requests are not allowed" });
  }

  const { url } = getQuery(event);
  if (typeof url !== "string" || !url || url.length > 4096) {
    throw createError({ statusCode: 400, statusMessage: "Invalid AA documentation URL" });
  }

  try {
    return await fetchAaDocument(url);
  } catch {
    throw createError({ statusCode: 422, statusMessage: "AA documentation could not be loaded" });
  }
});
