/* eslint-disable react-hooks/set-state-in-effect, react-hooks/exhaustive-deps */
import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Pencil, FileText, Video, Stethoscope, MapPin } from 'lucide-react';
import { getVets, getVet, updateVet, getPosts, getMeId, DEFAULT_IMAGE } from '../api';
import PostCard from '../components/PostCard';
import EditProfileModal from '../components/EditProfileModal';
import BannerEdit from '../components/BannerEdit';
import './myProfile.css';
import './myProfileDesktop.css';

const tabs = [
  { name: 'Posts', type: 'POST', icon: FileText },
  { name: 'Videos', type: 'SHORT_VIDEO', icon: Video },
  { name: 'Cases', type: 'CLINICAL_CASE', icon: Stethoscope },
];

export default function MyProfilePage({ onCreate, refreshKey }) {
  const navigate = useNavigate();
  const meId = getMeId();
  const [profile, setProfile] = useState(null);
  const [loaded, setLoaded] = useState(false);
  const [tab, setTab] = useState(tabs[0]);
  const [items, setItems] = useState([]);
  const [postCount, setPostCount] = useState(0);
  const [editing, setEditing] = useState(false);
  const [message, setMessage] = useState('');
  const [reload, setReload] = useState(0);

  useEffect(() => {
    if (!meId) {
      setProfile(null);
      setLoaded(true);
      return;
    }
    getVets(meId)
      .then(list => {
        const me = list.find(v => v.id === meId);
        return me ? getVet(me.slug, meId) : null;
      })
      .then(vet => setProfile(vet))
      .catch(e => setMessage(e.message))
      .finally(() => setLoaded(true));
  }, [meId, refreshKey, reload]);

  const profileId = profile ? profile.id : null;

  useEffect(() => {
    if (!profileId) return;
    getPosts({ authorId: profileId, viewerId: meId, size: 1 })
      .then(page => setPostCount(page.totalItems))
      .catch(() => setPostCount(0));
  }, [profileId, reload]);

  useEffect(() => {
    setItems([]);
    if (!profileId) return;
    getPosts({ type: tab.type, authorId: profileId, viewerId: meId, size: 30 })
      .then(page => setItems(page.items))
      .catch(() => setItems([]));
  }, [profileId, tab, reload]);

  const save = async form => {
    await updateVet(profile.id, form);
    setEditing(false);
    setMessage('Your profile was updated.');
    setReload(reload + 1);
  };

  if (!loaded) {
    return (
      <main className="main-content mp-main">
        <p>Loading...</p>
      </main>
    );
  }

  if (!profile) {
    return (
      <main className="main-content mp-main">
        <div className="mp-empty">
          <h2>You do not have a profile yet</h2>
          <p>Create your professional page to post, share videos and connect with other doctors.</p>
          <button className="mp-btn mp-primary" onClick={onCreate}>
            Create your profile
          </button>
        </div>
      </main>
    );
  }

  const hasPhoto = profile.image !== DEFAULT_IMAGE;
  const initial = profile.name.replace(/^dr\.?\s*/i, '').charAt(0);
  const bannerStyle = profile.banner
    ? { backgroundImage: `url("${profile.banner}")`, position: 'relative' }
    : { position: 'relative' };

  return (
    <main className="main-content mp-main">
      <div className="mp-banner" style={bannerStyle}>
        <BannerEdit
          profile={profile}
          onChanged={() => setReload(reload + 1)}
          onError={setMessage}
        />
      </div>

      <section className="mp-head">
        <div className="mp-avatar">
          {hasPhoto ? <img src={profile.image} alt={profile.name} /> : <span>{initial}</span>}
        </div>

        <div className="mp-info">
          <div className="mp-top">
            <h1>{profile.name}</h1>
            <button className="mp-btn mp-primary" onClick={() => setEditing(true)}>
              <Pencil size={14} /> Edit profile
            </button>
          </div>

          <div className="mp-stats">
            <span>
              <b>{postCount}</b> posts
            </span>
            <span>
              <b>{profile.followersCount}</b> followers
            </span>
            <span>
              <b>{profile.followingCount}</b> following
            </span>
          </div>

          <p className="mp-specialty">{profile.specialty}</p>
          <p className="mp-place">
            <MapPin size={13} /> {profile.city}
          </p>
          <p className="mp-bio">
            {profile.about && profile.about.trim()
              ? profile.about
              : 'Add a short bio so other doctors know you better.'}
          </p>
        </div>
      </section>

      {message && <p className="mp-message">{message}</p>}

      <nav className="mp-tabs">
        {tabs.map(t => {
          const Icon = t.icon;
          return (
            <button
              key={t.name}
              className={tab.name === t.name ? 'mp-tab mp-tab-active' : 'mp-tab'}
              onClick={() => setTab(t)}
            >
              <Icon size={15} /> {t.name}
            </button>
          );
        })}
      </nav>

      <section className="mp-list">
        {items.length === 0 && (
          <div className="mp-none">
            <p>No {tab.name.toLowerCase()} yet.</p>
            <button className="mp-btn" onClick={() => navigate('/feed')}>
              Go to feed to share something
            </button>
          </div>
        )}
        {items.map(p => (
          <PostCard key={p.id} post={p} />
        ))}
      </section>

      <EditProfileModal
        open={editing}
        profile={profile}
        onClose={() => setEditing(false)}
        onSave={save}
      />
    </main>
  );
}