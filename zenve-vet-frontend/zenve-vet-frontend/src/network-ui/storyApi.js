import { getToken } from './authApi';

const BASE = 'http://localhost:8080/api';

async function call(path, options = {}) {
  const headers = { 'Content-Type': 'application/json' };
  const token = getToken();
  if (token) {
    headers['X-Auth-Token'] = token;
  }

  const response = await fetch(BASE + path, { ...options, headers });
  if (response.status === 204) {
    return null;
  }

  const data = await response.json().catch(() => null);
  if (!response.ok) {
    throw new Error(data?.message || 'Something went wrong');
  }
  return data;
}

export function recordStoryView(postId) {
  return call(`/posts/${postId}/story-views`, { method: 'POST' });
}

export function getStoryViewers(postId) {
  return call(`/posts/${postId}/story-views`);
}