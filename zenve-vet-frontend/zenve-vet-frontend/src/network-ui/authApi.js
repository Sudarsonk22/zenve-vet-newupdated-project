const base = (import.meta.env.VITE_API_BASE_URL || 'http://localhost:8080/api').replace(/\/$/, '');
const KEY = 'zenve-user';
const ME_KEY = 'zenve-vet-me';

async function call(path, options) {
  const res = await fetch(base + path, options);
  const data = await res.json().catch(() => ({}));
  if (!res.ok) {
    const error = new Error(data.message || 'Something went wrong. Please try again.');
    error.status = res.status;
    throw error;
  }
  return data;
}

function post(path, body) {
  return call(path, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(body),
  });
}

export const signUp = body => post('/auth/signup', body);
export const signIn = body => post('/auth/login', body);
export const forgotPassword = body => post('/auth/forgot-password', body);
export const resetPassword = body => post('/auth/reset-password', body);
export const getMe = () => call('/auth/session', { headers: { 'X-Auth-Token': getToken() || '' } });

export function getUser() {
  try {
    return JSON.parse(localStorage.getItem(KEY));
  } catch {
    return null;
  }
}

export function getToken() {
  const user = getUser();
  return user ? user.token : null;
}

function syncMeId(user) {
  try {
    if (user && user.vetId) {
      localStorage.setItem(ME_KEY, String(user.vetId));
    } else {
      localStorage.removeItem(ME_KEY);
    }
  } catch {
    // ignore
  }
}

export function saveUser(user) {
  try {
    localStorage.setItem(KEY, JSON.stringify(user));
  } catch {
    // ignore
  }
  syncMeId(user);
}

export function updateUser(patch) {
  const user = getUser();
  if (!user) return;
  saveUser({ ...user, ...patch });
}

export function logout() {
  try {
    localStorage.removeItem(KEY);
    localStorage.removeItem(ME_KEY);
  } catch {
    // ignore
  }
}