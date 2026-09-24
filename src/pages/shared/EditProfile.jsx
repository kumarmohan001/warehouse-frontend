import React, { useEffect, useRef, useState } from 'react';
import { authApi } from '../../features/auth/authApi';
import PasswordInput from '../../components/PasswordInput';

const empty = { currentPassword: '', newPassword: '', confirmPassword: '' };
const details = (user) => ({ name: user.name || '', email: user.email || '', phone: user.phone || '' });

export default function EditProfile({ token, user, onLogout, onProfileUpdate }) {
  const [profile, setProfile] = useState(() => details(user));
  const [photo, setPhoto] = useState(null);
  const [preview, setPreview] = useState('');
  const [photoUrl, setPhotoUrl] = useState(user.photoUrl || '');
  const [profileLoading, setProfileLoading] = useState(true);
  const [profileSaving, setProfileSaving] = useState(false);
  const [profileError, setProfileError] = useState('');
  const [profileSuccess, setProfileSuccess] = useState('');
  const fileInput = useRef(null);
  const [form, setForm] = useState(empty);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const update = (event) => setForm((values) => ({ ...values, [event.target.name]: event.target.value }));

  useEffect(() => {
    let active = true;
    authApi.profile(token).then(({ user: latest }) => {
      if (active) { setProfile(details(latest)); setPhotoUrl(latest.photoUrl || ''); onProfileUpdate?.(latest); }
    }).catch((error) => { if (active) setProfileError(error.message); }).finally(() => { if (active) setProfileLoading(false); });
    return () => { active = false; };
  }, [token, onProfileUpdate]);

  useEffect(() => {
    if (!photo) { setPreview(''); return; }
    const url = URL.createObjectURL(photo);
    setPreview(url);
    return () => URL.revokeObjectURL(url);
  }, [photo]);

  function choosePhoto(event) {
    const file = event.target.files?.[0];
    setProfileError(''); setProfileSuccess('');
    if (file && (!['image/jpeg', 'image/png', 'image/webp'].includes(file.type) || file.size > 5 * 1024 * 1024)) {
      setProfileError('Choose a JPG, PNG or WebP photo up to 5 MB.');
      event.target.value = ''; setPhoto(null); return;
    }
    setPhoto(file || null);
  }

  async function saveProfile(event) {
    event.preventDefault(); setProfileSaving(true); setProfileError(''); setProfileSuccess('');
    const payload = new FormData();
    Object.entries(profile).forEach(([key, value]) => payload.append(key, value));
    if (photo) payload.append('photo', photo);
    try {
      const { user: updated } = await authApi.updateProfile(token, payload);
      setProfile(details(updated)); setPhotoUrl(updated.photoUrl || ''); setPhoto(null);
      if (fileInput.current) fileInput.current.value = '';
      onProfileUpdate?.(updated); setProfileSuccess('Profile updated successfully.');
    } catch (error) { setProfileError(error.message || 'Unable to save profile.'); }
    finally { setProfileSaving(false); }
  }

  async function submit(event) {
    event.preventDefault(); setError('');
    if (form.newPassword !== form.confirmPassword) { setError('New password and confirmation must match.'); return; }
    setSaving(true);
    try {
      const data = await authApi.changePassword(token, form);
      setForm(empty); setSuccess(data.message);
      localStorage.removeItem('protechSession');
    } catch (error) { setError(error.message || 'Unable to change password.'); }
    finally { setSaving(false); }
  }

  return <section className="user-management profile-page"><div className="page-title"><div><h1>Edit Profile</h1><p>Manage your personal details, profile photo and password.</p></div></div>
    {!success && <form className="user-form" onSubmit={saveProfile}>
      <h3>Personal details</h3>
      <fieldset className="profile-fields" disabled={profileLoading || profileSaving || saving}>
        <div className="profile-photo-row">
          {preview || photoUrl ? <img className="profile-photo-preview" src={preview || photoUrl} alt="Profile preview" /> : <span className="profile-photo-placeholder">{profile.name.charAt(0).toUpperCase() || '?'}</span>}
          <label>Profile photo<input ref={fileInput} type="file" accept="image/jpeg,image/png,image/webp" onChange={choosePhoto} /><small>JPG, PNG or WebP, up to 5 MB.</small></label>
        </div>
        <div className="user-fields">
          <label>Full name<input required maxLength={100} autoComplete="name" value={profile.name} onChange={(event) => setProfile((values) => ({ ...values, name: event.target.value }))} /></label>
          <label>Email<input required type="email" maxLength={254} autoComplete="email" value={profile.email} onChange={(event) => setProfile((values) => ({ ...values, email: event.target.value }))} /></label>
          <label>Phone number<input type="tel" maxLength={25} autoComplete="tel" value={profile.phone} onChange={(event) => setProfile((values) => ({ ...values, phone: event.target.value }))} /></label>
          <label>Role<input readOnly value={user.role} /></label>
        </div>
        <button className="primary" type="submit">{profileLoading ? 'Loading profile...' : profileSaving ? 'Saving...' : 'Save profile'}</button>
      </fieldset>
      {profileError && <p role="alert" className="form-message error">{profileError}</p>}
      {profileSuccess && <p role="status" className="form-message">{profileSuccess}</p>}
    </form>}
    <form className="user-form" onSubmit={submit}>
      <h3>Change password</h3>
      {success ? <><p role="status" className="form-message">{success}</p><button className="primary" type="button" onClick={onLogout}>Sign in again</button></> : <>
        <p>Enter your current password. After changing it, sign in again on your devices.</p>
        <fieldset className="profile-fields" disabled={saving || profileSaving}>
          <div className="user-fields">
            <PasswordInput label="Current password" name="currentPassword" autoComplete="current-password" required value={form.currentPassword} onChange={update} />
            <PasswordInput label="New password" name="newPassword" autoComplete="new-password" minLength={6} required value={form.newPassword} onChange={update} />
            <PasswordInput label="Confirm new password" name="confirmPassword" autoComplete="new-password" minLength={6} required value={form.confirmPassword} onChange={update} />
          </div>
          <button className="primary">{saving ? 'Changing password...' : 'Change password'}</button>
        </fieldset>
        {error && <p role="alert" className="form-message error">{error}</p>}
      </>}
    </form>
  </section>;
}
