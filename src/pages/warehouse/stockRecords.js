const STORAGE_KEY = 'protechWarehouseReceivingRecords';

export function getReceivingRecords() {
  try { return JSON.parse(localStorage.getItem(STORAGE_KEY)) || []; } catch { return []; }
}

export function saveReceivingRecord(record) {
  const records = getReceivingRecords();
  localStorage.setItem(STORAGE_KEY, JSON.stringify([record, ...records]));
}

export function nextGrnNumber() {
  const highest = getReceivingRecords().reduce((current, record) => {
    const value = Number(String(record.grn).replace(/\D/g, ''));
    return Number.isFinite(value) ? Math.max(current, value) : current;
  }, 1123);
  return `GRN-${String(highest + 1).padStart(5, '0')}`;
}
