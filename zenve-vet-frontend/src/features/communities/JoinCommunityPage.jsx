import { useEffect, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { Users, ArrowRight, CheckCircle2 } from 'lucide-react';
import { getLinkPreview, joinByLink } from './communityApi';
import './communities.css';

export default function JoinCommunityPage() {
  const { code } = useParams();
  const navigate = useNavigate();
  const [community, setCommunity] = useState(null);
  const [error, setError] = useState('');
  const [busy, setBusy] = useState(false);

  useEffect(() => {
    getLinkPreview(code)
      .then(setCommunity)
      .catch(e => setError(e.message));
  }, [code]);

  const join = async () => {
    setBusy(true);
    setError('');
    try {
      await joinByLink(code);
      navigate('/communities');
    } catch (e) {
      setError(e.message);
    }
    setBusy(false);
  };

  return (
    <main className="main-content">
      <div className="comm-page" style={{ maxWidth: 520 }}>
        <div
          style={{
            background: '#fff',
            border: '1px solid #e2e8f0',
            borderRadius: 16,
            padding: 28,
            textAlign: 'left',
          }}
        >
          {!community && !error && <p style={{ color: '#64748b' }}>Loading...</p>}

          {community && (
            <>
              <span className="comm-eyebrow">YOU ARE INVITED</span>
              <h1 style={{ fontSize: 24, margin: '6px 0 4px' }}>{community.name}</h1>
              {community.category && <span className="comm-cat-tag">{community.category}</span>}
              <p style={{ fontSize: 14, color: '#334155', lineHeight: 1.5, margin: '12px 0' }}>
                {community.description}
              </p>
              <p style={{ fontSize: 13, color: '#64748b', margin: '0 0 18px' }}>
                <Users size={14} style={{ verticalAlign: -2 }} /> {community.memberCount}{' '}
                {community.memberCount === 1 ? 'member' : 'members'} · Led by {community.creatorName}
              </p>

              {community.status === 'JOINED' ? (
                <button type="button" className="comm-btn-chat" onClick={() => navigate('/communities')}>
                  <CheckCircle2 size={15} /> You are already a member
                </button>
              ) : (
                <button type="button" className="comm-btn-join" onClick={join} disabled={busy}>
                  {busy ? 'Joining...' : 'Join community'} <ArrowRight size={14} />
                </button>
              )}
            </>
          )}

          {error && <p style={{ color: '#dc2626', fontSize: 13, margin: '14px 0 0' }}>{error}</p>}
        </div>
      </div>
    </main>
  );
}