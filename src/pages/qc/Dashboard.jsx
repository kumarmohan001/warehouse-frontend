import { workflowApi } from '../../features/warehouse/workflowApi';
import React, { useEffect, useState } from 'react';
import { warehouseApi } from '../../features/warehouse/warehouseApi';
import RoleDashboardLayout from '../shared/dashboard/RoleDashboardLayout';
import QcStats from './components/QcStats';
import QcLifecycle from './components/QcLifecycle';
import SampleQueue from './components/SampleQueue';

// Pass `data` from an API call: { stats, lifecycle, sampleQueue }.
export default function Dashboard({ token, data = {}, onNavigate = () => {} }) {
  const [queue, setQueue] = useState([]);
  const [stats, setStats] = useState([]);
  const [receipt, setReceipt] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [reload, setReload] = useState(0);
  useEffect(() => {
    let active = true;
    async function load() {
      try {
        const [{ records }, summary] = await Promise.all([warehouseApi.list(token, { limit: 5 }), workflowApi.get(token, 'summary')]);
        const latest = records[0];
        const result = latest ? await warehouseApi.detail(token, latest._id) : null;
        if (active) {
          setReceipt(result?.record || null); setQueue(records); setError('');
          const count = (status) => summary.raw.filter((item) => item._id.status === status).reduce((sum, item) => sum + item.count, 0);
          setStats([['Pending Sampling', count('Quarantine'), 'quarantined batches', 'blue'], ['Under Test', count('Under Test'), 'testing in progress', 'amber'], ['QC Approved', count('Approved') + count('Available'), 'approved batches', 'green'], ['QC Rejected', count('Rejected'), 'blocked batches', 'rose']]);
        }
      } catch (error) { if (active) setError(error.message); }
      finally { if (active) setLoading(false); }
    }
    setLoading(true);
    load();
    const timer = window.setInterval(load, 30000);
    return () => { active = false; window.clearInterval(timer); };
  }, [token, reload]);
  return <RoleDashboardLayout title="QC Test dashboard" subtitle="Sampling, testing and quality disposition">
    <article className="stock-list-card">
      <div className="card-heading"><h3>Latest received stock</h3><button className="outline" disabled={loading} onClick={() => setReload((value) => value + 1)}>Refresh</button></div>
      {error && <p role="alert" className="error-toast">{error}</p>}
      {loading ? <p>Loading latest stock...</p> : receipt ? <>
        <div className="table-wrap"><table className="stock-table"><thead><tr><th>GRN</th><th>Material / Batch</th><th>Quantity</th><th>QC reviewer</th><th>Status</th></tr></thead><tbody><tr><td>{receipt.grnNumber}</td><td>{receipt.materialName}<small>{receipt.batchNo}</small></td><td>{receipt.receivedQuantity} {receipt.quantityUnit}</td><td>{receipt.qcAssignedTo?.name || 'Not assigned'}</td><td>{receipt.status}</td></tr></tbody></table></div>
        <button className="outline" onClick={() => onNavigate('Receiving Stock')}>Open receiving stock</button>
      </> : !error && <p>No stock received yet.</p>}
    </article>
    <QcStats stats={stats} />
    <QcLifecycle receipt={receipt} loading={loading} error={error} />
    <SampleQueue data={{ title: 'Recent received batches', actionLabel: 'Open Sampling Details', columns: ['Sample No.', 'Material', 'Batch', 'QC reviewer', 'Status'], rows: queue.map((item) => [item.sampling?.number || 'Not sampled', item.materialName, item.batchNo, item.qcAssignedTo?.name || 'Not assigned', item.status]) }} onCreate={() => onNavigate('Sampling')} />
  </RoleDashboardLayout>;
}
