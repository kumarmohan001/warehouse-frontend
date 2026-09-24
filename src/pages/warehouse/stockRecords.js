const STORAGE_KEY = 'protechWarehouseReceivingRecords';

export function getReceivingRecords() {
  try { return JSON.parse(localStorage.getItem(STORAGE_KEY)) || []; } catch { return []; }
}

export function saveReceivingRecord(record) {
  const records = getReceivingRecords();
  localStorage.setItem(STORAGE_KEY, JSON.stringify([record, ...records]));
}

