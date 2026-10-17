/* eslint-disable react-hooks/set-state-in-effect, react-hooks/exhaustive-deps */
import { useEffect, useMemo, useState } from 'react';
import {
  Users,
  Plus,
  Search,
  MessageCircle,
  Clock,
  CheckCircle2,
  ArrowRight,
  UserCheck,
  UserPlus,
} from 'lucide-react';
import {
  getCommunities,
  getJoinRequests,
  createCommunity,
  requestToJoin,
  acceptJoinRequest,
  rejectJoinRequest,
  acceptInvite,
  declineInvite,
  leaveCommunity,
} from './communityApi';
import CommunityDetailModal from './CommunityDetailModal';
import CreateCommunityModal from './CreateCommunityModal';
import CommunityChat from './CommunityChat';
import JoinRequestsList from './JoinRequestsList';
import './communities.css';

const CATEGORIES = [
  'All',
  'Surgery & Anaesthesia',
  'Internal Medicine',
  'Emergency Care',
  'Equine Medicine',
  'Exotics & Wildlife',
];

const DEFAULT_COVER =
  'https://images.unsplash.com/photo-1551076805-e1869033e561?auto=format&fit=crop&w=1200&q=80';
const DEFAULT_AVATAR =
  'https://images.unsplash.com/photo-1576091160550-2173dba999ef?auto=format&fit=crop&w=300&q=80';

export default function CommunitiesPage() {
  const [communities, setCommunities] = useState([]);
  const [joinRequests, setJoinRequests] = useState([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('explore');
  const [selectedCat, setSelectedCat] = useState('All');
  const [searchQuery, setSearchQuery] = useState('');
  const [detailId, setDetailId] = useState(null);
  const [chatId, setChatId] = useState(null);
  const [createModalOpen, setCreateModalOpen] = useState(false);
  const [toast, setToast] = useState('');

  const showToast = msg => {
    setToast(msg);
    setTimeout(() => setToast(''), 3200);
  };

  const load = async () => {
    try {
      const [list, requests] = await Promise.all([getCommunities(), getJoinRequests()]);
      setCommunities(list);
      setJoinRequests(requests);
    } catch (e) {
      showToast(e.message);
    }
    setLoading(false);
  };

  useEffect(() => {
    load();
    const timer = setInterval(load, 30000);
    return () => clearInterval(timer);
  }, []);


  const act = async (action, successMessage) => {
    try {
      await action();
      if (successMessage) showToast(successMessage);
      await load();
    } catch (e) {
      showToast(e.message);
    }
  };

  const detailComm = communities.find(c => c.id === detailId) || null;
  const chatComm = communities.find(c => c.id === chatId) || null;

  const handleCreateCommunity = async form => {
    const created = await createCommunity(form);
    showToast(`Community "${created.name}" created successfully!`);
    setActiveTab('my');
    await load();
  };

  const handleJoinRequest = id => {
    const comm = communities.find(c => c.id === id);
    act(() => requestToJoin(id),
     `Join request submitted to ${comm ? comm.creatorName : 'the admin'}.`);
  };

  const handleAcceptInvite = id => act(() => acceptInvite(id), 'You joined the community.');
  const handleDecline = id => act(() => declineInvite(id), 'Done.');
  const handleLeave = id => act(() => leaveCommunity(id), 'You left the community.');

  const handleAcceptRequest = req =>
    act(() => acceptJoinRequest(req.communityId, req.vetId),
   `Accepted ${req.name} into ${req.communityName}.`);

  const handleRejectRequest = req =>
    act(() => rejectJoinRequest(req.communityId, req.vetId),
   `Declined join request from ${req.name}.`);

  const filteredCommunities = useMemo(() => {
    let list = communities;
    if (activeTab === 'my') {
      list = list.filter(c => c.status === 'JOINED');
    }
    if (selectedCat !== 'All') {
      list = list.filter(c => c.category?.toLowerCase().includes(selectedCat.toLowerCase()));
    }
    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase();
      list = list.filter(
        c =>
          c.name.toLowerCase().includes(q) ||
          c.description.toLowerCase().includes(q) ||
          c.category?.toLowerCase().includes(q)
      );
    }
    return list;
  }, [communities, activeTab, selectedCat, searchQuery]);

  const inviteCount = communities.filter(c => c.status === 'INVITED').length;

  return (
    <main className="main-content">
      <div className="comm-page">
        <header className="comm-header" style={{
           display: 'flex',
            alignItems: 'center',
             justifyContent: 'space-between',
              gap: 16 }}>

          <div>
            <span className="comm-eyebrow">PROFESSIONAL CIRCLES</span>

            <h1>Veterinary Communities</h1>
            <p>
              Collaborate in specialized clinical circles. Exchange case studies, surgical techniques,
              and evidence-based practice guidelines with trusted peers.
            </p>
          </div>
          <button
            type="button"
            className="comm-btn-join"
            onClick={() => setCreateModalOpen(true)}
            style={{ padding: '10px 18px', 
              fontSize: 13.5, flexShrink: 0,
               display: 'inline-flex',
                alignItems: 'center', gap: 6 }}
          >
            <Plus size={16} /> Create Community
          </button>
        </header>

        <div className="comm-nav-bar">
          <div className="comm-tabs">
            <button
              type="button"
              className={`comm-tab ${activeTab === 'explore' ? 'active' : ''}`}
              onClick={() => setActiveTab('explore')}
            >
              <Users size={16} /> Explore Communities
              {inviteCount > 0 && <span className="comm-badge">{inviteCount}</span>}
            </button>
            <button
              type="button"
              className={`comm-tab ${activeTab === 'my' ? 'active' : ''}`}
              onClick={() => setActiveTab('my')}
            >
              <UserCheck size={16} /> My Communities
            </button>
            <button
              type="button"
              className={`comm-tab ${activeTab === 'requests' ? 'active' : ''}`}
              onClick={() => setActiveTab('requests')}
            >
              <Clock size={16} /> Incoming Requests
              {joinRequests.length > 0 && <span className="comm-badge">{joinRequests.length}</span>}
            </button>
          </div>
        </div>

        {activeTab !== 'requests' && (
          <div className="comm-search-row">
            <div className="comm-search-input">
              <Search size={16} color="#718096" />
              <input
                type="search"
                placeholder="Search circles by name or clinical focus…"
                value={searchQuery}
                onChange={e => setSearchQuery(e.target.value)}
              />
            </div>

            <div className="comm-category-pills">
              {CATEGORIES.map(cat => (
                <button
                  key={cat}
                  type="button"
                  className={`comm-cat-pill ${selectedCat === cat ? 'active' : ''}`}
                  onClick={() => setSelectedCat(cat)}
                >
                  {cat}
                </button>
              ))}
            </div>
          </div>
        )}

        {activeTab === 'requests' ? (
          <div>
            <div style={{ marginBottom: 16 }}>
              <h2 style={{ fontSize: 18,
                 fontWeight: 700, margin: '0 0 4px', 
                 color: '#1e293b' }}>
                Join Requests for Your Communities
              </h2>
              <p style={{ fontSize: 13, color: '#64748b', margin: 0 }}>
                Review incoming membership applications. Approved doctors will immediately gain access to the community chat.
              </p>
            </div>
            <JoinRequestsList
              requests={joinRequests}
              onAccept={handleAcceptRequest}
              onReject={handleRejectRequest}
            />
          </div>
        ) : (
          <div>
            {loading ? (
              <p style={{ color: '#64748b', fontSize: 14 }}>Loading communities...</p>
            ) : filteredCommunities.length === 0 ? (
              <div
                style={{
                  textAlign: 'center',
                  padding: '60px 20px',
                  background: '#fff',
                  borderRadius: 16,
                  border: '1px solid #e2e8f0',
                }}
              >
                <Users size={36} color="#94a3b8" style={{ margin: '0 auto 12px' }} />
                <h3 style={{ fontSize: 18,
                   fontWeight: 700, margin: '0 0 6px',
                    color: '#1e293b' }}>
                  No Communities Found
                </h3>
                <p style={{ fontSize: 13.5,
                   color: '#64748b', margin: '0 auto 16px',
                    maxWidth: 360 }}>
                  {activeTab === 'my'
                    ? "You haven't joined any communities yet. Explore available circles or create your own."
                    : communities.length === 0
                      ? 'No communities yet. Be the first to create one.'
                      : 'Try clearing your search query or selecting a different specialty category.'}
                </p>
              </div>
            ) : (
              <div className="comm-grid">
                {filteredCommunities.map(comm => {
                  const isMember = comm.status === 'JOINED';
                  const isPending = comm.status === 'REQUESTED';
                  const isInvited = comm.status === 'INVITED';

                  return (
                    <article key={comm.id} className="comm-card">
                      <img src={DEFAULT_COVER} alt="" className="comm-card-cover" />
                      <div className="comm-card-body">
                        <img
                          src={comm.imageUrl || DEFAULT_AVATAR}
                          alt={comm.name}
                          className="comm-card-avatar"
                        />

                        <div className="comm-card-title-row">
                          <h3 className="comm-card-title">{comm.name}</h3>
                        </div>

                        {comm.category && (
                          <div style={{ marginBottom: 6 }}>
                            <span className="comm-cat-tag">{comm.category}</span>
                          </div>
                        )}

                        <p className="comm-card-desc">{comm.description}</p>

                        <div className="comm-meta-row">
                          <div className="comm-meta-item">
                            <Users size={14} />
                            <span>{comm.memberCount}
                               {comm.memberCount === 1 ? 'member' : 'members'}</span>
                          </div>
                          <div className="comm-meta-item">
                            <span
                              style={{
                                width: 7,
                                height: 7,
                                borderRadius: '50%',
                                background: '#22c55e',
                                display: 'inline-block',
                              }}
                            />
                            <span>{comm.onlineCount} online</span>
                          </div>
                        </div>

                        <div className="comm-card-footer">
                          <div>
                            {isMember && (
                              <span className="comm-status-badge accepted">
                                <CheckCircle2 size={13} /> Member
                              </span>
                            )}
                            {isPending && (
                              <span className="comm-status-badge pending">
                                <Clock size={13} /> Pending
                              </span>
                            )}
                            {isInvited && (
                              <span className="comm-status-badge pending">
                                <UserPlus size={13} /> Invited
                              </span>
                            )}
                            {!isMember && !isPending && !isInvited && (
                              <span className="comm-status-badge not-joined">Not Joined</span>
                            )}
                          </div>

                          <div style={{ display: 'flex', gap: 8, alignItems: 'center' }}>
                            <button
                              type="button"
                              className="comm-btn-secondary"
                              onClick={() => setDetailId(comm.id)}
                            >
                              Details
                            </button>

                            {isMember ? (
                              <button
                                type="button"
                                className="comm-btn-chat"
                                onClick={() => setChatId(comm.id)}
                                title="Open community chat"
                              >
                                <MessageCircle size={15} /> Chat
                              </button>
                            ) : isPending ? (
                              <button
                                type="button"
                                className="comm-btn-secondary"
                                disabled
                                style={{ opacity: 0.7 }}
                              >
                                Pending
                              </button>
                            ) : isInvited ? (
                              <button
                                type="button"
                                className="comm-btn-join"
                                onClick={() => handleAcceptInvite(comm.id)}
                              >
                                Accept Invite <ArrowRight size={13} />
                              </button>
                            ) : (
                              <button
                                type="button"
                                className="comm-btn-join"
                                onClick={() => handleJoinRequest(comm.id)}
                              >
                                Request to Join <ArrowRight size={13} />
                              </button>
                            )}
                          </div>
                        </div>
                      </div>
                    </article>
                  );
                })}
              </div>
            )}
          </div>
        )}

        <CommunityDetailModal
          community={detailComm}
          open={Boolean(detailComm)}
          onClose={() => setDetailId(null)}
          onJoinRequest={handleJoinRequest}
          onAcceptInvite={handleAcceptInvite}
          onDecline={handleDecline}
          onLeave={handleLeave}
          onOpenChat={comm => setChatId(comm.id)}
        />

        <CreateCommunityModal
          open={createModalOpen}
          onClose={() => setCreateModalOpen(false)}
          onCreate={handleCreateCommunity}
        />

        {chatComm && <CommunityChat community={chatComm} onClose={() => setChatId(null)} />}

        {toast && (
          <div className="toast">
            <CheckCircle2 size={18} />
            {toast}
          </div>
        )}
      </div>
    </main>
  );
}