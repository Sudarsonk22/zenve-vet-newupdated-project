import { useEffect, useState } from 'react';
import { Megaphone, ExternalLink, MessageCircle, Send } from 'lucide-react';
import { viewAd, clickAd, getAdComments, addAdComment } from '../adApi';
import './AdCard.css';
import './adComments.css';

function timeAgo(value) {
  const minutes = Math.floor((Date.now() - new Date(value).getTime()) / 60000);
  if (minutes < 1) return 'just now';
  if (minutes < 60) return minutes + ' min ago';
  const hours = Math.floor(minutes / 60);
  if (hours < 24) return hours + ' h ago';
  return Math.floor(hours / 24) + ' d ago';
}

export default function AdCard({ ad }) {
  const [open, setOpen] = useState(false);
  const [comments, setComments] = useState([]);
  const [count, setCount] = useState(ad ? ad.commentCount : 0);
  const [text, setText] = useState('');
  const [error, setError] = useState('');
  const [sending, setSending] = useState(false);

  const adId = ad ? ad.id : null;

  useEffect(() => {
    if (adId) viewAd(adId).catch(() => {});
  }, [adId]);

  if (!ad) return null;

  const openLink = () => {
    clickAd(ad.id).catch(() => {});
    window.open(ad.destinationUrl, '_blank', 'noopener,noreferrer');
  };

  const toggle = async () => {
    const next = !open;
    setOpen(next);
    if (next) {
      try {
        setComments(await getAdComments(ad.id));
        setError('');
      } catch (e) {
        setError(e.message);
      }
    }
  };

  const send = async e => {
    e.preventDefault();
    const body = text.trim();
    if (!body || sending) return;
    setSending(true);
    try {
      const saved = await addAdComment(ad.id, body);
      setComments([...comments, saved]);
      setCount(count + 1);
      setText('');
      setError('');
    } catch (err) {
      setError(err.message);
    }
    setSending(false);
  };

  return (
    <article className="ad-feed-card" aria-label="Sponsored Advertisement">
      <header className="ad-feed-header">
        <div className="ad-feed-brand">
          <span className="ac-logo">{ad.brandName.charAt(0).toUpperCase()}</span>
          <div className="ad-feed-brand-text">
            <strong>{ad.brandName}</strong>
            <small>Veterinary Partner</small>
          </div>
        </div>

        <span className="ad-sponsored-pill">
          <Megaphone size={12} /> Sponsored
        </span>
      </header>

      <h3 className="ad-feed-headline">{ad.headline}</h3>

      {ad.posterUrl && (
        <img src={ad.posterUrl} alt={ad.headline} className="ad-feed-media" loading="lazy" />
      )}

      <footer className="ad-feed-footer">
        <button type="button" className="ac-comment-btn" onClick={toggle}>
          <MessageCircle size={16} /> {count} {count === 1 ? 'comment' : 'comments'}
        </button>
        <button type="button" className="ad-feed-cta-btn" onClick={openLink}>
          <span>{ad.buttonText || 'Learn more'}</span>
          <ExternalLink size={14} />
        </button>
      </footer>

      {open && (
        <div className="ac-panel">
          {comments.length === 0 && <p className="ac-empty">No comments yet. Be the first.</p>}
          {comments.map(c => (
            <div key={c.id} className="ac-item">
              {c.image ? (
                <img className="ac-avatar" src={c.image} alt="" />
              ) : (
                <span className="ac-avatar">{c.name.replace(/^dr\.?\s*/i, '').charAt(0).toUpperCase()}</span>
              )}
              <div className="ac-bubble">
                <b>{c.name}</b>
                <span>{timeAgo(c.createdAt)}</span>
                <p>{c.body}</p>
              </div>
            </div>
          ))}

          {error && <p className="ac-error">{error}</p>}

          <form className="ac-form" onSubmit={send}>
            <input
              value={text}
              onChange={e => setText(e.target.value)}
              placeholder="Write a comment"
              maxLength={500}
            />
            <button type="submit" disabled={sending || !text.trim()} aria-label="Send comment">
              <Send size={16} />
            </button>
          </form>
        </div>
      )}
    </article>
  );
}