import { http, HttpResponse } from 'msw';
import { addDays } from 'date-fns';
import { appendAudit, applications, audits, buildUsage, licenses, quotaSettings, recordDownload, users } from './data';
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

async function findClientLicense(request: Request) {
  const body = (await request.json()) as Record<string, string | undefined>;
  const token = request.headers.get('Authorization')?.replace('Bearer ', '') || body.license_token;
  const machineId = body.machine_id ?? body.hwid;
  const license = licenses.find((item) => item.license_token === token);
  if (!license || !license.is_active) return { body, error: HttpResponse.json({ detail: 'license revoked' }, { status: 403 }) };
  if (license.hwid && machineId !== license.hwid) return { body, error: HttpResponse.json({ detail: 'machine mismatch' }, { status: 403 }) };
  return { body, license };
}

function buildLicenseToken() {
  return `lic_tok_${Math.random().toString(36).slice(2, 16)}`;
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
    const body = (await request.json()) as {
      username: string;
      password?: string;
      email?: string;
      app_name?: string;
      role?: 'admin' | 'user';
    };
    const created = {
      id: users.length + 1,
      username: body.username.trim(),
      email: body.email,
      app_name: body.app_name?.trim() || 'Default App',
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
      id: Math.max(0, ...licenses.map((license) => license.id)) + 1,
      license_key: `NEW-${Math.random().toString(36).slice(2, 10).toUpperCase()}`,
      license_token: buildLicenseToken(),
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

  http.delete('/admin/licenses/batch', async ({ request }) => {
    const body = (await request.json()) as { license_ids: number[] };
    const deleted: number[] = [];
    const notFound: number[] = [];
    const skippedAssigned: Array<{ license_id: number; owner_id: number }> = [];

    body.license_ids.forEach((licenseId) => {
      const index = licenses.findIndex((license) => license.id === licenseId);
      if (index === -1) {
        notFound.push(licenseId);
        return;
      }
      const license = licenses[index];
      if (license.owner_id !== null) {
        skippedAssigned.push({ license_id: licenseId, owner_id: license.owner_id });
        return;
      }
      licenses.splice(index, 1);
      deleted.push(licenseId);
    });

    return HttpResponse.json({
      requested: body.license_ids.length,
      deleted,
      not_found: notFound,
      skipped_assigned: skippedAssigned,
      failed: []
    });
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

  http.delete('/admin/users/batch', async ({ request }) => {
    const body = (await request.json()) as { user_ids: number[] };
    const deleted: number[] = [];
    const notFound: number[] = [];
    let deletedLicenseCount = 0;

    body.user_ids.forEach((userId) => {
      const userIndex = users.findIndex((user) => user.id === userId);
      if (userIndex === -1) {
        notFound.push(userId);
        return;
      }
      users.splice(userIndex, 1);
      deleted.push(userId);
      for (let index = licenses.length - 1; index >= 0; index -= 1) {
        if (licenses[index].owner_id === userId) {
          licenses.splice(index, 1);
          deletedLicenseCount += 1;
        }
      }
    });

    return HttpResponse.json({
      requested: body.user_ids.length,
      deleted,
      not_found: notFound,
      failed: [],
      deleted_license_count: deletedLicenseCount
    });
  }),

  http.get('/admin/users/:id/licenses', ({ params }) => {
    const items = licenses.filter((license) => license.owner_id === Number(params.id));
    return HttpResponse.json(items);
  }),

  http.post('/admin/users/:id/deactivate', ({ params }) => {
    const user = users.find((item) => item.id === Number(params.id));
    if (!user) return HttpResponse.json({ detail: 'Not found' }, { status: 404 });
    user.is_active = false;
    licenses.forEach((license) => {
      if (license.owner_id === user.id) {
        license.is_active = false;
      }
    });
    appendAudit({ event: 'deactivated', actor: 'ops-admin', target: user.username, detail: 'User deactivated from admin panel' });
    return HttpResponse.json(user);
  }),

  http.post('/admin/users/:id/activate', ({ params }) => {
    const user = users.find((item) => item.id === Number(params.id));
    if (!user) return HttpResponse.json({ detail: 'Not found' }, { status: 404 });
    user.is_active = true;
    licenses.forEach((license) => {
      const isOwnedByUser = license.owner_id === user.id;
      const isExpired = Boolean(license.expiry_date && new Date(license.expiry_date) < new Date());
      if (isOwnedByUser && !isExpired) {
        license.is_active = true;
      }
    });
    appendAudit({ event: 'activated', actor: 'ops-admin', target: user.username, detail: 'User activated from admin panel' });
    return HttpResponse.json(user);
  }),

  http.delete('/admin/users/:id', ({ params }) => {
    const userIndex = users.findIndex((item) => item.id === Number(params.id));
    if (userIndex === -1) return HttpResponse.json({ detail: 'Not found' }, { status: 404 });

    const [removedUser] = users.splice(userIndex, 1);

    licenses.forEach((license) => {
      if (license.owner_id === removedUser.id) {
        license.owner_id = null;
        license.owner_username = null;
        license.hwid = null;
        license.is_active = false;
      }
    });

    appendAudit({ event: 'deleted', actor: 'ops-admin', target: removedUser.username, detail: 'User deleted from admin panel' });
    return HttpResponse.json({ success: true });
  }),

  http.get('/admin/apps', ({ request }) => {
    const url = new URL(request.url);
    const limit = Number(url.searchParams.get('limit') ?? 100);
    const offset = Number(url.searchParams.get('offset') ?? 0);
    return HttpResponse.json({ total: applications.length, items: applications.slice(offset, offset + limit) });
  }),

  http.post('/admin/apps', async ({ request }) => {
    const body = (await request.json()) as { name: string; description?: string | null };
    if (applications.some((application) => application.name === body.name)) {
      return HttpResponse.json({ detail: 'Application name already exists' }, { status: 400 });
    }
    const created = {
      id: Math.max(0, ...applications.map((application) => application.id)) + 1,
      name: body.name,
      description: body.description ?? null,
      created_at: new Date().toISOString(),
      updated_at: null
    };
    applications.push(created);
    return HttpResponse.json(created, { status: 201 });
  }),

  http.get('/admin/apps/:id', ({ params }) => {
    const application = applications.find((item) => item.id === Number(params.id));
    if (!application) return HttpResponse.json({ detail: 'Not found' }, { status: 404 });
    return HttpResponse.json(application);
  }),

  http.put('/admin/apps/:id', async ({ params, request }) => {
    const application = applications.find((item) => item.id === Number(params.id));
    if (!application) return HttpResponse.json({ detail: 'Not found' }, { status: 404 });
    const body = (await request.json()) as { name?: string; description?: string | null };
    if (body.name && applications.some((item) => item.id !== application.id && item.name === body.name)) {
      return HttpResponse.json({ detail: 'Application name already exists' }, { status: 400 });
    }
    if (body.name !== undefined) application.name = body.name;
    if (body.description !== undefined) application.description = body.description;
    application.updated_at = new Date().toISOString();
    return HttpResponse.json(application);
  }),

  http.delete('/admin/apps/:id', ({ params }) => {
    const index = applications.findIndex((item) => item.id === Number(params.id));
    if (index === -1) return HttpResponse.json({ detail: 'Not found' }, { status: 404 });
    applications.splice(index, 1);
    return HttpResponse.json({ deleted: true });
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

  http.get('/admin/settings/quota', () => HttpResponse.json(quotaSettings)),

  http.put('/admin/settings/quota', async ({ request }) => {
    const body = (await request.json()) as Partial<typeof quotaSettings>;
    const changes = Object.fromEntries(
      Object.entries(body).filter(([key, value]) => key in quotaSettings && typeof value === 'number')
    );
    if (Object.keys(changes).length === 0) return HttpResponse.json({ detail: 'No fields to update' }, { status: 400 });
    Object.assign(quotaSettings, changes);
    licenses.forEach((license) => {
      license.usage = buildUsage(license);
    });
    return HttpResponse.json(quotaSettings);
  }),

  http.put('/admin/licenses/:licenseKey/quota-limit', async ({ params, request }) => {
    const body = (await request.json()) as { monthly_limit?: number | null; daily_limit?: number | null };
    const item = licenses.find((license) => license.license_key === params.licenseKey);
    if (!item) return HttpResponse.json({ detail: 'Not found' }, { status: 404 });
    if ('monthly_limit' in body) item.custom_monthly_limit = body.monthly_limit;
    if ('daily_limit' in body) item.custom_daily_limit = body.daily_limit;
    item.usage = buildUsage(item);
    return HttpResponse.json(item);
  }),

  http.get('/admin/licenses/:licenseKey/usage', ({ params }) => {
    const item = licenses.find((license) => license.license_key === params.licenseKey);
    if (!item) return HttpResponse.json({ detail: 'Not found' }, { status: 404 });
    return HttpResponse.json(buildUsage(item));
  }),

  http.post('/api/usage', async ({ request }) => {
    const { license, error } = await findClientLicense(request);
    if (error) return error;
    return HttpResponse.json(buildUsage(license));
  }),

  http.post('/api/resolve-video', async ({ request }) => {
    const { body, license, error } = await findClientLicense(request);
    if (error) return error;
    const videoId = body.video_id ?? body.vid;
    if (!videoId) return HttpResponse.json({ detail: 'video_id is required' }, { status: 400 });
    const usage = buildUsage(license);
    const dailyBlocked = (usage.daily_remaining ?? 1) <= 0;
    if (usage.remaining <= 0 || dailyBlocked) {
      return HttpResponse.json(
        {
          detail: {
            code: 'quota_exceeded',
            limit_type: dailyBlocked ? 'daily' : 'monthly',
            message: dailyBlocked
              ? `Download limit reached (${usage.daily_used}/${usage.daily_limit} episodes today)`
              : `Monthly download limit reached (${usage.used}/${usage.limit} episodes)`,
            ...usage
          }
        },
        { status: 429 }
      );
    }
    recordDownload(license);
    return HttpResponse.json({
      video_id: videoId,
      url: `https://cdn.mock.local/${videoId}.m3u8`,
      content_key_hex: '00112233445566778899aabbccddeeff',
      quality: '1080p',
      duration: '00:42:00',
      expires_at: Math.floor(Date.now() / 1000) + 3600,
      customer: license.owner_username ?? 'unknown',
      signature: 'mock-signature'
    });
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
