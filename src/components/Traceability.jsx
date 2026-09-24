import React from 'react';

export default function Traceability({ title, steps, activeStep, stepStates, description }) {
  return <article className="trace-card"><div className="card-heading"><p className="trace-title">{title}</p></div>{description && <p className="lifecycle-description">{description}</p>}<div className="flow">{steps.map((step, index) => {
    const state = stepStates?.[index] || (index <= activeStep ? (index === activeStep ? 'current' : 'done') : 'pending');
    return <div className={state} key={step} aria-label={`${step}: ${state}`} aria-current={state === 'current' ? 'step' : undefined}><i>{state === 'done' ? '\u2713' : state === 'blocked' ? '!' : index + 1}</i><span>{step}</span></div>;
  })}</div></article>;
}
