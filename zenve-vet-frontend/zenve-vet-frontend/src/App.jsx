/* eslint-disable react-hooks/set-state-in-effect */
import { useEffect, useState } from 'react';
import { BrowserRouter, useLocation } from 'react-router-dom';
import NetworkApp from './network-ui/NetworkApp';
import AuthPage from './network-ui/pages/AuthPage';
import { getUser, getMe, saveUser, logout } from './network-ui/authApi';
import './App.css';
import './network-ui/pages/authPage.css';

function Shell() {
  const [user, setUser] = useState(getUser());
  const [ready, setReady] = useState(!getUser());
  const location = useLocation();

  useEffect(() => {
    if (!getUser()) return;
    getMe()
      .then(fresh => {
        saveUser(fresh);
        setUser(fresh);
      })
      .catch(error => {
        if (error.status === 401) {
          logout();
          setUser(null);
        }
      })
      .finally(() => setReady(true));
  }, []);

  if (location.pathname.startsWith('/team-review')) {
    return <NetworkApp />;
  }

  if (!ready) {
    return null;
  }

  if (!user) {
    return <AuthPage onLoggedIn={setUser} />;
  }

  return <NetworkApp />;
}

export default function App() {
  return (
    <BrowserRouter>
      <Shell />
    </BrowserRouter>
  );
}