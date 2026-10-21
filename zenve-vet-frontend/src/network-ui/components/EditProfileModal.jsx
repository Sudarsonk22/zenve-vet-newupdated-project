/* eslint-disable react-hooks/set-state-in-effect, react-hooks/exhaustive-deps */
import { useEffect, useRef, useState } from 'react';
import { X, ArrowRight, User, MapPin, Globe, Stethoscope, FileText, ShieldCheck, Upload } from 'lucide-react';
import { DEFAULT_IMAGE, uploadMedia, mediaSrc } from '../api';
import logo from '../../assets/zenve-vet-logo.png';
import heroPhoto from '../../assets/profile-hero.png';
import './createProfileModal.css';

export default function EditProfileModal({ open, profile, onClose, onSave }) {
  const [form, setForm] = useState(null);
  const [error, setError] = useState('');
  const [busy, setBusy] = useState(false);
  const [uploading, setUploading] = useState(false);
  const fileRef = useRef(null);

  useEffect(() => {
    if (open) {
      setForm({
        fullName: profile.name,
        specialty: profile.specialty,
        city: profile.city,
        state: profile.state,
        bio: profile.about || '',
        avatarUrl: profile.image === DEFAULT_IMAGE ? '' : profile.image,
        bannerUrl: profile.banner || '',
      });
      setError('');
    }
  }, [open]);

  if (!open || !form) return null;

  const update = e => setForm({ ...form, [e.target.name]: e.target.value });

  const pickPhoto = async e => {
    const file = e.target.files[0];
    e.target.value = '';
    if (!file) return;
    setUploading(true);
    setError('');
    try {
      const url = await uploadMedia(file);
      setForm(current => ({ ...current, avatarUrl: mediaSrc(url) }));
    } catch (err) {
      setError(err.message);
    }
    setUploading(false);
  };

  const submit = async e => {
    e.preventDefault();
    if (!form.fullName.trim() || !form.city.trim()) {
      setError('Please enter your name and city.');
      return;
    }
    setBusy(true);
    try {
      await onSave(form);
    } catch (err) {
      setError(err.message);
    }
    setBusy(false);
  };

  return (
    <div className="cp-backdrop" onMouseDown={e => e.target === e.currentTarget && onClose()}>
      <section className="cp-modal" role="dialog" aria-modal="true" aria-labelledby="edit-title">
        <div className="cp-top">
          <img className="cp-logo" src={logo} alt="Zenve Vet" />
          <span className="cp-trust">
            <ShieldCheck size={18} /> Trusted by pet lovers &amp; professionals
          </span>
          <button className="cp-close" onClick={onClose} aria-label="Close">
            <X size={20} />
          </button>
        </div>

        <div className="cp-hero">
          <div className="cp-hero-text">
            <h2 id="edit-title">
              Edit your <br />
              <span>professional</span> page.
            </h2>
            <p>Keep your professional details up to date.</p>
          </div>
          <img className="cp-hero-photo" src={heroPhoto} alt="" />
        </div>

        <form className="cp-card" onSubmit={submit}>
          <div className="cp-row">
            <span className="cp-icon"><User size={20} /></span>
            <div className="cp-field">
              <label htmlFor="ep-name">Full name</label>
              <input id="ep-name" name="fullName" value={form.fullName} onChange={update} />
            </div>
          </div>

          <div className="cp-row">
            <span className="cp-icon"><MapPin size={20} /></span>
            <div className="cp-field">
              <label htmlFor="ep-city">City</label>
              <input id="ep-city" name="city" value={form.city} onChange={update} />
            </div>
          </div>

          <div className="cp-row">
            <span className="cp-icon"><Globe size={20} /></span>
            <div className="cp-field">
              <label htmlFor="ep-state">State</label>
              <input id="ep-state" name="state" value={form.state} onChange={update} />
            </div>
          </div>

          <div className="cp-row">
            <span className="cp-icon"><Stethoscope size={20} /></span>
            <div className="cp-field">
              <label htmlFor="ep-specialty">Specialty</label>
              <input id="ep-specialty" name="specialty" value={form.specialty} onChange={update} list="specialty-options" />
              <datalist id="specialty-options">
                <option value="Small Animal Medicine" />
                <option value="Veterinary Surgery" />
                <option value="Veterinary Dermatology" />
                <option value="Animal Nutrition" />
                <option value="Emergency & Critical Care" />
                <option value="Veterinary Dentistry" />
                <option value="Large Animal Medicine" />
              </datalist>
            </div>
          </div>

          <div className="cp-row">
            <span className="cp-icon"><FileText size={20} /></span>
            <div className="cp-field">
              <label htmlFor="ep-bio">Your story</label>
              <textarea
                id="ep-bio"
                name="bio"
                value={form.bio}
                onChange={update}
                rows="4"
                placeholder="Your approach to care, interests and professional story"
              />
            </div>
          </div>

          <div className="cp-row">
            <span className="cp-icon"><Upload size={20} /></span>
            <div className="cp-field">
              <label>Profile photo</label>
              <div className="ep-photo">
                {form.avatarUrl ? (
                  <img className="ep-preview" src={form.avatarUrl} alt="" />
                ) : (
                  <span className="ep-preview ep-empty">
                    <User size={22} />
                  </span>
                )}
                <button type="button" className="ep-btn" onClick={() => fileRef.current.click()} disabled={uploading}>
                  {uploading ? 'Uploading...' : 'Upload photo'}
                </button>
                {form.avatarUrl && (
                  <button type="button" className="ep-btn ep-remove" onClick={() => setForm({ ...form, avatarUrl: '' })}>
                    Remove
                  </button>
                )}
                <input ref={fileRef} type="file" accept="image/jpeg,image/png,image/webp" hidden onChange={pickPhoto} />
              </div>
            </div>
          </div>

          {error && <p className="cp-error">{error}</p>}

          <button className="cp-submit" type="submit" disabled={busy || uploading}>
            {busy ? 'Saving...' : 'Save changes'} <ArrowRight size={20} />
          </button>
        </form>
      </section>
    </div>
  );
}