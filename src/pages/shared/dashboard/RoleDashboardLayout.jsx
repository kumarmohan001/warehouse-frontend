import React from 'react';

export default function RoleDashboardLayout({ title, subtitle, children }) {
  return <>
    <div className="page-title"><div><h1>{title}</h1><p>{subtitle}</p></div></div>
    {children}
  </>;
}
