export function prepareParamsForAddress(route, lastRowids) {
  const params = {};

  if (route.query.asset) {
    params.asset = route.query.asset;
  }

  // next page
  if (lastRowids && lastRowids.value) {
    params.lastInputsROWID = lastRowids.value.lastInputsROWID;
    params.lastOutputsROWID = lastRowids.value.lastOutputsROWID;
  }

  return params;
}
