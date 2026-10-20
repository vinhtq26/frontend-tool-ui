import { AxiosError, AxiosHeaders } from 'axios';
import { getQuotaExceeded, quotaExceededMessage } from './usage';

function axiosError(status: number, data: unknown) {
  const config = { headers: new AxiosHeaders() };
  return new AxiosError('Request failed', 'ERR_BAD_REQUEST', config, null, {
    status,
    statusText: '',
    headers: {},
    config,
    data
  });
}

describe('getQuotaExceeded', () => {
  it('detects the monthly quota error', () => {
    const detail = { code: 'quota_exceeded', message: 'limit', plan: 'free', plan_expiry: null, period: '2026-10', used: 30, limit: 30, remaining: 0 };
    const result = getQuotaExceeded(axiosError(429, { detail }));
    expect(result).toEqual(detail);
    expect(quotaExceededMessage(result!)).toBe('Bạn đã hết lượt tải tháng này (30/30)');
  });

  it('ignores other errors', () => {
    expect(getQuotaExceeded(axiosError(403, { detail: 'license revoked' }))).toBeNull();
    expect(getQuotaExceeded(axiosError(429, { detail: 'Too many requests' }))).toBeNull();
    expect(getQuotaExceeded(new Error('boom'))).toBeNull();
  });
});
