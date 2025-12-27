export function prepareDataForPieFromBalances(balances, rates) {
  if (!balances || !rates || !Object.keys(rates).length) {
    return [];
  }

  const chartData = [];
  let gbyteEntry = null;

  for (let asset in balances) {
    const balance = balances[asset].balance;
    let decimals = balances[asset].assetDecimals || 0;
    const assetName = balances[asset].assetName || "GBYTE";

    let assetForRate = asset;
    if (asset === "bytes") {
      assetForRate = "GBYTE";
      decimals = 9;
    }

    const rate = rates[`${assetForRate}_USD`];
    if (!rate) continue;

    const valueInUsd = Number((rate * (balance / 10 ** decimals)).toFixed(2));

    if (assetForRate === "GBYTE") {
      gbyteEntry = { value: valueInUsd, name: "GBYTE" };
      continue;
    }

    chartData.push({ value: valueInUsd, name: assetName });
  }

  chartData.sort((a, b) => b.value - a.value);

  if (!gbyteEntry && chartData.length) {
    gbyteEntry = { value: 0, name: "GBYTE" };
  }

  if (gbyteEntry) {
    return [gbyteEntry, ...chartData];
  }

  return chartData;
}
