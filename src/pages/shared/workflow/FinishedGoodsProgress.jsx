import React from 'react';

// Stock is credited only by warehouse acceptance, never by production handover.
export default function FinishedGoodsProgress({ record, kind }) {
  if (!record || !['fg', 'dispatch'].includes(kind)) return null;
  const guidance = kind === 'dispatch'
    ? record.status === 'Dispatched'
      ? 'Dispatch confirmed. The dispatched quantity has been deducted from finished goods stock.'
      : 'Request saved. Stock is unchanged until Warehouse verifies the batch, expiry and available quantity and confirms dispatch.'
    : {
      'Pending Documents': 'Upload the required FG documents, then select Submit FG handover to notify Warehouse. This quantity is not available stock.',
      'Pending Verification': 'Warehouse has been notified. Check FG name, batch, quantity, manufacturing date, expiry, packing, documents and physical condition before acceptance.',
      Discrepancy: 'Resolve the recorded discrepancy before Warehouse accepts the goods. This quantity remains outside available FG stock.',
      Available: 'Warehouse has physically verified and accepted this batch. The available balance can now be dispatched.',
    }[record.status];
  return <div className="flow-note" role="status">
    <b>{kind === 'fg' ? 'Finished goods receiving' : 'Finished goods dispatch'}</b>
    <p>{guidance}</p>
    {record.discrepancyReason && <p><b>Recorded discrepancy:</b> {record.discrepancyReason}</p>}
    {kind === 'fg' && record.status === 'Available' && <p>Manufactured: {record.quantity} {record.quantityUnit} | Accepted: {record.acceptedQuantity} {record.quantityUnit} | Available: {record.availableQuantity} {record.quantityUnit}</p>}
  </div>;
}
