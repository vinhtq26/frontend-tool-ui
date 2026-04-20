import { addDays, subDays } from 'date-fns';
import type { AuditEvent, License, User } from '../types';

const now = new Date();

export const users: User[] = [
  { id: 1, username: 'alice', email: 'alice@acme.local', role: 'user', is_active: true, created_at: now.toISOString() },
  { id: 2, username: 'bob', email: 'bob@acme.local', role: 'user', is_active: true, created_at: now.toISOString() },
  { id: 3, username: 'ops-admin', email: 'ops@acme.local', role: 'admin', is_active: true, created_at: now.toISOString() }
];

export let licenses: License[] = [
  {
    license_key: '9kS2f3_ABCxyzQ-001',
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
    license_key: '9kS2f3_ABCxyzQ-002',
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
    license_key: '9kS2f3_ABCxyzQ-003',
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
