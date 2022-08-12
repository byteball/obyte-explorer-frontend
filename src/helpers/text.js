export function htmlEscape(str) {
  return str
    .replace(/&/g, "&amp;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#39;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;");
}

export function safePrettifyJson(json_object) {
  return htmlEscape(prettifyJson(json_object));
}

export function prettifyJson(json_object) {
  return JSON.stringify(json_object, null, "    ")
    .replace(/\\n/g, "\n")
    .replace(/\\t/g, "    ")
    .replace(/\\"/g, '"')
    .replace(/\\\\/g, "\\");
}

export function safeJSONParse(text) {
  if (!isNaN(Number(text))) {
    return text;
  }

  try {
    return JSON.parse(text);
  } catch (e) {
    return text;
  }
}

export function parseJSONForStateVars(text) {
  const v = JSON.parse(text);
  if (!v || typeof v !== "object") {
    throw new Error("is not json");
  }

  return v;
}

export function parseJSONForResponse(value) {
  if (typeof value === "string") {
    const result = safeJSONParse(value);

    if (typeof result === "string" || typeof result === "number") {
      return result;
    }

    if (Array.isArray(result)) {
      return result;
    }

    return parseJSONForResponse(result);
  }

  if (typeof value === "object") {
    if (Array.isArray(value)) {
      return value;
    }

    for (let key in value) {
      value[key] = parseJSONForResponse(value[key]);
    }
  }

  return value;
}

export function parseQueryParamsStrToObj(str) {
  try {
    return JSON.parse(
      '{"' +
        decodeURIComponent(
          decodeURI(str).replace(/"/g, '\\"').replace(/&/g, '","').replace(/=/g, '":"')
        ) +
        '"}'
    );
  } catch (e) {
    return {};
  }
}
