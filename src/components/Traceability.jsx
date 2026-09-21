import React from 'react';

export default function Traceability({ title, steps, activeStep }) {
  return <article className="trace-card"><div className="card-heading"><p className="trace-title">{title}</p></div><div className="flow">{steps.map((step, index) => <div className={index <= activeStep ? (index === activeStep ? 'current' : 'done') : 'pending'} key={step}><i>{index < activeStep ? '\u2713' : index + 1}</i><span>{step}</span></div>)}</div></article>;
}
