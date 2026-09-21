import React from 'react';

export default function ComingSoonPage({ role, page, onBack }) {
  return <section className="coming-soon" aria-live="polite"><div className="maintenance-icon" aria-hidden="true"><span>{'\u2699'}</span><b>{'\u2699'}</b></div><p className="eyebrow">{role.toUpperCase()} WORKSPACE</p><h1>Coming soon</h1><p><b>{page}</b> is currently under maintenance. Our team is preparing it for you.</p><button className="outline" onClick={onBack}>{'\u2190'} Back to dashboard</button></section>;
}

export function createComingSoonPage(role, page) {
  return function RoleComingSoonPage({ onBack }) { return <ComingSoonPage role={role} page={page} onBack={onBack} />; };
}
