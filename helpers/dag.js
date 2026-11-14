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
  const rows = new Map();
  for (const node of arr) {
    const { x, y } = node.position;
    if (!Number.isFinite(x) || Number.isNaN(y)) continue;
    if (!rows.has(y)) rows.set(y, []);
    rows.get(y).push(node);
  }

  const conflictingNodes = new Set();
  for (const row of rows.values()) {
    row.sort((a, b) => a.position.x - b.position.x);
    for (let i = 1; i < row.length; i++) {
      if (row[i].position.x - row[i - 1].position.x < 10) {
        conflictingNodes.add(row[i - 1]);
        conflictingNodes.add(row[i]);
      }
    }
  }

  const offsets = new Map();
  for (const node of arr) {
    if (!conflictingNodes.has(node)) continue;
    const { position } = node;
    const offset = (offsets.get(position.y) ?? 0) + (position.x < 0 ? -60 : 60);
    offsets.set(position.y, offset);
    position.x += offset;
  }
  return arr;
}
