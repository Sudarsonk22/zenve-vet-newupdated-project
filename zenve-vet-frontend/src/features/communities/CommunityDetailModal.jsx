/* eslint-disable react-hooks/set-state-in-effect, react-hooks/exhaustive-deps */
import { useEffect, useState } from 'react';
import { X, MessageCircle, CheckCircle2, Clock, ArrowRight, UserPlus } from 'lucide-react';
import { getCommunity, inviteDoctor } from './communityApi';
import { getVets, getMeId } from '../../network-ui/api';
import InviteLink from './InviteLink';

const DEFAULT_COVER =
  'https://images.unsplash.com/photo-1551076805-e1869033e561?auto=format&fit=crop&w=1200&q=80';
const DEFAULT_AVATAR =
  'https://images.unsplash.com/photo-1576091160550-2173dba999ef?auto=format&fit=crop&w=300&q=80';

function Initial({ name, size }) {
  return (
    <span
      style={{
        width: size,
        height: size,
        borderRadius: '50%',
        display: 'grid',
        placeItems: 'center',
        background: '#edf7f4',
        color: '#1b6355',
        fontWeight: 700,
        fontSize: size / 2.4,
        flexShrink: 0,
      }}
    >
      {name.replace(/^dr\.?\s*/i, '').charAt(0).toUpperCase()}
    </span>
  );
}

export default function CommunityDetailModal({
  community,
  open,
  onClose,
  onJoinRequest,
  onAcceptInvite,
  onDecline,
  onLeave,
  onOpenChat,
}) {
  const [members, setMembers] = useState([]);
  const [doctors, setDoctors] = useState([]);
  const [invited, setInvited] = useState([]);
  const [error, setError] = useState('');

  const id = community ? community.id : null;
  const isMember = community ? community.status === 'JOINED' : false;
  const isAdmin = community ? community.role === 'ADMIN' : false;

  useEffect(() => {
    setMembers([]);
    setInvited([]);
    setError('');
    if (!open || !id || !isMember) return;
    getCommunity(id)
      .then(detail => setMembers(detail.members))
      .catch(e => setError(e.message));
  }, [open, id, isMember]);

  useEffect(() => {
    if (!open || !isAdmin) return;
    getVets(getMeId())
      .then(list => setDoctors(list))
      .catch(() => setDoctors([]));
  }, [open, isAdmin]);

  if (!open || !community) return null;

  const isPending = community.status === 'REQUESTED';
  const isInvited = community.status === 'INVITED';

  const memberIds = members.map(m => m.vetId);
  const canInvite = doctors.filter(
    d => d.id !== getMeId() && !memberIds.includes(d.id) && (d.following || d.followsMe)
  );

  const invite = async doctor => {
    try {
      await inviteDoctor(id, doctor.id);
      setInvited([...invited, doctor.id]);
    } catch (e) {
      setError(e.message);
    }
  };

  return (
    <div className="comm-modal-overlay" onClick={onClose} role="dialog" aria-modal="true">
      <div className="comm-modal" style={{ maxWidth: 620 }} onClick={e => e.stopPropagation()}>
        <div style={{ position: 'relative' }}>
          <img src={DEFAULT_COVER} alt="" style={{ width: '100%', height: 140, objectFit: 'cover' }} />
          <button
            type="button"
            className="comm-modal-close"
            style={{ position: 'absolute', top: 12, right: 12, background: 'rgba(255,255,255,0.9)' }}
            onClick={onClose}
            aria-label="Close"
          >
            <X size={18} />
          </button>
        </div>

        <div className="comm-modal-body" style={{ marginTop: -32, paddingTop: 0 }}>
          <div style={{ display: 'flex', alignItems: 'flex-end', justifyContent: 'space-between', gap: 14, marginBottom: 14 }}>
            <img
              src={community.imageUrl || DEFAULT_AVATAR}
              alt={community.name}
              style={{
                width: 68,
                height: 68,
                borderRadius: '50%',
                border: '3px solid #fff',
                boxShadow: '0 4px 10px rgba(0,0,0,0.15)',
                objectFit: 'cover',
                background: '#fff',
              }}
            />
            <div style={{ display: 'flex', gap: 8, alignItems: 'center' }}>
              {isMember && (
                <span className="comm-status-badge accepted">
                  <CheckCircle2 size={13} /> Member
                </span>
              )}
              {isPending && (
                <span className="comm-status-badge pending">
                  <Clock size={13} /> Pending Approval
                </span>
              )}
              {isInvited && (
                <span className="comm-status-badge pending">
                  <UserPlus size={13} /> You are invited
                </span>
              )}
              {!isMember && !isPending && !isInvited && (
                <span className="comm-status-badge not-joined">Not Joined</span>
              )}
            </div>
          </div>

          <div>
            <div style={{ display: 'flex', alignItems: 'center', gap: 8, flexWrap: 'wrap' }}>
              <h2 style={{ fontSize: 21, fontWeight: 800, margin: 0, color: '#0f172a' }}>{community.name}</h2>
              {community.category && <span className="comm-cat-tag">{community.category}</span>}
            </div>
            <p style={{ fontSize: 13, color: '#64748b', margin: '4px 0 14px' }}>
              Led by {community.creatorName} · {community.memberCount} {community.memberCount === 1 ? 'member' : 'members'} ({community.onlineCount} online)
            </p>
          </div>

          <div style={{ margin: '14px 0' }}>
            <strong style={{ fontSize: 13, textTransform: 'uppercase', letterSpacing: 0.5, color: '#475569' }}>About this circle</strong>
            <p style={{ fontSize: 14, color: '#334155', lineHeight: 1.5, margin: '6px 0 0' }}>{community.description}</p>
          </div>

          {isMember && (
            <div style={{ margin: '20px 0 6px' }}>
              <div style={{ marginBottom: 10 }}>
                <strong style={{ fontSize: 13, textTransform: 'uppercase', letterSpacing: 0.5, color: '#475569' }}>
                  Members ({members.length})
                </strong>
              </div>
              <div style={{ display: 'flex', flexDirection: 'column', gap: 8, maxHeight: 180, overflowY: 'auto' }}>
                {members.map(m => (
                  <div
                    key={m.vetId}
                    style={{
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'space-between',
                      padding: '6px 8px',
                      borderRadius: 8,
                      background: '#f8fafc',
                    }}
                  >
                    <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                      <div style={{ position: 'relative' }}>
                        {m.imageUrl ? (
                          <img src={m.imageUrl} alt="" style={{ width: 34, height: 34, borderRadius: '50%', objectFit: 'cover' }} />
                        ) : (
                          <Initial name={m.name} size={34} />
                        )}
                        <span
                          title={m.online ? 'Online' : 'Offline'}
                          style={{
                            position: 'absolute',
                            right: -1,
                            bottom: -1,
                            width: 9,
                            height: 9,
                            borderRadius: '50%',
                            background: m.online ? '#22c55e' : '#cbd5e1',
                            border: '1.5px solid #fff',
                          }}
                        />
                      </div>
                      <div>
                        <strong style={{ fontSize: 13, color: '#1e293b', display: 'block' }}>{m.name}</strong>
                        <small style={{ fontSize: 11, color: m.online ? '#16a34a' : '#64748b' }}>
                          {m.online ? 'Online' : m.specialty}
                        </small>
                      </div>
                    </div>
                    {m.role === 'ADMIN' && (
                      <span style={{ fontSize: 11, background: '#e0f2fe', color: '#0369a1', padding: '2px 8px', borderRadius: 999, fontWeight: 700 }}>
                        Admin
                      </span>
                    )}
                  </div>
                ))}
              </div>
            </div>
          )}

          {isAdmin && <InviteLink code={community.inviteCode} />}

          {isAdmin && (
            <div style={{ margin: '20px 0 6px' }}>
              <div style={{ marginBottom: 10 }}>
                <strong style={{ fontSize: 13, textTransform: 'uppercase', letterSpacing: 0.5, color: '#475569' }}>
                  Invite doctors
                </strong>
              </div>
              {canInvite.length === 0 && (
                <p style={{ fontSize: 13, color: '#64748b', margin: 0 }}>
                  You can only invite doctors you are connected with. Follow doctors in the vet network and
                  they will show up here once connected.
                </p>
              )}
              <div style={{ display: 'flex', flexDirection: 'column', gap: 8, maxHeight: 180, overflowY: 'auto' }}>
                {canInvite.map(d => (
                  <div
                    key={d.id}
                    style={{
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'space-between',
                      padding: '6px 8px',
                      borderRadius: 8,
                      background: '#f8fafc',
                    }}
                  >
                    <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                      <Initial name={d.name} size={34} />
                      <div>
                        <strong style={{ fontSize: 13, color: '#1e293b', display: 'block' }}>{d.name}</strong>
                        <small style={{ fontSize: 11, color: '#64748b' }}>{d.specialty}</small>
                      </div>
                    </div>
                    {invited.includes(d.id) ? (
                      <span className="comm-status-badge pending">
                        <Clock size={13} /> Invited
                      </span>
                    ) : (
                      <button type="button" className="comm-btn-join" onClick={() => invite(d)}>
                        <UserPlus size={13} /> Invite
                      </button>
                    )}
                  </div>
                ))}
              </div>
            </div>
          )}

          {error && <p style={{ color: '#dc2626', fontSize: 13, margin: '10px 0 0' }}>{error}</p>}
        </div>

        <div className="comm-modal-footer">
          <button type="button" className="comm-btn-secondary" onClick={onClose}>
            Close
          </button>
          {isMember && !isAdmin && (
            <button
              type="button"
              className="comm-btn-secondary"
              onClick={() => {
                onLeave(community.id);
                onClose();
              }}
            >
              Leave
            </button>
          )}
          {isMember ? (
            <button
              type="button"
              className="comm-btn-chat"
              onClick={() => {
                onClose();
                onOpenChat(community);
              }}
            >
              <MessageCircle size={16} /> Open Community Chat
            </button>
          ) : isPending ? (
            <button type="button" className="comm-btn-secondary" onClick={() => onDecline(community.id)}>
              <Clock size={15} /> Cancel Request
            </button>
          ) : isInvited ? (
            <>
              <button type="button" className="comm-btn-secondary" onClick={() => onDecline(community.id)}>
                Decline
              </button>
              <button type="button" className="comm-btn-join" onClick={() => onAcceptInvite(community.id)}>
                Accept Invite <ArrowRight size={14} />
              </button>
            </>
          ) : (
            <button type="button" className="comm-btn-join" onClick={() => onJoinRequest(community.id)}>
              Request to Join <ArrowRight size={14} />
            </button>
          )}
        </div>
      </div>
    </div>
  );
}