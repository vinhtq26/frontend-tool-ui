import api from '../api/axios';
import type { Application, PaginatedResponse } from '../types';

export interface ApplicationPayload {
  name: string;
  description?: string | null;
}

export async function listApplications(params: { limit?: number; offset?: number } = {}) {
  const { data } = await api.get<PaginatedResponse<Application>>('/admin/apps', {
    params: { limit: 100, offset: 0, ...params }
  });
  return data;
}

export async function getApplication(applicationId: number) {
  const { data } = await api.get<Application>(`/admin/apps/${applicationId}`);
  return data;
}

export async function createApplication(payload: ApplicationPayload) {
  const { data } = await api.post<Application>('/admin/apps', payload);
  return data;
}

export async function updateApplication(applicationId: number, payload: ApplicationPayload) {
  const { data } = await api.put<Application>(`/admin/apps/${applicationId}`, payload);
  return data;
}

export async function deleteApplication(applicationId: number) {
  const { data } = await api.delete<{ deleted: boolean }>(`/admin/apps/${applicationId}`);
  return data;
}
