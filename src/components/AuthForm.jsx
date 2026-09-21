import React, { useState } from 'react';

const roles = [{ value: 'warehouse', label: 'Warehouse' }, { value: 'qc-test', label: 'QC Test' }, { value: 'production', label: 'Production' }, { value: 'admin', label: 'Admin' }];

function PasswordField({ label, name, placeholder, value, onChange }) {
  const [visible, setVisible] = useState(false);
  return <label>{label}<div className="password-control"><input required name={name} type={visible ? 'text' : 'password'} minLength="6" value={value} onChange={onChange} placeholder={placeholder} /><button className="password-toggle" type="button" onClick={() => setVisible(!visible)} aria-label={visible ? 'Hide password' : 'Show password'}>{visible ? 'Hide' : 'Show'}</button></div></label>;
}

export default function AuthForm({ mode, onSubmit, message, isError, loading, onModeChange }) {
  const [confirmPassword, setConfirmPassword] = useState('');
  const signup = mode === 'signup';
  function submit(event) {
    event.preventDefault();
    const data = Object.fromEntries(new FormData(event.currentTarget));
    if (signup && data.password !== confirmPassword) return onSubmit(null, 'Passwords do not match.');
    if (signup) { data.phone = data.countryCode + data.phone; delete data.countryCode; }
    onSubmit(data);
  }
  return <div className="form-wrap">
    <p className="eyebrow">WELCOME TO PROTECH</p><h2>{signup ? 'Create your account' : 'Sign in to your account'}</h2><p className="muted">{signup ? 'Start with a secure Protech workspace.' : 'Enter your credentials to access the workspace.'}</p>
    <form className="auth-form" onSubmit={submit}>
      {signup && <label>Full name<input required name="name" placeholder="Your full name" /></label>}
      <label>Work email<input required name="email" type="email" placeholder="you@protech.com" /></label>
      {signup && <label>Mobile number<div className="phone-control"><select name="countryCode" defaultValue="+91" aria-label="Country code"><option value="+91">+91 IN</option><option value="+1">+1 US</option><option value="+44">+44 UK</option><option value="+971">+971 UAE</option></select><input required name="phone" type="tel" inputMode="numeric" pattern="[0-9]{6,15}" placeholder="Mobile number" /></div></label>}
      {signup && <label>Role<select required name="role" defaultValue=""><option value="" disabled>Select your role</option>{roles.map((role) => <option value={role.value} key={role.value}>{role.label}</option>)}</select></label>}
      <PasswordField label="Password" name="password" placeholder={signup ? 'At least 6 characters' : 'Enter your password'} />
      {signup && <PasswordField label="Confirm password" name="confirmPassword" value={confirmPassword} onChange={(event) => setConfirmPassword(event.target.value)} placeholder="Enter password again" />}
      <button className="primary" disabled={loading} type="submit">{loading ? 'Please wait...' : signup ? 'Create account' : 'Sign in'} <span>→</span></button>
    </form>
    <p className={'form-message ' + (isError ? 'error' : '')} role="status">{message}</p><p className="switch-text">{signup ? 'Already have an account?' : 'New to Protech?'} <button type="button" onClick={() => onModeChange(signup ? 'login' : 'signup')}>{signup ? 'Sign in' : 'Create an account'}</button></p>
  </div>;
}
