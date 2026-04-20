import api from '../api/axios';
import type { AuditEvent, PaginatedResponse } from '../types';

export async function listAuditEvents(limit = 20, offset = 0) {
  const { data } = await api.get<PaginatedResponse<AuditEvent>>('/admin/audit', {
    params: { limit, offset }
  });
  return data;
}
