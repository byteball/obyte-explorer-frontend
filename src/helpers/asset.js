export function getAssetName(asset, assetName) {
  if (assetName) {
    return assetName;
  }

  return asset || "bytes";
}

export function prepareData(data, rates) {
  const _data = { ...data };
  _data.name = _data.name ? _data.name : _data.assetUnit;
  if (!_data.decimals) _data.decimals = 0;

  if (_data.name === "Bytes") {
    _data.name = "GBYTE";
    _data.decimals = 9;
    _data.supply = _data.supply / 10 ** 9;

    if (rates.value[`GBYTE_USD`]) {
      _data.dollarPrice = rates.value[`GBYTE_USD`];
      _data.marketCap = _data.dollarPrice * _data.supply;
    }

    return _data;
  }

  if (_data.name === "GBB") {
    _data.name = "GBB";
    _data.decimals = 9;
    _data.supply = _data.cap;

    if (rates.value[`GBB_USD`]) {
      _data.dollarPrice = rates.value[`GBB_USD`];
      _data.marketCap = _data.dollarPrice * (_data.supply / 10 ** 9);
    }

    return _data;
  }

  if (_data.isPrivate) {
    if (_data.cap) {
      _data.supply = _data.cap;

      if (rates.value[`${_data.assetUnit}_USD`]) {
        _data.dollarPrice = rates.value[`${_data.assetUnit}_USD`];
        _data.marketCap = _data.dollarPrice * _data.supply;
      }
    }

    return _data;
  }

  if (rates.value[`${_data.assetUnit}_USD`]) {
    _data.dollarPrice = rates.value[`${_data.assetUnit}_USD`];

    _data.supply = _data.supply / 10 ** _data.decimals;

    _data.marketCap = _data.dollarPrice * _data.supply;

    return _data;
  }

  _data.supply = _data.supply / 10 ** _data.decimals;

  return _data;
}
