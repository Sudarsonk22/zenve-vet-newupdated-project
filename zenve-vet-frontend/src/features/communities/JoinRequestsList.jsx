import { Check, X, Users } from 'lucide-react';

export default function JoinRequestsList({ requests, onAccept, onReject }) {
  if (!requests || requests.length === 0) {
    return (
      <div style={{ textAlign: 'center', padding: '60px 20px', background: '#fff', borderRadius: 16, border: '1px solid #e2e8f0' }}>
        <div style={{ width: 56, height: 56, borderRadius: '50%', background: '#f1f5f9', color: '#64748b', display: 'grid', placeItems: 'center', margin: '0 auto 12px' }}>
          <Users size={26} />
        </div>
        <h3 style={{ fontSize: 17, fontWeight: 700, margin: '0 0 6px', color: '#1e293b' }}>No Incoming Join Requests</h3>
        <p style={{ fontSize: 13.5, color: '#64748b', margin: 0, maxWidth: 360, marginInline: 'auto' }}>
          When veterinarians request to join communities you administer, their requests will appear here for your review.
        </p>
      </div>
    );
  }

  const formatDate = d => {
    try {
      return new Date(d).toLocaleDateString('en-GB', { day: 'numeric', month: 'short', year: 'numeric' });
    } catch {
      return 'Recently';
    }
  };

  return (
    <div className="comm-requests-list">
      {requests.map(req => (
        <div key={req.communityId + '-' + req.vetId} className="comm-request-card">
          <div className="comm-req-user">
            {req.imageUrl ? (
              <img src={req.imageUrl} alt={req.name} className="comm-req-avatar" />
            ) : (
              <span
                className="comm-req-avatar"
                style={{ display: 'grid', placeItems: 'center', background: '#edf7f4', color: '#1b6355', fontWeight: 700 }}
              >
                {req.name.replace(/^dr\.?\s*/i, '').charAt(0).toUpperCase()}
              </span>
            )}
            <div className="comm-req-info">
              <strong>{req.name}</strong>
              <span>{req.specialty}</span>
              <small>
                Applying to <b>{req.communityName}</b> · {formatDate(req.createdAt)}
              </small>
            </div>
          </div>

          <div className="comm-req-actions">
            <button type="button" className="comm-btn-reject" onClick={() => onReject(req)} title="Decline this request">
              <X size={15} /> Reject
            </button>
            <button type="button" className="comm-btn-accept" onClick={() => onAccept(req)} title="Approve membership">
              <Check size={15} /> Accept
            </button>
          </div>
        </div>
      ))}
    </div>
  );
}