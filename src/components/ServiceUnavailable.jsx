import React from 'react';

export default function ServiceUnavailable({ onRetry }) {
  return <main className="service-unavailable" role="alert"><section className="service-card"><div className="service-icon" aria-hidden="true"><span>{'\u26a0'}</span></div><p className="eyebrow">SERVICE TEMPORARILY UNAVAILABLE</p><h1>We could not connect</h1><p>The application service is not available right now. Please check that the server is running and try again.</p><button className="primary" onClick={onRetry}>Try again</button></section></main>;
}
