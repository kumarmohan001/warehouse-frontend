import React, { useEffect, useState } from 'react';
import { workflowApi } from '../../../features/warehouse/workflowApi';

export default function Locations({ token }) {
  const [locations, setLocations] = useState([]);
  const [name, setName] = useState('');
  const [error, setError] = useState('');
  const [saving, setSaving] = useState(false);
  useEffect(() => { workflowApi.get(token, 'lookups').then((data) => setLocations(data.locations)).catch((error) => setError(error.message)); }, [token]);
  async function submit(event) {
    event.preventDefault(); setSaving(true); setError('');
    try { const { location } = await workflowApi.post(token, 'locations', { name }); setLocations((current) => [...current, location]); setName(''); }
    catch (error) { setError(error.message); }
    finally { setSaving(false); }
  }
  return <section className="flow-page"><div className="page-title"><div><h1>Warehouse locations</h1><p>Locations used during raw material and finished goods acceptance.</p></div></div><form className="user-form" onSubmit={submit}><label className="flow-field">Location name<input required maxLength={100} value={name} onChange={(event) => setName(event.target.value)} placeholder="e.g. Warehouse A / Rack 01 / Bin 03" /></label><button className="primary" disabled={saving}>{saving ? 'Saving...' : 'Add location'}</button>{error && <p className="form-message error" role="alert">{error}</p>}</form><article className="stock-list-card"><ul className="flow-locations">{locations.map((location) => <li key={location._id}>{location.name}</li>)}</ul>{!locations.length && <p>Create a location before accepting stock.</p>}</article></section>;
}
