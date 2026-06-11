export function getCurrentUser() {
  const raw = localStorage.getItem('campusops_user');
  return raw ? JSON.parse(raw) : null;
}

export function setSession({ token, user }) {
  localStorage.setItem('campusops_token', token);
  localStorage.setItem('campusops_user', JSON.stringify(user));
}

export function clearSession() {
  localStorage.removeItem('campusops_token');
  localStorage.removeItem('campusops_user');
}
