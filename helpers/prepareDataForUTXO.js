export function prepareDataForUTXO(unitAssets, objTransactions) {
  const listTransactions = [];

  for (let key in unitAssets) {
    const unit = key.split("_")[0];
    const timestamp = parseInt(key.split("_")[1]);
    const rowid = parseInt(key.split("_")[2]);
    const transactionsForRender = {};

    unitAssets[key].forEach((asset) => {
      const key = `${unit}_${asset}`;
      const transactionByAsset = objTransactions[key];
      if (!transactionByAsset) return;

      const assetName = transactionByAsset.assetName || transactionByAsset.asset || "bytes";

      const transaction = {
        from: [],
        to: [],
        spent: transactionByAsset.spent,
      };

      const assetDecimals = transactionByAsset.assetDecimals;

      transactionByAsset.from.forEach((objFrom) => {
        let from = {
          address: objFrom.address,
          amount: objFrom.amount,
          decimals: assetDecimals || 0,
          assetName,
        };

        if (objFrom.issue) {
          from.issue = {
            serial_number: objFrom.serial_number,
          };
        } else if (
          objFrom.commissionType &&
          (objFrom.commissionType === "headers" || objFrom.commissionType === "witnessing")
        ) {
          const commissionName =
            objFrom.commissionType === "headers"
              ? "headers"
              : objFrom.commissionType === "witnessing"
              ? "witnessing"
              : false;
          if (commissionName) {
            from.commission = {
              commissionName,
              from_mci: objFrom.from_mci,
              to_mci: objFrom.to_mci,
              sum: objFrom.sum,
            };
          }
        }

        transaction.from.push(from);
      });

      for (const k in transactionByAsset.to) {
        const addressTo = transactionByAsset.to[k];

        const to = {
          address: addressTo.address,
          amount: addressTo.amount,
          decimals: assetDecimals || 0,
          assetName,
          spent: addressTo.spent ? addressTo.spent : "",
        };

        transaction.to.push(to);
      }

      if (!transactionsForRender[transactionByAsset.unit]) {
        transactionsForRender[transactionByAsset.unit] = [];
      }

      transactionsForRender[transactionByAsset.unit].push(transaction);
    });

    if (!Object.keys(transactionsForRender).length) {
      break;
    }

    listTransactions.push({
      transactionList: transactionsForRender,
      timestamp,
      rowid,
    });
  }

  return listTransactions;
}
