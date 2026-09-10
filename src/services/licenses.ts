import api from '../api/axios';
import type { License, PaginatedResponse } from '../types';

export interface LicenseFilters {
  status?: string;
  owner?: string;
  search?: string;
  expiry_from?: string;
  expiry_to?: string;
  limit?: number;
  offset?: number;
}

export async function listLicenses(filters: LicenseFilters) {
  const { data } = await api.get<PaginatedResponse<License>>('/admin/licenses', {
    params: filters
  });
  return data;
}

export async function getLicenseDetail(licenseKey: string) {
  const { data } = await api.get<License>(`/admin/licenses/${licenseKey}`);
  return data;
}

export async function createLicense(payload: { duration_days: number; app_name: string; username?: string }) {
  const { data } = await api.post<License>('/admin/keys', {
    duration_days: payload.duration_days,
    app_name: payload.app_name
  });

  if (payload.username) {
    await assignLicense(data.license_key, { username: payload.username });
  }

  return data;
}

export async function assignLicense(licenseKey: string, payload: { username: string }) {
  const { data } = await api.post<License>(`/admin/licenses/${licenseKey}/assign`, payload);
  return data;
}

export async function revokeLicense(licenseKey: string) {
  const { data } = await api.post<License>(`/admin/licenses/${licenseKey}/revoke`);
  return data;
}

export async function renewLicense(licenseKey: string, payload: { extra_days: number }) {
  const { data } = await api.post<License>(`/admin/licenses/${licenseKey}/renew`, payload);
  return data;
}

export interface BatchDeleteLicensesResponse {
  requested: number;
  deleted: number[];
  not_found: number[];
  skipped_assigned: Array<{
    license_id: number;
    owner_id: number;
  }>;
  failed: unknown[];
}

export async function deleteLicensesBatch(licenseIds: number[]) {
  const { data } = await api.delete<BatchDeleteLicensesResponse>('/admin/licenses/batch', {
    data: { license_ids: licenseIds }
  });
  return data;
}
