export function getFormattedObject(amount, bytePayment, decimals, exchangeRates) {
  const nameForBytes = decimals ? "GBYTE" : "bytes";
  return {
    value: formatAmountUsingDecimalFormat(amount, decimals),
    usd: bytePayment ? ` ${nameForBytes}${getUsdText(amount, exchangeRates)}` : "",
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

  return ` ≈ $${usdAmount.toPrecision(2)}`;
}
