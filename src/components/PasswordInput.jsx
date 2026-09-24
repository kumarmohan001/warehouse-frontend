import React, { useState } from 'react';

export default function PasswordInput({ label, ...props }) {
  const [visible, setVisible] = useState(false);
  return <label>{label}<div className="password-control"><input {...props} type={visible ? 'text' : 'password'} /><button className="password-toggle profile-password-toggle" type="button" aria-label={`${visible ? 'Hide' : 'Show'} ${label.toLowerCase()}`} aria-pressed={visible} onClick={() => setVisible((value) => !value)}><svg viewBox="0 0 24 24" width="20" height="20" fill="none" stroke="currentColor" strokeWidth="1.8" aria-hidden="true"><path d="M2 12s3.5-7 10-7 10 7 10 7-3.5 7-10 7S2 12 2 12Z" /><circle cx="12" cy="12" r="3" />{visible && <path d="m3 3 18 18" />}</svg></button></div></label>;
}
