import { useRef, useState } from 'react';
import { Camera, Trash2 } from 'lucide-react';
import { updateVet, uploadMedia, mediaSrc, DEFAULT_IMAGE } from '../api';
import './bannerEdit.css';

export default function BannerEdit({ profile, onChanged, onError }) {
  const input = useRef(null);
  const [busy, setBusy] = useState(false);

  const send = bannerUrl =>
    updateVet(profile.id, {
      fullName: profile.name,
      specialty: profile.specialty,
      city: profile.city,
      state: profile.state,
      bio: profile.about || '',
      avatarUrl: profile.image === DEFAULT_IMAGE ? '' : profile.image,
      bannerUrl,
    });

  const pick = async e => {
    const file = e.target.files[0];
    e.target.value = '';
    if (!file) return;
    setBusy(true);
    try {
      const url = await uploadMedia(file);
      await send(mediaSrc(url));
      onChanged();
    } catch (err) {
      onError(err.message);
    }
    setBusy(false);
  };

  const remove = async () => {
    setBusy(true);
    try {
      await send('');
      onChanged();
    } catch (err) {
      onError(err.message);
    }
    setBusy(false);
  };

  return (
    <div className="bn-wrap">
      {profile.banner && (
        <button className="bn-btn bn-round" onClick={remove} disabled={busy} title="Remove cover photo">
          <Trash2 size={16} />
        </button>
      )}
      <button className="bn-btn" onClick={() => input.current.click()} disabled={busy}>
        <Camera size={16} />
        {busy ? 'Saving...' : profile.banner ? 'Change cover' : 'Add cover photo'}
      </button>
      <input
        ref={input}
        type="file"
        accept="image/jpeg,image/png,image/webp"
        hidden
        onChange={pick}
      />
    </div>
  );
}