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
