import Decimal from "decimal.js";

export function getFormattedObject(amount, bytePayment, decimals, exchangeRates) {
  const nameForBytes = decimals ? "GBYTE" : "bytes";
  
  return {
    value: formatAmountUsingDecimalFormat(amount, decimals),
    usd: bytePayment ? `${nameForBytes}${getUsdText(amount, exchangeRates)}` : "",
  };
}

export function formatAmountUsingDecimalFormat(amount, decimal) {
  if (decimal) {
    return amount / 10 ** decimal;
  } else {
    return amount;
  }
}

export function getUsdText(byteAmount, exchangeRates) {
  if (!exchangeRates["GBYTE_USD"]) {
    return "";
  }

  const usdAmount = byteAmount * Number(exchangeRates["GBYTE_USD"]) * 1e-9;

  if (usdAmount >= 0.1) {
    return ` ≈ $${usdAmount.toFixed(2)}`;
  }

  const decimalUsdAmount = new Decimal(usdAmount).toFixed(9);

  return ` ≈ $${new Decimal(decimalUsdAmount).toFixed()}`;
}

export function format(number) {
  let sNumber = String(number);
  let decimal = "";
  if (sNumber.includes(".")) {
    const s = sNumber.split(".");
    sNumber = s[0];
    decimal = "." + s[1];
  }
  return (
    sNumber
      .replace(
        new RegExp("^(\\d{" + (sNumber.length % 3 ? sNumber.length % 3 : 0) + "})(\\d{3})", "g"),
        "$1 $2"
      )
      .replace(/(\d{3})+?/gi, "$1 ")
      .trim()
      .replace(/\s/gi, ",") + decimal
  );
}
