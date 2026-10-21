const BASE = import.meta.env.VITE_API_BASE_URL || 'http://localhost:8080/api';

function token() {
  try {
    return JSON.parse(localStorage.getItem('zenve-user')).token || '';
  } catch {
    return '';
  }
}

async function call(path, options = {}) {
  const res = await fetch(BASE + '/communities' + path, {
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

const post = (path, body) =>
  call(path, { method: 'POST', body: body ? JSON.stringify(body) : undefined });

export const getCommunities = () => call('');
export const getCommunity = id => call('/' + id);
export const createCommunity = body => post('', body);

export const requestToJoin = id => post('/' + id + '/join');
export const getJoinRequests = () => call('/requests');
export const acceptJoinRequest = (id, vetId) => post('/' + id + '/requests/' + vetId + '/accept');
export const rejectJoinRequest = (id, vetId) => post('/' + id + '/requests/' + vetId + '/reject');

export const inviteDoctor = (id, vetId) => post('/' + id + '/invite', { vetId });
export const acceptInvite = id => post('/' + id + '/accept');
export const declineInvite = id => post('/' + id + '/decline');
export const leaveCommunity = id => post('/' + id + '/leave');

export const getLinkPreview = code => call('/invite-link/' + code);
export const joinByLink = code => post('/invite-link/' + code);

export const getMessages = (id, after = 0) => call('/' + id + '/messages?after=' + after);
export const sendMessage = (id, body) => post('/' + id + '/messages', { body });