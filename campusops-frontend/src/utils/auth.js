const TOKEN_KEY = 'campusops_token';
const USER_KEY = 'campusops_user';
const REMEMBER_ID_KEY = 'campusops_remember_id';
const AUTO_LOGIN_KEY = 'campusops_auto_login';
const SESSION_EVENT = 'campusops_session_change';

function readJson(storage, key) {
  const raw = storage.getItem(key);
  if (!raw) return null;
  try {
    return JSON.parse(raw);
  } catch {
    storage.removeItem(key);
    return null;
  }
}

function notifySessionChange() {
  window.dispatchEvent(new Event(SESSION_EVENT));
}

export function getCurrentUser() {
  return readJson(localStorage, USER_KEY) || readJson(sessionStorage, USER_KEY);
}

export function getToken() {
  return localStorage.getItem(TOKEN_KEY) || sessionStorage.getItem(TOKEN_KEY);
}

export function setSession({ token, user, autoLogin = true }) {
  const storage = autoLogin ? localStorage : sessionStorage;
  const otherStorage = autoLogin ? sessionStorage : localStorage;
  otherStorage.removeItem(TOKEN_KEY);
  otherStorage.removeItem(USER_KEY);
  storage.setItem(TOKEN_KEY, token);
  storage.setItem(USER_KEY, JSON.stringify(user));
  localStorage.setItem(AUTO_LOGIN_KEY, autoLogin ? 'Y' : 'N');
  notifySessionChange();
}

export function clearSession() {
  localStorage.removeItem(TOKEN_KEY);
  localStorage.removeItem(USER_KEY);
  sessionStorage.removeItem(TOKEN_KEY);
  sessionStorage.removeItem(USER_KEY);
  localStorage.removeItem(AUTO_LOGIN_KEY);
  notifySessionChange();
}

export function getSavedUserId() {
  return localStorage.getItem(REMEMBER_ID_KEY) || '';
}

export function setSavedUserId(userId) {
  if (userId) {
    localStorage.setItem(REMEMBER_ID_KEY, userId);
  }
}

export function clearSavedUserId() {
  localStorage.removeItem(REMEMBER_ID_KEY);
}

export function isAutoLoginEnabled() {
  return localStorage.getItem(AUTO_LOGIN_KEY) === 'Y';
}

export function subscribeSession(listener) {
  window.addEventListener(SESSION_EVENT, listener);
  window.addEventListener('storage', listener);
  return () => {
    window.removeEventListener(SESSION_EVENT, listener);
    window.removeEventListener('storage', listener);
  };
}
