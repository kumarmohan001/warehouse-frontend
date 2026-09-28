export function statusTotals(rows = []) {
  const groups = new Map();
  for (const row of rows) {
    const status = row._id.status;
    const total = groups.get(status) || { status, count: 0, quantities: [] };
    total.count += row.count;
    total.quantities.push(`${row.quantity.toLocaleString()} ${row._id.unit || ''}`.trim());
    groups.set(status, total);
  }
  return [...groups.values()];
}
