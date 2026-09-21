import React from 'react';
export default function Sidebar({ active, onChange, onLogout, menuTitle, items }) {
  return <aside className="sidebar"><p className="nav-heading">{menuTitle}</p><nav>{items.map(([label, icon]) => <a href={'#' + label.toLowerCase().replaceAll(' ', '-')} className={active === label ? 'active' : ''} onClick={() => onChange(label)} key={label}>{icon} <span>{label}</span></a>)}</nav><button className="logout" onClick={onLogout}>Sign out</button></aside>;
}
