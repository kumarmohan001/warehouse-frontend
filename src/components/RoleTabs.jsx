import React from 'react';
const roles = [['admin', 'Admin'], ['warehouse', 'Warehouse'], ['qc-test', 'QC'], ['production', 'Production']];
export default function RoleTabs({ selectedRole, onChange }) {
  return <nav className="role-tabs" aria-label="Workspace role filter">{roles.map(([key, label]) => <button key={key} className={selectedRole === key ? 'active' : ''} onClick={() => onChange(key)}>{label}</button>)}</nav>;
}
