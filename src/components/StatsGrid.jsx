import React from 'react';
const icons = ['♙', '□', '⌁', '↗'];
export default function StatsGrid({ stats, overview, isAdmin }) {
  const liveStats = isAdmin && overview ? [[stats[0][0], String(overview.activeUsers), stats[0][2], stats[0][3]], [stats[1][0], String(overview.openRequisitions).padStart(2, '0'), stats[1][2], stats[1][3]], [stats[2][0], String(overview.pendingQc).padStart(2, '0'), stats[2][2], stats[2][3]], [stats[3][0], String(overview.dispatchesToday).padStart(2, '0'), stats[3][2], stats[3][3]]] : stats;
  return <div className="stats">{liveStats.map(([label, count, caption, color], index) => <article key={label}><span className={'stat-icon ' + color}>{icons[index]}</span><p>{label}</p><strong>{count}</strong><small className={color === 'green' ? 'positive' : ''}>{caption}</small></article>)}</div>;
}
