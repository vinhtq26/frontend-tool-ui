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

export async function createLicense(payload: { duration_days: number; username?: string }) {
  const { data } = await api.post<License>('/admin/licenses', { duration_days: payload.duration_days });

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
