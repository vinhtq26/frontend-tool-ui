import axios from 'axios';
import api from '../api/axios';
import type { ClientCredentials, LicenseUsage, QuotaExceededDetail, ResolveVideoRequest, ResolveVideoResponse } from '../types';

function clientAuth(licenseToken: string) {
  return { headers: { Authorization: `Bearer ${licenseToken}` } };
}

export async function getLicenseUsage(licenseKey: string) {
  const { data } = await api.get<LicenseUsage>(`/admin/licenses/${licenseKey}/usage`);
  return data;
}

export async function getClientUsage(payload: ClientCredentials) {
  const { data } = await api.post<LicenseUsage>('/api/usage', payload, clientAuth(payload.license_token));
  return data;
}

export async function resolveVideo(payload: ResolveVideoRequest) {
  const { data } = await api.post<ResolveVideoResponse>('/api/resolve-video', payload, clientAuth(payload.license_token));
  return data;
}

export function getQuotaExceeded(error: unknown): QuotaExceededDetail | null {
  if (!axios.isAxiosError(error) || error.response?.status !== 429) return null;
  const detail = error.response.data?.detail;
  return detail && typeof detail === 'object' && detail.code === 'quota_exceeded' ? (detail as QuotaExceededDetail) : null;
}

export function quotaExceededMessage(detail: Pick<LicenseUsage, 'used' | 'limit'>) {
  return `Bạn đã hết lượt tải tháng này (${detail.used}/${detail.limit})`;
}
