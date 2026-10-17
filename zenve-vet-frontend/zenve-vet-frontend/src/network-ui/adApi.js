const BASE = import.meta.env.VITE_API_BASE_URL || 'http://localhost:8080/api';

function token() {
  try {
    return JSON.parse(localStorage.getItem('zenve-user')).token || '';
  } catch {
    return '';
  }
}

async function call(path, options = {}) {
  const res = await fetch(BASE + '/ads' + path, {
    ...options,
    headers: { 'Content-Type': 'application/json', 'X-Auth-Token': token() },
  });

  if (!res.ok) {
    let message = 'Something went wrong. Please try again.';
    try {
      const data = await res.json();
      message = data.message || data.error || message;
    } catch {
      // keep the default message
    }
    throw new Error(message);
  }

  if (res.status === 204) return null;
  return res.json();
}

export const getFeedAds = () => call('/feed');
export const viewAd = id => call('/' + id + '/view', { method: 'POST' });
export const clickAd = id => call('/' + id + '/click', { method: 'POST' });
export const getAdComments = id => call('/' + id + '/comments');
export const addAdComment = (id, body) =>
  call('/' + id + '/comments', { method: 'POST', body: JSON.stringify({ body }) });