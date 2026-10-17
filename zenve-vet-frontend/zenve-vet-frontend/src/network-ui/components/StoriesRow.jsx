/* eslint-disable react-hooks/set-state-in-effect, react-hooks/exhaustive-deps */
import { useEffect, useState } from 'react';
import { ArrowUpRight, Plus } from 'lucide-react';
import { getPosts, getVets, getMeId, mediaSrc, DEFAULT_IMAGE } from '../api';
import StoryAvatar from './StoryAvatar';
import StoryViewer from './StoryViewer';
import AddStoryModal from './AddStoryModal';
import './stories.css';

const DAY = 24 * 60 * 60 * 1000;
const SEEN_KEY = 'zenve-seen-stories';

function loadSeen() {
  try {
    return JSON.parse(localStorage.getItem(SEEN_KEY)) || {};
  } catch {
    return {};
  }
}

function saveSeen(seen) {
  try {
    localStorage.setItem(SEEN_KEY, JSON.stringify(seen));
  } catch {
    // ignore
  }
}

function groupStories(posts, allowed) {
  const map = new Map();
  posts.forEach(p => {
    if (!p.author || !allowed.has(p.author.id)) return;
    if (Date.now() - new Date(p.createdAt).getTime() > DAY) return;
    if (!map.has(p.author.id)) map.set(p.author.id, { author: p.author, items: [] });
    map.get(p.author.id).items.push(p);
  });

  const groups = [...map.values()];
  groups.forEach(group => {
    group.items.sort((a, b) => new Date(a.createdAt) - new Date(b.createdAt));
  });
  groups.sort((a, b) => {
    const lastA = a.items[a.items.length - 1].createdAt;
    const lastB = b.items[b.items.length - 1].createdAt;
    return new Date(lastB) - new Date(lastA);
  });
  return groups;
}

const firstName = name => name.replace(/^dr\.?\s*/i, '').split(' ')[0];

export default function StoriesRow() {
  const meId = getMeId();
  const [groups, setGroups] = useState([]);
  const [me, setMe] = useState(null);
  const [seen, setSeen] = useState(loadSeen);
  const [viewer, setViewer] = useState(null);
  const [adding, setAdding] = useState(false);
  const [reload, setReload] = useState(0);

  useEffect(() => {
    Promise.all([getPosts({ type: 'STORY', size: 50, viewerId: meId }), getVets(meId)])
      .then(([page, vets]) => {
        const allowed = new Set(vets.filter(v => v.following).map(v => v.id));
        if (meId) allowed.add(meId);
        setGroups(groupStories(page.items, allowed));
        setMe(vets.find(v => v.id === meId) || null);
      })
      .catch(() => {});
  }, [reload]);

  const own = groups.find(g => g.author.id === meId);
  const others = groups.filter(g => g.author.id !== meId);
  const ordered = own ? [own, ...others] : others;

  const markSeen = (authorId, time) => {
    const t = new Date(time).getTime();
    setSeen(old => {
      if ((old[authorId] || 0) >= t) return old;
      const updated = { ...old, [authorId]: t };
      saveSeen(updated);
      return updated;
    });
  };

  const hasUnseen = group => {
    const last = group.items[group.items.length - 1];
    return new Date(last.createdAt).getTime() > (seen[group.author.id] || 0);
  };

  const openAdd = () => {
    if (!meId) {
      window.alert('Create your professional page first.');
      return;
    }
    setAdding(true);
  };

  const closeViewer = () => {
    setViewer(null);
    setReload(reload + 1);
  };

  const ownPhoto = me && me.image !== DEFAULT_IMAGE ? me.image : '';

  return (
    <section className="st-section">
      <div className="zv-section-head">
        <span>Moments from the community</span>
        <span className="zv-section-link">
          STORIES <ArrowUpRight size={12} />
        </span>
      </div>

      <div className="st-row">
        <div className="st-item">
          <button
            className={own ? (hasUnseen(own) ? 'st-ring' : 'st-ring st-ring-seen') : 'st-ring st-ring-none'}
            onClick={() => (own ? setViewer(0) : openAdd())}
          >
            <span className="st-photo">
              <StoryAvatar src={ownPhoto} name={me ? me.name : 'You'} />
            </span>
          </button>
          <button className="st-plus" onClick={openAdd} aria-label="Add story">
            <Plus size={12} />
          </button>
          <small>Your story</small>
        </div>

        {others.map((group, index) => (
          <div className="st-item" key={group.author.id}>
            <button
              className={hasUnseen(group) ? 'st-ring' : 'st-ring st-ring-seen'}
              onClick={() => setViewer(own ? index + 1 : index)}
            >
              <span className="st-photo">
                <StoryAvatar src={mediaSrc(group.author.avatarUrl)} name={group.author.fullName} />
              </span>
            </button>
            <small>{firstName(group.author.fullName)}</small>
          </div>
        ))}

        {others.length === 0 && (
          <p className="st-hint">Follow doctors to see their stories here.</p>
        )}
      </div>

      {viewer !== null && (
        <StoryViewer
          groups={ordered}
          startIndex={viewer}
          onSeen={markSeen}
          onClose={closeViewer}
        />
      )}

      <AddStoryModal
        open={adding}
        onClose={() => setAdding(false)}
        onPosted={() => setReload(reload + 1)}
      />
    </section>
  );
}