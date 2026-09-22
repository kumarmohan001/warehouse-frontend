import React from 'react';
import Traceability from '../../../components/Traceability';

export default function ProcessTimeline({ title, steps, activeStep }) {
  return <Traceability title={title} steps={steps} activeStep={activeStep} />;
}
