/* eslint-disable react-hooks/set-state-in-effect */
import { useEffect, useState } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { LogOut } from 'lucide-react';
import { getVets, getMeId, DEFAULT_IMAGE } from '../api';
import { getUser } from '../authApi';
import { appRoutes } from '../../config/appRoutes';
import './meBadge.css';

export default function MeBadge({ onLogout }) {
  const navigate = useNavigate();
  const location = useLocation();
  const [doctor, setDoctor] = useState(null);
  const user = getUser();
  const meId = getMeId();

  useEffect(() => {
    if (!meId) {
      setDoctor(null);
      return;
    }
    getVets(meId)
      .then(list => setDoctor(list.find(v => v.id === meId) || null))
      .catch(() => setDoctor(null));
  }, [meId, location.pathname]);

  const hasPhoto = doctor && doctor.image !== DEFAULT_IMAGE;
  const initial = doctor ? doctor.name.replace(/^dr\.?\s*/i, '').charAt(0) : '?';

  const openProfile = () => {
    if (doctor) navigate('/profile/' + doctor.slug);
  };

  const logout = () => {
    localStorage.removeItem('zenve-user');
    localStorage.removeItem('zenve-vet-me');
    if (onLogout) onLogout();
    window.location.href = appRoutes.login;
  };

  return (
    <div className="mb-badge">
      <button className="mb-me" onClick={openProfile} disabled={!doctor} title="Open my page">
        <span className="mb-avatar">
          {hasPhoto ? <img src={doctor.image} alt="" /> : initial}
        </span>
        <span className="mb-text">
          <b>{doctor ? doctor.name : 'No doctor page yet'}</b>
          <small>{user ? user.email : ''}</small>
        </span>
      </button>
      <button className="mb-out" onClick={logout} title="Log out">
        <LogOut size={15} />
      </button>
    </div>
  );
}