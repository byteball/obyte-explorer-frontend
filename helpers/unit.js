function isValidBase64(b64String, len) {
  if (typeof b64String !== 'string') {
    return false;
  }

  if (len && b64String.length !== len) {
    return false;
  }

  try {
    return btoa(atob(b64String)) === b64String;
  } catch (e) {
    return false;
  }
}

export function isValidUnitHash(unit) {
  return isValidBase64(unit, 44);
}
