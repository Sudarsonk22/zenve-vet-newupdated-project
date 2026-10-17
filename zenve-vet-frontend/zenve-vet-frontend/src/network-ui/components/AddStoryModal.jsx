/* eslint-disable react-hooks/set-state-in-effect */
import { useEffect, useRef, useState } from 'react';
import { ImagePlus, X } from 'lucide-react';
import { createPost, uploadMedia, getMeId } from '../api';

const MAX_SIZE = 50 * 1024 * 1024;

export default function AddStoryModal({ open, onClose, onPosted }) {
  const input = useRef(null);
  const [file, setFile] = useState(null);
  const [preview, setPreview] = useState('');
  const [caption, setCaption] = useState('');
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    if (!file) {
      setPreview('');
      return;
    }
    const url = URL.createObjectURL(file);
    setPreview(url);
    return () => URL.revokeObjectURL(url);
  }, [file]);

  useEffect(() => {
    if (!open) {
      setFile(null);
      setCaption('');
      setError('');
      setBusy(false);
    }
  }, [open]);

  if (!open) return null;

  const pick = event => {
    const chosen = event.target.files[0];
    event.target.value = '';
    if (!chosen) return;
    if (!chosen.type.startsWith('image/') && !chosen.type.startsWith('video/')) {
      setError('Please choose a photo or a video.');
      return;
    }
    if (chosen.size > MAX_SIZE) {
      setError('That file is too big. Please keep it under 50 MB.');
      return;
    }
    setError('');
    setFile(chosen);
  };

  const share = async () => {
    if (!file && !caption.trim()) {
      setError('Add a photo, a video or some text.');
      return;
    }
    setBusy(true);
    setError('');
    try {
      const mediaUrl = file ? await uploadMedia(file) : undefined;
      await createPost({
        authorId: getMeId(),
        type: 'STORY',
        category: 'Moments',
        body: caption.trim() || 'Moment',
        mediaUrl,
      });
      onPosted();
      onClose();
    } catch (e) {
      setError(e.message);
      setBusy(false);
    }
  };

  const isVideo = file && file.type.startsWith('video/');

  return (
    <div className="st-modal-back" onClick={onClose}>
      <div className="st-modal" onClick={e => e.stopPropagation()}>
        <div className="st-modal-head">
          <b>Add to your story</b>
          <button onClick={onClose} aria-label="Close">
            <X size={18} />
          </button>
        </div>

        <input
          ref={input}
          type="file"
          accept="image/*,video/*"
          hidden
          onChange={pick}
        />

        <div className="st-drop" onClick={() => input.current.click()}>
          {!file && (
            <span className="st-drop-empty">
              <ImagePlus size={30} />
              <b>Choose a photo or video</b>
              <small>It stays for 24 hours</small>
            </span>
          )}
          {file && !isVideo && <img src={preview} alt="" />}
          {file && isVideo && <video src={preview} muted playsInline autoPlay loop />}
        </div>

        <textarea
          value={caption}
          onChange={e => setCaption(e.target.value)}
          maxLength={200}
          rows={3}
          placeholder="Write a caption (optional)"
        />
        <span className="st-count">{caption.length}/200</span>

        {error && <p className="st-error">{error}</p>}

        <div className="st-modal-foot">
          {file && (
            <button className="st-link" onClick={() => setFile(null)} disabled={busy}>
              Remove media
            </button>
          )}
          <button className="st-share" onClick={share} disabled={busy}>
            {busy ? 'Sharing...' : 'Share story'}
          </button>
        </div>
      </div>
    </div>
  );
}