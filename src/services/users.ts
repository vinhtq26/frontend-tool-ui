import api from '../api/axios';
import type { License, User } from '../types';

export async function listUsers() {
  const { data } = await api.get<User[]>('/admin/users');
  return data;
}

export async function createUser(payload: { username: string; password: string; email?: string; role?: string }) {
  const { data } = await api.post<User>('/register', payload);
  return data;
}

export async function getUserLicenses(userId: number) {
  const { data } = await api.get<License[]>(`/admin/users/${userId}/licenses`);
  return data;
}

export async function deactivateUser(userId: number) {
  const { data } = await api.post(`/admin/users/${userId}/deactivate`);
  return data;
}
