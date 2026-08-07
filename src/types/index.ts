export type Role = 'admin' | 'user';

export interface LoginResponse {
  access_token: string;
}

export interface User {
  id: number;
  username: string;
  email?: string;
  app_name?: string;
  is_active?: boolean;
  role?: Role;
  created_at: string;
}

export interface Application {
  id: number;
  name: string;
  description: string | null;
  created_at: string;
  updated_at: string | null;
}

export interface License {
  id: number;
  license_key: string;
  license_token?: string | null;
  token?: string | null;
  owner_id: number | null;
  owner_username?: string | null;
  hwid: string | null;
  is_active: boolean;
  duration_days: number;
  expiry_date: string | null;
  last_check: string | null;
  created_at?: string;
}

export interface PaginatedResponse<T> {
  total: number;
  items: T[];
}

export interface AuditEvent {
  id: string;
  event: 'created' | 'activated' | 'assigned' | 'revoked' | 'renewed' | 'deactivated' | 'deleted';
  actor: string;
  timestamp: string;
  target: string;
  detail?: string;
}

export interface DashboardStats {
  total: number;
  active: number;
  expired: number;
  pending: number;
}

export interface TrendItem {
  week: string;
  activations: number;
}
