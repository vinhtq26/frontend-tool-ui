import api from '../api/axios';
import type { LoginResponse } from '../types';

export async function login(payload: { username: string; password: string }) {
  const { data } = await api.post<LoginResponse>('/login', payload);
  return data;
}

export async function register(payload: { username: string; password: string; email?: string }) {
  const { data } = await api.post('/register', payload);
  return data;
}

export async function activate(payload: { username: string; license_key: string; hwid: string }) {
  const { data } = await api.post('/activate', payload);
  return data;
}

export async function verify(payload: { username: string; hwid: string }) {
  const { data } = await api.post('/verify', payload);
  return data;
}
