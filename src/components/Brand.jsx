import React from 'react';

export default function Brand({ sidebar = false }) {
  return <div className={'brand ' + (sidebar ? 'sidebar-brand' : '')}>
    <span className="brand-mark">P</span>
    <span>Protech <b>Biopharma</b></span>
  </div>;
}
