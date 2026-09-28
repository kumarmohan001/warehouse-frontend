import React, { useEffect, useRef, useState } from 'react';
import './signature-pad.css';

export default function SignaturePad({ label = 'Signature', value = '', onChange, disabled = false }) {
  const canvas = useRef(null);
  const drawing = useRef(false);
  const ink = useRef(false);
  const [open, setOpen] = useState(false);
  const [error, setError] = useState('');
  useEffect(() => {
    if (!open) return;
    const context = canvas.current.getContext('2d');
    context.clearRect(0, 0, 600, 200); ink.current = false; setError('');
  }, [open]);
  function point(event) {
    const bounds = canvas.current.getBoundingClientRect();
    return [(event.clientX - bounds.left) * 600 / bounds.width, (event.clientY - bounds.top) * 200 / bounds.height];
  }
  function start(event) {
    if (disabled || (event.pointerType === 'mouse' && event.button !== 0)) return;
    event.preventDefault(); canvas.current.setPointerCapture(event.pointerId); drawing.current = true;
    const ctx = canvas.current.getContext('2d'); const [x, y] = point(event);
    ctx.strokeStyle = '#152d66'; ctx.fillStyle = '#152d66'; ctx.lineWidth = 2.5; ctx.lineCap = 'round'; ctx.lineJoin = 'round';
    ctx.beginPath(); ctx.arc(x, y, 1.25, 0, Math.PI * 2); ctx.fill(); ctx.beginPath(); ctx.moveTo(x, y); ink.current = true;
  }
  function move(event) {
    if (!drawing.current || disabled) return;
    const ctx = canvas.current.getContext('2d'); ctx.lineTo(...point(event)); ctx.stroke();
  }
  function useSignature() {
    if (!ink.current) { setError('Please draw your signature first.'); return; }
    onChange(canvas.current.toDataURL('image/png')); setOpen(false);
  }
  return <div className="signature-pad"><b>{label}</b>{value ? <img className="signature-image" src={value} alt={label} /> : <p className="signature-empty">No signature</p>}
    {onChange && !open && <div className="signature-tools"><button type="button" className="outline" disabled={disabled} onClick={() => setOpen(true)}>{value ? 'Redraw signature' : 'Draw signature'}</button>{value && <button type="button" className="outline" disabled={disabled} onClick={() => onChange('')}>Remove</button>}</div>}
    {open && <div className="signature-tools"><p>Draw with your mouse, finger or pen.</p><canvas ref={canvas} width="600" height="200" aria-label={`Draw ${label}`} onPointerDown={start} onPointerMove={move} onPointerUp={() => { drawing.current = false; }} onPointerCancel={() => { drawing.current = false; }} onLostPointerCapture={() => { drawing.current = false; }} />{error && <p role="alert">{error}</p>}<div><button type="button" className="outline" disabled={disabled} onClick={() => { canvas.current.getContext('2d').clearRect(0, 0, 600, 200); ink.current = false; }}>Clear</button><button type="button" className="primary" disabled={disabled} onClick={useSignature}>Use signature</button><button type="button" className="outline" disabled={disabled} onClick={() => setOpen(false)}>Cancel</button></div><small>Use signature, then save the form to keep it.</small></div>}
  </div>;
}
