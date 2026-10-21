import { useState } from 'react';
import { Link2, Copy, Check } from 'lucide-react';

export default function InviteLink({ code }) {
  const [copied, setCopied] = useState(false);

  if (!code) return null;

  const link = window.location.origin + '/communities/join/' + code;

  const copy = async () => {
    try {
      await navigator.clipboard.writeText(link);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch {
      window.prompt('Copy this link', link);
    }
  };

  return (
    <div style={{ margin: '20px 0 6px' }}>
      <div style={{ marginBottom: 10 }}>
        <strong style={{ fontSize: 13, textTransform: 'uppercase', letterSpacing: 0.5, color: '#475569' }}>
          Invite link
        </strong>
      </div>
      <div
        style={{
          display: 'flex',
          alignItems: 'center',
          gap: 8,
          padding: '8px 10px',
          borderRadius: 8,
          background: '#f8fafc',
          border: '1px solid #e2e8f0',
        }}
      >
        <Link2 size={15} color="#64748b" style={{ flexShrink: 0 }} />
        <span
          style={{
            flex: 1,
            fontSize: 12.5,
            color: '#334155',
            overflow: 'hidden',
            textOverflow: 'ellipsis',
            whiteSpace: 'nowrap',
          }}
        >
          {link}
        </span>
        <button type="button" className="comm-btn-join" onClick={copy}>
          {copied ? <Check size={13} /> : <Copy size={13} />} {copied ? 'Copied' : 'Copy link'}
        </button>
      </div>
      <p style={{ fontSize: 12, color: '#64748b', margin: '6px 0 0' }}>
        Only doctors connected with you can join with this link.
      </p>
    </div>
  );
}