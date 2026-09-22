import React from 'react';
const icons = ['♙', '□', '⌁', '↗'];
export default function StatsGrid({ stats, overview, isAdmin }) {
  const liveStats = isAdmin && overview
    ? stats.map(([label, count, caption, color]) => [label, label === 'Total Users' ? String(overview.totalUsers) : count, caption, color])
    : stats;
  return <div className="stats">{liveStats.map(([label, count, caption, color], index) => <article key={label}><span className={'stat-icon ' + color}>{icons[index]}</span><p>{label}</p><strong>{count}</strong><small className={color === 'green' ? 'positive' : ''}>{caption}</small></article>)}</div>;
}
