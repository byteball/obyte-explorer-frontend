export function parseHttpUrl(value) {
  if (typeof value !== "string") return null;
  try {
    const url = new URL(value);
    if ((url.protocol === "http:" || url.protocol === "https:") && !url.username && !url.password) {
      return url;
    }
  } catch {
    return null;
  }
  return null;
}
