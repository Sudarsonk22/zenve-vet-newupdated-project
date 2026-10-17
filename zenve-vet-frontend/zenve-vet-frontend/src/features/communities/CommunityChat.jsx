/* eslint-disable react-hooks/set-state-in-effect, react-hooks/exhaustive-deps */
import { useEffect, useRef, useState } from 'react';
import { ArrowLeft, Send, Users } from 'lucide-react';
import { getMessages, sendMessage } from './communityApi';
import { getMeId } from '../../network-ui/api';
import './communityChat.css';

const DEFAULT_AVATAR =
  'https://images.unsplash.com/photo-1576091160550-2173dba999ef?auto=format&fit=crop&w=300&q=80';

function time(value) {
  try {
    return new Date(value).toLocaleTimeString('en-IN', { hour: '2-digit', minute: '2-digit' });
  } catch {
    return '';
  }
}

export default function CommunityChat({ community, onClose }) {
  const meId = getMeId();
  const [messages, setMessages] = useState([]);
  const [text, setText] = useState('');
  const [error, setError] = useState('');
  const [sending, setSending] = useState(false);
  const lastId = useRef(0);
  const bottom = useRef(null);

  const addMessages = list => {
    if (list.length === 0) return;
    setMessages(current => {
      const known = current.map(m => m.id);
      const fresh = list.filter(m => !known.includes(m.id));
      return fresh.length ? [...current, ...fresh] : current;
    });
    lastId.current = Math.max(lastId.current, ...list.map(m => m.id));
  };

  useEffect(() => {
    lastId.current = 0;
    setMessages([]);
    setError('');

    const load = () =>
      getMessages(community.id, lastId.current)
        .then(addMessages)
        .catch(e => setError(e.message));

    load();
    const timer = setInterval(load, 3000);
    return () => clearInterval(timer);
  }, [community.id]);

  useEffect(() => {
    bottom.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages.length]);

  const send = async e => {
    e.preventDefault();
    const body = text.trim();
    if (!body || sending) return;
    setSending(true);
    try {
      const saved = await sendMessage(community.id, body);
      addMessages([saved]);
      setText('');
      setError('');
    } catch (err) {
      setError(err.message);
    }
    setSending(false);
  };

  return (
    <div className="cc-overlay" role="dialog" aria-modal="true">
      <div className="cc-window">
        <header className="cc-head">
          <button type="button" className="cc-back" onClick={onClose} aria-label="Back">
            <ArrowLeft size={20} />
          </button>
          <img className="cc-avatar" src={community.imageUrl || DEFAULT_AVATAR} alt="" />
          <div className="cc-title">
            <strong>{community.name}</strong>
            <span>
              <Users size={12} /> {community.memberCount} {community.memberCount === 1 ? 'member' : 'members'} · {community.onlineCount} online
            </span>
          </div>
        </header>

        <div className="cc-body">
          {messages.length === 0 && (
            <p className="cc-empty">Welcome to {community.name}. Start the conversation.</p>
          )}
          {messages.map(m => {
            const mine = m.senderId === meId;
            return (
              <div key={m.id} className={mine ? 'cc-row cc-mine' : 'cc-row'}>
                <div className="cc-bubble">
                  {!mine && <b className="cc-sender">{m.senderName}</b>}
                  <p>{m.body}</p>
                  <small>{time(m.createdAt)}</small>
                </div>
              </div>
            );
          })}
          <div ref={bottom} />
        </div>

        {error && <p className="cc-error">{error}</p>}

        <form className="cc-input" onSubmit={send}>
          <input
            value={text}
            onChange={e => setText(e.target.value)}
            placeholder="Type a message"
            maxLength={2000}
          />
          <button type="submit" disabled={sending || !text.trim()} aria-label="Send">
            <Send size={18} />
          </button>
        </form>
      </div>
    </div>
  );
}