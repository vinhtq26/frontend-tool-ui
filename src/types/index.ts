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
  plan_expiry?: string | null;
  usage?: LicenseUsage | null;
}

export type LicensePlan = 'free' | 'pro';

export interface LicenseUsage {
  plan: LicensePlan;
  plan_expiry: string | null;
  period: string;
  used: number;
  limit: number;
  remaining: number;
}

export interface ClientCredentials {
  license_token: string;
  machine_id: string;
}

export interface ResolveVideoRequest extends ClientCredentials {
  video_id: string;
}

export interface ResolveVideoResponse {
  video_id: string;
  url: string;
  content_key_hex: string;
  quality: string;
  duration: string;
  expires_at: number;
  customer: string;
  signature: string;
}

export interface QuotaExceededDetail extends LicenseUsage {
  code: 'quota_exceeded';
  message: string;
}

export interface KeyAuthRequest {
  license_key: string;
  hwid: string;
  app_name: string;
  machine_name?: string;
  device_fingerprint?: string;
}

export interface KeyAuthResponse {
  valid: boolean;
  message: string;
  license_key: string;
  license_token: string;
  expiry_date: string;
  server_time: string;
}

export interface LogFraudRequest {
  license_key: string;
  hwid: string;
  app_name: string;
  reason: string;
  machine_name?: string;
  device_fingerprint?: string;
}

export interface FraudLog {
  id: number;
  license_key: string;
  hwid: string;
  app_name: string;
  reason: string;
  machine_name?: string | null;
  device_fingerprint?: string | null;
  audit_event_id: number;
  timestamp: string;
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

export interface QuotaSettings {
  free_monthly_downloads: number;
  pro_monthly_downloads: number;
}
