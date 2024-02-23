export function setMaxWidthNodes(x) {
  if (x > 500) {
    return x / (x / 500);
  } else if (x < -500) {
    return -(x / (x / 500));
  } else {
    return x;
  }
}

export function fixConflicts(arr) {
  const conflicts = {};
  let a, b, l, l2;
  for (a = 0, l = arr.length; a < l; a++) {
    for (b = 0; b < l; b++) {
      if (
        a !== b &&
        arr[a].position.x < arr[b].position.x + 10 &&
        arr[a].position.x > arr[b].position.x - 10 &&
        arr[a].position.y === arr[b].position.y
      ) {
        if (!conflicts[arr[a].position.y]) conflicts[arr[a].position.y] = [];
        conflicts[arr[a].position.y].push(arr[a]);
      }
    }
  }
  for (const k in conflicts) {
    let offset = 0;
    const units = [];
    for (b = 0, l2 = conflicts[k].length; b < l2; b++) {
      for (a = 0; a < l; a++) {
        if (arr[a].data.id === conflicts[k][b].data.id && units.indexOf(arr[a].data.id) === -1) {
          units.push(arr[a].data.id);
          if (arr[a].position.x < 0) {
            offset -= 60;
          } else {
            offset += 60;
          }
          arr[a].position.x += offset;
        }
      }
    }
  }
  return arr;
}
