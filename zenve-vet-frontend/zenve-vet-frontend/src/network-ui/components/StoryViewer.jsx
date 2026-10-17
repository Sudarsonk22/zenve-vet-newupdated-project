/* eslint-disable react-hooks/set-state-in-effect, react-hooks/exhaustive-deps */
import { useEffect, useRef, useState } from 'react';
import { X, ChevronLeft, ChevronRight, Volume2, VolumeX, Eye } from 'lucide-react';
import { mediaSrc, getMeId } from '../api';
import { recordStoryView, getStoryViewers } from '../storyApi';
import StoryAvatar from './StoryAvatar';

const PHOTO_TIME = 5000;
const YOUTUBE_TIME = 15000;
const NO_CAPTION = 'Moment';

function kindOf(url) {
  if (!url) return 'text';
  if (/youtube\.com|youtu\.be/i.test(url)) return 'youtube';
  if (/\.(mp4|webm|mov|m4v|ogg)(\?|$)/i.test(url)) return 'video';
  return 'image';
}

function youtubeEmbed(url) {
  const match = url.match(/(?:youtu\.be\/|v=|embed\/|shorts\/)([\w-]{11})/);
  if (!match) return '';
  return `https://www.youtube.com/embed/${match[1]}?autoplay=1&mute=1&controls=0&playsinline=1`;
}

function timeAgo(time) {
  const mins = Math.floor((Date.now() - new Date(time).getTime()) / 60000);
  if (mins < 1) return 'now';
  if (mins < 60) return mins + 'm';
  return Math.floor(mins / 60) + 'h';
}

export default function StoryViewer({ groups, startIndex, onClose, onSeen }) {
  const meId = getMeId();
  const [g, setG] = useState(startIndex);
  const [i, setI] = useState(0);
  const [progress, setProgress] = useState(0);
  const [paused, setPaused] = useState(false);
  const [muted, setMuted] = useState(true);
  const [failed, setFailed] = useState(false);
  const [viewers, setViewers] = useState([]);
  const [sheet, setSheet] = useState(false);
  const videoRef = useRef(null);
  const pressed = useRef(0);

  const group = groups[g];
  const item = group.items[i];
  const kind = kindOf(item.mediaUrl);
  const caption = item.body && item.body !== NO_CAPTION ? item.body : '';
  const mine = group.author.id === meId;
  const stopped = paused || sheet;

  const next = () => {
    if (i < group.items.length - 1) {
      setI(i + 1);
    } else if (g < groups.length - 1) {
      setG(g + 1);
      setI(0);
    } else {
      onClose();
    }
  };

  const prev = () => {
    if (i > 0) {
      setI(i - 1);
    } else if (g > 0) {
      setG(g - 1);
      setI(0);
    } else {
      setProgress(0);
    }
  };

  useEffect(() => {
    let current = true;
    setProgress(0);
    setFailed(false);
    setSheet(false);
    setViewers([]);
    onSeen(group.author.id, item.createdAt);

    if (mine) {
      getStoryViewers(item.id)
        .then(list => {
          if (current) setViewers(list);
        })
        .catch(() => {});
    } else {
      recordStoryView(item.id).catch(() => {});
    }
    return () => {
      current = false;
    };
  }, [g, i]);

  useEffect(() => {
    if (kind === 'video' || stopped) return;
    const total = kind === 'youtube' ? YOUTUBE_TIME : PHOTO_TIME;
    const step = 50;
    const timer = setInterval(() => setProgress(p => p + step / total), step);
    return () => clearInterval(timer);
  }, [g, i, stopped, kind]);

  useEffect(() => {
    if (progress >= 1) next();
  }, [progress]);

  useEffect(() => {
    const video = videoRef.current;
    if (!video) return;
    if (stopped) {
      video.pause();
    } else {
      video.play().catch(() => {});
    }
  }, [stopped]);

  useEffect(() => {
    const onKey = e => {
      if (e.key === 'Escape') onClose();
      if (e.key === 'ArrowRight') next();
      if (e.key === 'ArrowLeft') prev();
    };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  });

  const down = () => {
    pressed.current = Date.now();
    setPaused(true);
  };

  const up = e => {
    setPaused(false);
    if (Date.now() - pressed.current > 250) return;
    const box = e.currentTarget.getBoundingClientRect();
    if (e.clientX - box.left < box.width * 0.3) {
      prev();
    } else {
      next();
    }
  };

  const src = mediaSrc(item.mediaUrl);

  return (
    <div className="st-overlay">
      <button className="st-nav st-nav-prev" onClick={prev} aria-label="Previous">
        <ChevronLeft size={22} />
      </button>

      <div className="st-card">
        <div className="st-bars">
          {group.items.map((it, index) => (
            <span className="st-bar" key={it.id}>
              <i
                style={{
                  width: index < i ? '100%' : index === i ? Math.min(progress, 1) * 100 + '%' : '0%',
                }}
              />
            </span>
          ))}
        </div>

        <div className="st-top">
          <span className="st-user">
            <span className="st-mini">
              <StoryAvatar src={mediaSrc(group.author.avatarUrl)} name={group.author.fullName} />
            </span>
            <b>{group.author.fullName}</b>
            <small>{timeAgo(item.createdAt)}</small>
          </span>
          <span className="st-tools">
            {kind === 'video' && (
              <button onClick={() => setMuted(!muted)} aria-label="Sound">
                {muted ? <VolumeX size={18} /> : <Volume2 size={18} />}
              </button>
            )}
            <button onClick={onClose} aria-label="Close">
              <X size={20} />
            </button>
          </span>
        </div>

        <div
          className="st-stage"
          onPointerDown={down}
          onPointerUp={up}
          onPointerLeave={() => setPaused(false)}
          onPointerCancel={() => setPaused(false)}
        >
          {failed && <div className="st-text">This story could not be loaded.</div>}

          {!failed && kind === 'text' && <div className="st-text">{item.body}</div>}

          {!failed && kind === 'image' && (
            <img
              className="st-media"
              src={src}
              alt=""
              draggable={false}
              onError={() => setFailed(true)}
            />
          )}

          {!failed && kind === 'video' && (
            <video
              key={item.id}
              ref={videoRef}
              className="st-media"
              src={src}
              autoPlay
              playsInline
              muted={muted}
              onTimeUpdate={e => setProgress(e.target.currentTime / (e.target.duration || 1))}
              onEnded={next}
              onError={() => setFailed(true)}
            />
          )}

          {!failed && kind === 'youtube' && (
            <iframe
              className="st-media"
              src={youtubeEmbed(item.mediaUrl)}
              title="Story video"
              allow="autoplay; encrypted-media"
            />
          )}

          {kind !== 'text' && caption && (
            <div className={mine ? 'st-caption st-caption-up' : 'st-caption'}>{caption}</div>
          )}
        </div>

        {mine && (
          <button className="st-views" onClick={() => setSheet(true)}>
            <Eye size={15} />
            {viewers.length} {viewers.length === 1 ? 'view' : 'views'}
          </button>
        )}

        {sheet && (
          <div className="st-sheet">
            <div className="st-sheet-head">
              <b>Viewed by {viewers.length}</b>
              <button onClick={() => setSheet(false)} aria-label="Close list">
                <X size={16} />
              </button>
            </div>

            {viewers.length === 0 && <p className="st-sheet-empty">No one has watched this yet.</p>}

            <ul>
              {viewers.map(v => (
                <li key={v.id}>
                  <span className="st-mini st-mini-dark">
                    <StoryAvatar src={mediaSrc(v.avatarUrl)} name={v.name} />
                  </span>
                  <span className="st-vtext">
                    <b>{v.name}</b>
                    <small>{v.specialty}</small>
                  </span>
                  <small className="st-vtime">{timeAgo(v.viewedAt)}</small>
                </li>
              ))}
            </ul>
          </div>
        )}
      </div>

      <button className="st-nav st-nav-next" onClick={next} aria-label="Next">
        <ChevronRight size={22} />
      </button>
    </div>
  );
}