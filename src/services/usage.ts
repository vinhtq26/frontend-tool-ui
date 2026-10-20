import axios from 'axios';
import api from '../api/axios';
import type { ClientCredentials, LicenseUsage, QuotaSettings, QuotaExceededDetail, ResolveVideoRequest, ResolveVideoResponse } from '../types';

function clientAuth(licenseToken: string) {
  return { headers: { Authorization: `Bearer ${licenseToken}` } };
}

export async function getLicenseUsage(licenseKey: string) {
  const { data } = await api.get<LicenseUsage>(`/admin/licenses/${licenseKey}/usage`);
  return data;
}

export async function getQuotaSettings() {
  const { data } = await api.get<QuotaSettings>('/admin/settings/quota');
  return data;
}

export async function updateQuotaSettings(payload: Partial<QuotaSettings>) {
  const { data } = await api.put<QuotaSettings>('/admin/settings/quota', payload);
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

export function quotaExceededMessage(detail: QuotaExceededDetail) {
  if (detail.limit_type === 'daily') {
    return `Đã hết lượt tải hôm nay (${detail.daily_used ?? detail.daily_limit}/${detail.daily_limit})`;
  }
  return `Đã hết lượt tải tháng này (${detail.used}/${detail.limit})`;
}
