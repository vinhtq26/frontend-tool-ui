import { addDays, subDays } from 'date-fns';
import type { Application, AuditEvent, License, LicenseUsage, User } from '../types';

const now = new Date();

export const applications: Application[] = [
  {
    id: 1,
    name: 'Tool Reup',
    description: 'Tool reup YouTube',
    created_at: now.toISOString(),
    updated_at: null
  },
  {
    id: 2,
    name: 'Admin Console',
    description: 'LicenseOps administration',
    created_at: now.toISOString(),
    updated_at: null
  }
];

export const users: User[] = [
  { id: 1, username: 'alice', email: 'alice@acme.local', app_name: 'Tool Reup', role: 'user', is_active: true, created_at: now.toISOString() },
  { id: 2, username: 'bob', email: 'bob@acme.local', app_name: 'Tool Reup', role: 'user', is_active: true, created_at: now.toISOString() },
  { id: 3, username: 'ops-admin', email: 'ops@acme.local', app_name: 'Admin Console', role: 'admin', is_active: true, created_at: now.toISOString() }
];

export let licenses: License[] = [
  {
    id: 10,
    license_key: '9kS2f3_ABCxyzQ-001',
    license_token: 'lic_tok_alice_001x8Kp2',
    owner_id: 1,
    owner_username: 'alice',
    hwid: 'hwid-123',
    is_active: true,
    duration_days: 30,
    expiry_date: addDays(now, 30).toISOString(),
    last_check: now.toISOString(),
    created_at: subDays(now, 2).toISOString()
  },
  {
    id: 11,
    license_key: '9kS2f3_ABCxyzQ-002',
    license_token: 'lic_tok_pool_002mN4z7',
    owner_id: null,
    owner_username: null,
    hwid: null,
    is_active: true,
    duration_days: 90,
    expiry_date: null,
    last_check: null,
    created_at: subDays(now, 1).toISOString()
  },
  {
    id: 12,
    license_key: '9kS2f3_ABCxyzQ-003',
    license_token: 'lic_tok_bob_003qR6t1',
    owner_id: 2,
    owner_username: 'bob',
    hwid: 'hwid-789',
    is_active: false,
    duration_days: 14,
    expiry_date: subDays(now, 1).toISOString(),
    last_check: subDays(now, 3).toISOString(),
    created_at: subDays(now, 12).toISOString()
  }
];

const FREE_MONTHLY_LIMIT = 30;
const mockUsedCounts: Record<string, number> = { '9kS2f3_ABCxyzQ-001': 12, '9kS2f3_ABCxyzQ-003': 30 };

export function buildUsage(license: License): LicenseUsage {
  const used = mockUsedCounts[license.license_key] ?? 0;
  return {
    plan: 'free',
    plan_expiry: null,
    period: `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}`,
    used,
    limit: FREE_MONTHLY_LIMIT,
    remaining: Math.max(0, FREE_MONTHLY_LIMIT - used)
  };
}

export function recordDownload(license: License) {
  mockUsedCounts[license.license_key] = (mockUsedCounts[license.license_key] ?? 0) + 1;
  license.usage = buildUsage(license);
}

licenses.forEach((license) => {
  license.usage = buildUsage(license);
});

export let audits: AuditEvent[] = [
  {
    id: 'evt-1',
    event: 'created',
    actor: 'ops-admin',
    timestamp: subDays(now, 2).toISOString(),
    target: '9kS2f3_ABCxyzQ-001',
    detail: 'Created license with 30-day duration'
  },
  {
    id: 'evt-2',
    event: 'assigned',
    actor: 'ops-admin',
    timestamp: subDays(now, 1).toISOString(),
    target: '9kS2f3_ABCxyzQ-001',
    detail: 'Assigned to alice'
  }
];

export function appendAudit(event: Omit<AuditEvent, 'id' | 'timestamp'>) {
  audits = [
    {
      id: crypto.randomUUID(),
      timestamp: new Date().toISOString(),
      ...event
    },
    ...audits
  ];
}
