import React from 'react';

export default function AuditTable({ title, actionLabel, columns, rows, onAction }) {
  return <article className="table-card"><div className="card-heading"><h3>{title}</h3><button className="outline table-action" onClick={onAction}>{actionLabel}</button></div><div className="table-wrap"><table><thead><tr>{columns.map((heading) => <th key={heading}>{heading}</th>)}</tr></thead><tbody>{rows.map((row, rowIndex) => <tr key={row[0] + rowIndex}>{row.map((cell, cellIndex) => <td key={cellIndex}>{cellIndex === row.length - 1 ? <span className={'badge ' + String(cell).toLowerCase().replaceAll(' ', '-')}>{cell}</span> : cell}</td>)}</tr>)}</tbody></table></div></article>;
}
