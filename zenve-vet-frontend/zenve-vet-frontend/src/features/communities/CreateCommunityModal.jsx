import { useState } from 'react';
import { X, Users, AlertCircle } from 'lucide-react';

const CATEGORIES = [
  'Surgery & Anaesthesia',
  'Internal Medicine',
  'Emergency & Critical Care',
  'Equine Medicine',
  'Dermatology',
  'Diagnostics & Imaging',
  'Exotics & Wildlife',
  'General Practice',
];

export default function CreateCommunityModal({ open, onClose, onCreate }) {
  const [name, setName] = useState('');
  const [category, setCategory] = useState(CATEGORIES[0]);
  const [description, setDescription] = useState('');
  const [errors, setErrors] = useState({});
  const [submitting, setSubmitting] = useState(false);

  if (!open) return null;

  const validate = () => {
    const errs = {};
    if (!name.trim()) {
      errs.name = 'Community name is required.';
    } else if (name.trim().length < 3) {
      errs.name = 'Community name must be at least 3 characters.';
    }

    if (!description.trim()) {
      errs.description = 'Please provide a description of this community.';
    } else if (description.trim().length < 5) {
      errs.description = 'Description must be at least 5 characters long.';
    }
    return errs;
  };

  const handleSubmit = async e => {
    e.preventDefault();
    const errs = validate();
    if (Object.keys(errs).length > 0) {
      setErrors(errs);
      return;
    }

    setSubmitting(true);
    setErrors({});
    try {
      await onCreate({ name: name.trim(), category, description: description.trim() });
      setName('');
      setDescription('');
      onClose();
    } catch (err) {
      setErrors({ form: err.message });
    }
    setSubmitting(false);
  };

  return (
    <div className="comm-modal-overlay" onClick={onClose}
     role="dialog" aria-modal="true" aria-labelledby="create-comm-title">
      <div className="comm-modal" onClick={e => e.stopPropagation()}>
        <div className="comm-modal-header">
          <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
            <div
              style={{
                width: 38,
                height: 38,
                borderRadius: '50%',
                background: '#edf7f4',
                color: '#1b6355',
                display: 'grid',
                placeItems: 'center',
              }}
            >
              <Users size={20} />
            </div>
            <div>
              <h2 id="create-comm-title">Create Community</h2>
              <span style={{
                 fontSize: 12, color: '#64748b'
                  }}>Start a veterinary clinical circle</span>
            </div>
          </div>
          <button type="button"
           className="comm-modal-close" onClick={onClose} aria-label="Close modal">
            <X size={18} />
          </button>
        </div>

        <form onSubmit={handleSubmit}>
          <div className="comm-modal-body">
            <div className="comm-field">
              <label className="comm-label" htmlFor="comm-name">
                Community Name <span style={{ color: '#ef4444' }}>*</span>
              </label>
              <input
                id="comm-name"
                className="comm-input"
                type="text"
                value={name}
                onChange={e => {
                  setName(e.target.value);
                  if (errors.name) setErrors({ ...errors, name: null });
                }}
                placeholder="e.g. Small Animal Critical Care Hub"
                autoFocus
              />
              {errors.name && (
                <span className="comm-field-error">
                  <AlertCircle size={13} style={{
                     display: 'inline', verticalAlign: -1, marginRight: 4 }} />
                  {errors.name}
                </span>
              )}
            </div>

            <div className="comm-field">
              <label className="comm-label" htmlFor="comm-cat">
                Specialty / Category
              </label>
              <select
                id="comm-cat"
                className="comm-select"
                value={category}
                onChange={e => setCategory(e.target.value)}
              >
                {CATEGORIES.map(c => (
                  <option key={c} value={c}>
                    {c}
                  </option>
                ))}
              </select>
            </div>

            <div className="comm-field">
              <label className="comm-label" htmlFor="comm-desc">
                Description <span style={{ color: '#ef4444' }}>*</span>
              </label>
              <textarea
                id="comm-desc"
                className="comm-textarea"
                rows={2}
                value={description}
                onChange={e => {
                  setDescription(e.target.value);
                  if (errors.description) setErrors({ ...errors, description: null });
                }}
                placeholder="Describe the clinical focus and objectives of this group..."
              />
              {errors.description && (
                <span className="comm-field-error">
                  <AlertCircle size={13} style={{ display: 'inline', verticalAlign: -1, marginRight: 4 }} />
                  {errors.description}
                </span>
              )}
            </div>

            {errors.form && <span className="comm-field-error">{errors.form}</span>}
          </div>

          <div className="comm-modal-footer">
            <button type="button" className="comm-btn-secondary" 
            onClick={onClose} disabled={submitting}>
              Cancel
            </button>
            <button type="submit" className="comm-create-btn" disabled={submitting}>
              {submitting ? 'Creating…' : 'Create Group'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}