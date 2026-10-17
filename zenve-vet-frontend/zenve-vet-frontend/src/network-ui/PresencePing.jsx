import { useEffect } from 'react';

const BASE = import.meta.env.VITE_API_BASE_URL || 'http://localhost:8080/api';

function token() {
  try {
    return JSON.parse(localStorage.getItem('zenve-user')).token || '';
  } catch {
    return '';
  }
}

// tells the backend "this doctor is online" every 30 seconds while the tab is open
export default function PresencePing() {
  useEffect(() => {
    const ping = () => {
      if (document.visibilityState !== 'visible') return;
      fetch(BASE + '/presence/ping', {
        method: 'POST',
        headers: { 'X-Auth-Token': token() },
      }).catch(() => {});
    };

    ping();
    const timer = setInterval(ping, 30000);
    document.addEventListener('visibilitychange', ping);
    return () => {
      clearInterval(timer);
      document.removeEventListener('visibilitychange', ping);
    };
  }, []);

  return null;
}