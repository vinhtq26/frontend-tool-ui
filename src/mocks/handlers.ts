import { http, HttpResponse } from 'msw';
import { addDays } from 'date-fns';
import { appendAudit, audits, licenses, users } from './data';
import type { License } from '../types';

function normalizeUsername(value?: string) {
  return value?.trim().toLowerCase() ?? '';
}

const mockPasswords = new Map<string, string>(
  users.map((user) => [normalizeUsername(user.username), 'password123'])
);

function buildToken(role: 'admin' | 'user', username: string) {
  const payload = btoa(JSON.stringify({ role, username, is_admin: role === 'admin' }));
  return `mock.${payload}.signature`;
}

function decodeToken(token?: string) {
  if (!token) return null;
  const segments = token.split('.');
  if (segments.length < 2) return null;
  try {
    return JSON.parse(atob(segments[1]));
  } catch {
    return null;
  }
}

export const handlers = [
  http.post('/login', async ({ request }) => {
    const body = (await request.json()) as { username: string; password: string };
    const normalizedUsername = normalizeUsername(body.username);
    const user = users.find((item) => normalizeUsername(item.username) === normalizedUsername);
    const expectedPassword = mockPasswords.get(normalizedUsername);
    console.log("user:", user)
    console.log("expectedPassword:", expectedPassword)
    console.log("body.password:", body.password)
    console.log("normalizedUsername:", normalizedUsername)
    if (!user || !expectedPassword || body.password !== expectedPassword) {
      return HttpResponse.json({ detail: 'Invalid credentials' }, { status: 401 });
    }
    return HttpResponse.json({ access_token: buildToken(user.role === 'admin' ? 'admin' : 'user', user.username) });
  }),

  http.post('/register', async ({ request }) => {
    const body = (await request.json()) as { username: string; password?: string; email?: string; role?: 'admin' | 'user' };
    const created = {
      id: users.length + 1,
      username: body.username.trim(),
      email: body.email,
      role: body.role ?? 'user',
      is_active: true,
      created_at: new Date().toISOString()
    };
    users.push(created);
    mockPasswords.set(normalizeUsername(created.username), body.password?.trim() || 'password123');
    return HttpResponse.json(created, { status: 201 });
  }),

  http.get('/admin/licenses', ({ request }) => {
    const url = new URL(request.url);
    const limit = Number(url.searchParams.get('limit') ?? 10);
    const offset = Number(url.searchParams.get('offset') ?? 0);
    const status = url.searchParams.get('status');
    const owner = (url.searchParams.get('owner') ?? '').toLowerCase();
    const search = (url.searchParams.get('search') ?? '').toLowerCase();
    const expiryFrom = url.searchParams.get('expiry_from');
    const expiryTo = url.searchParams.get('expiry_to');

    let filtered = licenses;

    if (status) {
      filtered = filtered.filter((item) => {
        if (status === 'active') return item.is_active;
        if (status === 'inactive') return !item.is_active;
        if (status === 'expired') return Boolean(item.expiry_date && new Date(item.expiry_date) < new Date());
        return true;
      });
    }

    if (owner) {
      filtered = filtered.filter((item) => (item.owner_username ?? '').toLowerCase().includes(owner));
    }

    if (search) {
      filtered = filtered.filter(
        (item) =>
          item.license_key.toLowerCase().includes(search) ||
          (item.owner_username ?? '').toLowerCase().includes(search)
      );
    }

    if (expiryFrom) {
      const from = new Date(expiryFrom);
      filtered = filtered.filter((item) => (item.expiry_date ? new Date(item.expiry_date) >= from : false));
    }

    if (expiryTo) {
      const to = new Date(expiryTo);
      filtered = filtered.filter((item) => (item.expiry_date ? new Date(item.expiry_date) <= to : false));
    }

    return HttpResponse.json({
      total: filtered.length,
      items: filtered.slice(offset, offset + limit)
    });
  }),

  http.post('/admin/licenses', async ({ request }) => {
    const body = (await request.json()) as { duration_days: number };
    const created: License = {
      license_key: `NEW-${Math.random().toString(36).slice(2, 10).toUpperCase()}`,
      owner_id: null,
      owner_username: null,
      hwid: null,
      is_active: true,
      duration_days: body.duration_days,
      expiry_date: null,
      last_check: null,
      created_at: new Date().toISOString()
    };
    licenses.unshift(created);
    appendAudit({ event: 'created', actor: 'ops-admin', target: created.license_key, detail: 'Created via dashboard' });
    return HttpResponse.json(created, { status: 201 });
  }),

  http.get('/admin/licenses/:licenseKey', ({ params }) => {
    const item = licenses.find((license) => license.license_key === params.licenseKey);
    if (!item) return HttpResponse.json({ detail: 'Not found' }, { status: 404 });
    return HttpResponse.json(item);
  }),

  http.post('/admin/licenses/:licenseKey/assign', async ({ params, request }) => {
    const body = (await request.json()) as { username: string };
    const item = licenses.find((license) => license.license_key === params.licenseKey);
    const owner = users.find((user) => user.username === body.username);
    if (!item || !owner) return HttpResponse.json({ detail: 'Invalid assignment' }, { status: 400 });
    item.owner_id = owner.id;
    item.owner_username = owner.username;
    appendAudit({ event: 'assigned', actor: 'ops-admin', target: item.license_key, detail: `Assigned to ${owner.username}` });
    return HttpResponse.json(item);
  }),

  http.post('/admin/licenses/:licenseKey/revoke', ({ params }) => {
    const item = licenses.find((license) => license.license_key === params.licenseKey);
    if (!item) return HttpResponse.json({ detail: 'Not found' }, { status: 404 });
    item.is_active = false;
    appendAudit({ event: 'revoked', actor: 'ops-admin', target: item.license_key, detail: 'Revoked by admin' });
    return HttpResponse.json(item);
  }),

  http.post('/admin/licenses/:licenseKey/renew', async ({ params, request }) => {
    const body = (await request.json()) as { extra_days: number };
    const item = licenses.find((license) => license.license_key === params.licenseKey);
    if (!item) return HttpResponse.json({ detail: 'Not found' }, { status: 404 });
    const baseline = item.expiry_date ? new Date(item.expiry_date) : new Date();
    item.expiry_date = addDays(baseline, body.extra_days).toISOString();
    item.is_active = true;
    appendAudit({ event: 'renewed', actor: 'ops-admin', target: item.license_key, detail: `+${body.extra_days} days` });
    return HttpResponse.json(item);
  }),

  http.get('/admin/users', () => HttpResponse.json(users)),

  http.get('/admin/users/:id/licenses', ({ params }) => {
    const items = licenses.filter((license) => license.owner_id === Number(params.id));
    return HttpResponse.json(items);
  }),

  http.post('/admin/users/:id/deactivate', ({ params }) => {
    const user = users.find((item) => item.id === Number(params.id));
    if (!user) return HttpResponse.json({ detail: 'Not found' }, { status: 404 });
    user.is_active = false;
    return HttpResponse.json(user);
  }),

  http.get('/admin/audit', ({ request }) => {
    const url = new URL(request.url);
    const limit = Number(url.searchParams.get('limit') ?? 20);
    const offset = Number(url.searchParams.get('offset') ?? 0);
    return HttpResponse.json({ total: audits.length, items: audits.slice(offset, offset + limit) });
  }),

  http.post('/activate', async ({ request }) => {
    const body = (await request.json()) as { username: string; license_key: string; hwid: string };
    const license = licenses.find((item) => item.license_key === body.license_key);
    if (!license) return HttpResponse.json({ valid: false, detail: 'License not found' }, { status: 404 });

    const user = users.find((item) => item.username === body.username);
    if (!user) return HttpResponse.json({ valid: false, detail: 'User not found' }, { status: 404 });

    license.owner_id = user.id;
    license.owner_username = user.username;
    license.hwid = body.hwid;
    license.expiry_date = addDays(new Date(), license.duration_days).toISOString();
    license.last_check = new Date().toISOString();

    appendAudit({ event: 'activated', actor: user.username, target: license.license_key, detail: `HWID ${body.hwid}` });

    return HttpResponse.json({ valid: true, license });
  }),

  http.post('/verify', async ({ request }) => {
    const body = (await request.json()) as { username: string; hwid: string };
    const license = licenses.find((item) => item.owner_username === body.username && item.hwid === body.hwid && item.is_active);
    if (!license) {
      return HttpResponse.json({ valid: false, license_key: null, expiry_date: null });
    }
    return HttpResponse.json({ valid: true, license_key: license.license_key, expiry_date: license.expiry_date });
  }),

  http.get('/my/licenses', ({ request }) => {
    const auth = request.headers.get('Authorization')?.replace('Bearer ', '');
    const decoded = decodeToken(auth);
    const username = decoded?.username;
    if (!username) return HttpResponse.json([], { status: 200 });
    const items = licenses.filter((item) => item.owner_username === username);
    return HttpResponse.json(items);
  })
];
