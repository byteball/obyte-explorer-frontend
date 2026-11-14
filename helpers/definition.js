import { formatJsonForDisplay } from "./text.js";

export function findCodeBlockLine(definition, xpath, relativeLine) {
  if (!definition || typeof xpath !== "string" || !xpath || xpath.length > 4096) return null;

  const path = xpath.split("/").filter(Boolean);
  if (!path.length) return relativeLine;
  if (path.length > 64) return null;

  try {
    const parsed = typeof definition === "string" ? JSON.parse(definition) : definition;
    const lines = JSON.stringify(parsed, null, "  ").split("\n");

    if (Array.isArray(parsed)) path.unshift("1");
    let value = parsed;
    let line = 0;
    for (let depth = 0; depth < path.length; depth++) {
      const key = path[depth];
      const isArray = Array.isArray(value);
      if (!value || typeof value !== "object" || !Object.hasOwn(value, key)) return null;
      if (isArray && !/^(0|[1-9]\d*)$/.test(key)) return null;

      line = findChildLine(lines, line, depth, key, isArray);
      if (line === -1) return null;
      value = value[key];
    }

    const precedingLines = formatJsonForDisplay(lines.slice(0, line).join("\n")).split("\n").length;
    return (line ? precedingLines : 0) + (relativeLine || 1);
  } catch {
    return null;
  }
}

function findChildLine(lines, parentLine, depth, key, isArray) {
  const indent = "  ".repeat(depth + 1);
  const property = isArray ? null : `${JSON.stringify(key)}: `;
  const targetIndex = isArray ? Number(key) : -1;
  let index = 0;

  for (let line = parentLine + 1; line < lines.length; line++) {
    const text = lines[line];
    if (!text.startsWith(indent)) break;
    const entry = text.slice(indent.length);
    if (entry.startsWith(" ") || entry.startsWith("]") || entry.startsWith("}")) continue;
    if (isArray ? index++ === targetIndex : entry.startsWith(property)) return line;
  }
  return -1;
}

export function getAddressForTrace(trace, currentIndex) {
  if (!trace || !Array.isArray(trace)) return null;
  
  for (let i = currentIndex; i >= 0; i--) {
    if (trace[i]?.aa) {
      return trace[i].aa;
    }
  }
  
  return null;
}
