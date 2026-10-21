import { useEffect, useState } from 'react';
import './index.css';
import { Routes, Route, Navigate, useNavigate, useLocation } from 'react-router-dom';
import Header from './components/Header';
import Sidebar from './components/Sidebar';
import CreateProfileModal from './components/CreateProfileModal';
import VetNetwork from './pages/VetNetwork';
import ProfilePage from './pages/ProfilePage';
import MyProfilePage from './pages/MyProfilePage';
import ClinicalCases from './pages/ClinicalCases';
import Feed from './pages/Feed';
import { Search, CheckCircle2 } from 'lucide-react';
import { createVet, follow, unfollow, setMeId, getMeId } from './api';
import { appRoutes } from '../config/appRoutes';
import AdvertisePage from '../features/AdvertistPage/AdvertisePage';
import BenefitsPage from '../features/AdvertistPage/BenefitsPage';
import MessagesPage from '../features/messages/pages/MessagesPage';
import PresencePing from './PresencePing';
import CommunitiesPage from '../features/communities/CommunitiesPage';
import PostReportsPage from '../features/reports/PostReportsPage';
import './light-blue-theme.css';
import './light-blue-extra.css';
import JoinCommunityPage from '../features/communities/JoinCommunityPage';
import {
  AdvantagePage,
  CreateProfessionalPage,
  ProfessionalProfilePage,
} from '../features/profiles/pages/ProfessionalPages';
import SearchDiscover from './pages/SearchDiscover';
import SavedVideosPage from '../features/shortvideos/pages/SavedVideosPage';
import WatchHistoryPage from '../features/shortvideos/pages/WatchHistoryPage';
import TeamReviewPage from '../features/team/TeamReviewPage';
import './profile-card-blue.css';

const pages = {
  Feed: '/feed',
  'Vet network': '/network',
  'Clinical cases': '/clinical-cases',
  'Short videos': appRoutes.shortVideos,
  Messages: appRoutes.messages,
  'My profile': '/my-profile',
  Communities: '/communities',
  Search: appRoutes.search,
  'Member benefits': appRoutes.benefits,
  Advertise: appRoutes.advertise,
    Reports: '/reports',
};

export default function NetworkApp() {
  const navigate = useNavigate();
  const location = useLocation();
  const [active, setActive] = useState('Feed');
  const [modal, setModal] = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);
  const [globalQuery, setGlobalQuery] = useState('');
  const [toast, setToast] = useState('');
  const [refreshKey, setRefreshKey] = useState(0);

  useEffect(() => {
    const path = location.pathname;
    if (path.startsWith('/profile')) {
      setActive('Vet network');
      return;
    }
    const found = Object.keys(pages).find(
      label => path === pages[label] || path.startsWith(pages[label] + '/')
    );
    setActive(found || 'Feed');
  }, [location.pathname]);

  const showToast = (text, time = 2800) => {
    setToast(text);
    setTimeout(() => setToast(''), time);
  };

  const go = label => {
    setActive(label);
    navigate(pages[label] || '/feed');
  };

  const openCreate = () => {
    if (getMeId()) {
      showToast('You already have a professional page.');
      return;
    }
    setModal(true);
  };

  const create = async form => {
    const parts = form.city.split(',').map(x => x.trim());
    try {
      const vet = await createVet({
        fullName: form.name,
        specialty: form.specialty,
        city: parts[0] || form.city,
        state: parts[1] || 'India',
        bio: form.about,
        avatarUrl: '',
      });
      setMeId(vet.id);
      setModal(false);
      setRefreshKey(key => key + 1);
      navigate('/my-profile');
      showToast('Your professional page was created', 3000);
      return true;
    } catch (error) {
      showToast(error.message);
      return false;
    }
  };

  const view = p => navigate('/profile/' + p.slug);

  const connect = async p => {
    const meId = getMeId();
    if (!meId) {
      showToast('Create your professional page first.');
      setModal(true);
      return;
    }
    if (p.id === meId) {
      showToast('This is your own page');
      return;
    }
    try {
      if (p.following) {
        await unfollow(p.id, meId);
        showToast(`You unfollowed ${p.name}`);
      } else if (p.requested) {
        await unfollow(p.id, meId);
        showToast(`Request to ${p.name} cancelled`);
      } else {
        await follow(p.id, meId);
        showToast(`Request sent to ${p.name}`);
      }
      setRefreshKey(key => key + 1);
    } catch (error) {
      showToast(error.message);
    }
  };

  const back = () => {
    navigate('/network');
    setActive('Vet network');
  };

  const networkPage = (
    <VetNetwork
      onView={view}
      onConnect={connect}
      globalQuery={globalQuery}
      refreshKey={refreshKey}
    />
  );

  if (location.pathname.startsWith('/team-review')) {
    return <TeamReviewPage />;
  }

  return (
    <div className="app-shell">
      <Header
        onCreate={openCreate}
        query={globalQuery}
        setQuery={setGlobalQuery}
        onMenu={() => setMobileOpen(true)}
        onSearch={() => navigate(appRoutes.search)}
        onSelectDoctor={doctor => {
          setGlobalQuery('');
          navigate('/profile/' + doctor.slug);
        }}
      />
      <div className="app-layout">
       < PresencePing />
        <Sidebar
          active={active}
          onNavigate={go}
          onCreate={openCreate}
          open={mobileOpen}
          onClose={() => setMobileOpen(false)}
        />
        <Routes>
          <Route path="/" element={<Feed onExplore={() => go('Vet network')} onCreate={openCreate} />} />
          <Route path="/network" element={networkPage} />
          <Route path="/clinical-cases" element={<ClinicalCases />} />
          <Route
            path="/feed"
            element={<Feed onExplore={() => go('Vet network')} onCreate={openCreate} />}
          />
          <Route
            path="/my-profile"
            element={<MyProfilePage onCreate={openCreate} refreshKey={refreshKey} />}
          />
          <Route
            path="/profile/:slug"
            element={<ProfilePage onBack={back} onConnect={connect} refreshKey={refreshKey} />}
          />
          <Route
            path={appRoutes.shortVideos}
            element={
              <Feed
                key="videos"
                initialType="SHORT_VIDEO"
                onExplore={() => go('Vet network')}
                onCreate={openCreate}
              />
            }
          />
          <Route path={appRoutes.savedVideos} element={<SavedVideosPage />} />
          <Route path={appRoutes.watchHistory} element={<WatchHistoryPage />} />
          <Route path={appRoutes.messages} element={<MessagesPage />} />
               <Route path="/communities" element={<CommunitiesPage />} />
               <Route path="/communities/join/:code" element={<JoinCommunityPage />} />
               <Route path="/reports" element={<PostReportsPage />} />
          <Route
            path={appRoutes.search}
            element={
              <SearchDiscover onView={view} onConnect={connect} globalQuery={globalQuery} />
            }
          />
          <Route path={appRoutes.advertise} element={<AdvertisePage />} />
          <Route
            path={appRoutes.benefits}
            element={<BenefitsPage onCreate={openCreate} />}
          />
          <Route
            path={appRoutes.memberBenefits}
            element={<Navigate to={appRoutes.benefits} replace />}
          />
          <Route path={appRoutes.createProfessionalPage} element={<CreateProfessionalPage />} />
          <Route path="/professional/:id" element={<ProfessionalProfilePage />} />
          <Route path="/advantage/:topic" element={<AdvantagePage />} />
          <Route
            path="*"
            element={
              <div className="main-content">
                <div className="empty-state">
                  <Search size={32} />
                  <h3>{location.pathname.slice(1).replaceAll('-', ' ')}</h3>
                  <p>
                    This section is a UI preview. Use Vet network or Clinical cases to explore
                    the implemented pages.
                  </p>
                  <button className="button button-gold" onClick={() => go('Vet network')}>
                    Go to vet network
                  </button>
                </div>
              </div>
            }
          />
        </Routes>
      </div>
      <CreateProfileModal open={modal} onClose={() => setModal(false)} onCreate={create} />
      {toast && (
        <div className="toast">
          <CheckCircle2 size={18} />
          {toast}
        </div>
      )}
    </div>
  );
}