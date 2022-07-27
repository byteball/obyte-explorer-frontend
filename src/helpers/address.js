export function prepareParamsForAddress(route, lastRowids) {
  const params = { address: route.params.address };
  if (route.query.asset) {
    params.filter = {};
    params.filter.asset = route.query.asset;
  }

  // next page
  if (lastRowids && lastRowids.value) {
    params.lastInputsROWID = lastRowids.value.lastInputsROWID;
    params.lastOutputsROWID = lastRowids.value.lastOutputsROWID;
  }

  return params;
}
