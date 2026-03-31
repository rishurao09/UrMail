const API_BASE = 'http://localhost:8000/api';

async function apiFetch(path, options = {}) {
  const url = `${API_BASE}${path}`;
  const res = await fetch(url, {
    headers: { 'Content-Type': 'application/json', ...options.headers },
    ...options,
  });
  if (!res.ok) {
    const error = await res.json().catch(() => ({ detail: 'Request failed' }));
    throw new Error(error.detail || `HTTP ${res.status}`);
  }
  return res.json();
}

// Email APIs
export const fetchEmails = () => apiFetch('/emails');
export const fetchEmail = (id) => apiFetch(`/emails/${id}`);
export const processEmail = (id) => apiFetch(`/emails/${id}/process`, { method: 'POST' });
export const processAllEmails = () => apiFetch('/emails/process-all', { method: 'POST' });
export const sendReply = (id) => apiFetch(`/emails/${id}/send`, { method: 'POST' });
export const escalateEmail = (id) => apiFetch(`/emails/${id}/escalate`, { method: 'POST' });
export const correctReply = (id, correctedReply) =>
  apiFetch(`/emails/${id}/correct`, {
    method: 'POST',
    body: JSON.stringify({ email_id: id, corrected_reply: correctedReply }),
  });

// Dashboard APIs
export const fetchDashboardStats = () => apiFetch('/dashboard/stats');
export const fetchActionsLog = () => apiFetch('/dashboard/actions-log');

// Knowledge Base APIs
export const fetchKBs = (userId = 'demo_user') => apiFetch(`/kb/list?user_id=${userId}`);
export const createKB = (name, userId = 'demo_user') =>
  apiFetch('/kb/create', {
    method: 'POST',
    body: JSON.stringify({ name, user_id: userId }),
  });
export const deleteKB = (kbId, userId = 'demo_user') =>
  apiFetch(`/kb/${kbId}?user_id=${userId}`, { method: 'DELETE' });
export const checkKBLimit = (userId = 'demo_user') => apiFetch(`/kb/limit?user_id=${userId}`);

export const uploadDocument = async (kbId, file, userId = 'demo_user') => {
  const formData = new FormData();
  formData.append('file', file);
  formData.append('user_id', userId);
  const res = await fetch(`${API_BASE}/kb/${kbId}/upload`, {
    method: 'POST',
    body: formData,
  });
  if (!res.ok) {
    const error = await res.json().catch(() => ({ detail: 'Upload failed' }));
    throw new Error(error.detail);
  }
  return res.json();
};

// Demo APIs
export const runDemo = () => apiFetch('/demo/run', { method: 'POST' });
export const resetDemo = () => apiFetch('/demo/reset', { method: 'POST' });

// User APIs
export const fetchUser = (userId = 'demo_user') => apiFetch(`/user/${userId}`);
