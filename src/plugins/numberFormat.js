function format(number) {
  let decimal = "";
  if (number.includes(".")) {
    const s = number.split(".");
    number = s[0];
    decimal = "." + s[1];
  }
  return (
    number
      .replace(
        new RegExp("^(\\d{" + (number.length % 3 ? number.length % 3 : 0) + "})(\\d{3})", "g"),
        "$1 $2"
      )
      .replace(/(\d{3})+?/gi, "$1 ")
      .trim()
      .replace(/\s/gi, ",") + decimal
  );
}

const numberFormat = {
  updated(el) {
    if (el.innerText.includes(",")) return;
    el.innerHTML = format(el.innerText);
  },
};

export const numberFormatPlugin = {
  install(app) {
    app.directive("number-format", numberFormat);
  },
};
