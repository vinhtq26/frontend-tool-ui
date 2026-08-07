import axios from 'axios';
import { authStorage } from '../contexts/AuthContext';

const useMsw = import.meta.env.VITE_USE_MSW === 'true';
const backendBaseURL = import.meta.env.VITE_API_BASE_URL?.trim() || 'http://localhost:8000';
const resolvedBaseURL = useMsw ? '/' : backendBaseURL;

console.log('[API] Connecting to host:', resolvedBaseURL);

const api = axios.create({
  // In mock mode, keep requests same-origin so the MSW service worker can intercept them.
  // Otherwise always call the configured backend directly instead of going through a frontend proxy.
  baseURL: resolvedBaseURL,
  timeout: 10_000,
  withCredentials: true
});

function readCookie(name: string) {
  return document.cookie
    .split('; ')
    .find((cookie) => cookie.startsWith(`${name}=`))
    ?.split('=')[1];
}

api.interceptors.request.use((config) => {
  const token = authStorage.getToken();
  const adminToken = import.meta.env.VITE_ADMIN_TOKEN;

  if (token && config.headers) {
    config.headers.Authorization = `Bearer ${token}`;
  }

  if (config.url?.startsWith('/admin') && adminToken && config.headers) {
    config.headers['X-Admin-Token'] = adminToken;
  }

  const csrf = readCookie('csrf_token');
  if (csrf && config.headers) {
    config.headers['X-CSRF-Token'] = csrf;
  }

  return config;
});

export default api;
