function sumAmountByAddressForFrom(from) {
  const obj = {};
  from.forEach((objFrom) => {
    if (!obj[objFrom.address]) {
      obj[objFrom.address] = 0;
    }
    obj[objFrom.address] += objFrom.amount;
  });

  return obj;
}

function sumAmountByAddressForTo(to) {
  const obj = {};
  for (const k in to) {
    const objTo = to[k];
    if (!obj[objTo.address]) {
      obj[objTo.address] = 0;
    }
    obj[objTo.address] += objTo.amount;
  }

  return obj;
}

export function clearChange(from, to) {
  for (let k in to) {
    if (from[k]) {
      to[k] = 0;
      if (from.length > 1) {
        delete from[k];
      } else {
        from[k] = 0;
      }
    }
  }
}

export function checkNonEmptyBalances(obj) {
  for (let k in obj) {
    const balance = obj[k];
    if (balance) return true;
  }

  return false;
}

export function clearEmptyBalances(obj) {
  for (let k in obj) {
    if (!obj[k]) {
      delete obj[k];
    }
  }
}

function addTransactionToArr(arr, unit, from, to, assetName, decimals) {
  arr[unit].push({
    from: Object.keys(from),
    to: to,
    assetName,
    decimals,
  });
}

export function prepareDataForTransfers(unitAssets, objTransactions) {
  const listTransactions = [];

  for (let key in unitAssets) {
    const unit = key.split("_")[0];
    const timestamp = parseInt(key.split("_")[1]);
    const rowid = parseInt(key.split("_")[2]);
    const transactionsForRender = {};

    unitAssets[key].forEach((asset) => {
      const transactionKey = `${unit}_${asset}`;
      const transaction = objTransactions[transactionKey];
      if (!transaction) return;
      if (!transactionsForRender[unit]) {
        transactionsForRender[unit] = [];
      }

      let assetName = transaction.asset || "GBYTE";
      let decimals = transaction.assetDecimals || 0;
      if (transaction.assetName) {
        assetName = transaction.assetName;
      }
      if (!transaction.asset) {
        decimals = 9;
      }

      let fromAddressesAndAmount = sumAmountByAddressForFrom(transaction.from);
      const toAddressesAndAmount = sumAmountByAddressForTo(transaction.to);
      clearChange(fromAddressesAndAmount, toAddressesAndAmount);

      if (Object.keys(fromAddressesAndAmount).length === 0) {
        fromAddressesAndAmount = { ...toAddressesAndAmount };

        return addTransactionToArr(
          transactionsForRender,
          unit,
          fromAddressesAndAmount,
          toAddressesAndAmount,
          assetName,
          decimals
        );
      }

      const toAddresses = Object.keys(toAddressesAndAmount);
      if (toAddresses.length === 1 && toAddressesAndAmount[toAddresses[0]] === 0) {
        if (checkNonEmptyBalances(fromAddressesAndAmount)) {
          clearEmptyBalances(fromAddressesAndAmount);
        }

        for (let k in fromAddressesAndAmount) {
          toAddressesAndAmount[toAddresses[0]] += fromAddressesAndAmount[k];
        }

        return addTransactionToArr(
          transactionsForRender,
          unit,
          fromAddressesAndAmount,
          toAddressesAndAmount,
          assetName,
          decimals
        );
      }

      if (checkNonEmptyBalances(fromAddressesAndAmount)) {
        clearEmptyBalances(fromAddressesAndAmount);
      }

      if (checkNonEmptyBalances(toAddressesAndAmount)) {
        clearEmptyBalances(toAddressesAndAmount);
      }

      return addTransactionToArr(
        transactionsForRender,
        unit,
        fromAddressesAndAmount,
        toAddressesAndAmount,
        assetName,
        decimals
      );
    });

    listTransactions.push({
      transactionList: transactionsForRender,
      timestamp,
      rowid,
    });
  }

  return listTransactions;
}
