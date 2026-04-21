import api from '../api/axios';
import type { License, User } from '../types';

export async function listUsers() {
  const { data } = await api.get<User[]>('/admin/users');
  return data;
}

export async function createUser(payload: { username: string; password: string; email?: string; app_name?: string; role?: string }) {
  const { data } = await api.post<User>('/register', payload);
  return data;
}

export async function getUserLicenses(userId: number) {
  const { data } = await api.get<License[]>(`/admin/users/${userId}/licenses`);
  return data;
}

export async function deactivateUser(userId: number) {
  const { data } = await api.post<User>(`/admin/users/${userId}/deactivate`);
  return data;
}

export async function activateUser(userId: number) {
  const { data } = await api.post<User>(`/admin/users/${userId}/activate`);
  return data;
}

export async function deleteUser(userId: number) {
  const { data } = await api.delete<{ success: boolean }>(`/admin/users/${userId}`);
  return data;
}
