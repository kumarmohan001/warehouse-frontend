import React from 'react';
import ProcessTimeline from '../../shared/dashboard/ProcessTimeline';
import { qualityLifecycle } from './qualityLifecycle';

export default function QcLifecycle({ receipt, loading, error }) {
  if (loading || error || !receipt) return <article className="trace-card"><p className="trace-title">QUALITY LIFECYCLE</p><p role={error ? 'alert' : 'status'}>{loading ? 'Loading batch progress...' : error || 'No stock received yet.'}</p></article>;
  const lifecycle = qualityLifecycle(receipt);
  return <ProcessTimeline {...lifecycle} description={[receipt.grnNumber, receipt.materialName, 'Status: ' + receipt.status, lifecycle.note].join(' ? ')} />;
}
