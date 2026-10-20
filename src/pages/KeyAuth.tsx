import { useState } from 'react';
import { useMutation } from '@tanstack/react-query';
import axios from 'axios';
import {
  ClipboardDocumentIcon,
  ExclamationTriangleIcon,
  ShieldCheckIcon,
  SignalIcon
} from '@heroicons/react/24/outline';
import { authenticateKey, logFraud } from '../services/keyAuth';
import type { FraudLog, KeyAuthRequest, KeyAuthResponse, LogFraudRequest } from '../types';
import { useToast } from '../components/Toasts';
import ClientUsagePanel from '../components/ClientUsagePanel';

const defaultAppName = 'tool_reup_youtube_master';

function getApiError(error: unknown) {
  if (axios.isAxiosError(error)) {
    const detail = error.response?.data?.detail;
    if (typeof detail === 'string') return detail;
    return error.message;
  }
  return error instanceof Error ? error.message : 'Request failed';
}

function createAuthPayload(form: KeyAuthRequest): KeyAuthRequest {
  return {
    license_key: form.license_key.trim(),
    hwid: form.hwid.trim(),
    app_name: form.app_name.trim(),
    machine_name: form.machine_name?.trim() || undefined,
    device_fingerprint: form.device_fingerprint?.trim() || undefined
  };
}

function JsonResult({ title, data }: { title: string; data: KeyAuthResponse | FraudLog | null }) {
  if (!data) return null;

  return (
    <div className="rounded-xl border border-slate-200 bg-slate-950 p-4 text-slate-100">
      <div className="mb-3 flex items-center justify-between gap-3">
        <h3 className="text-sm font-semibold">{title}</h3>
        <span className="rounded-full bg-emerald-400/15 px-2.5 py-1 text-xs font-medium text-emerald-200">
          Success
        </span>
      </div>
      <pre className="max-h-80 overflow-auto whitespace-pre-wrap break-words text-xs leading-5">
        {JSON.stringify(data, null, 2)}
      </pre>
    </div>
  );
}

export default function KeyAuth() {
  const { push } = useToast();
  const [authForm, setAuthForm] = useState<KeyAuthRequest>({
    license_key: '',
    hwid: '',
    app_name: defaultAppName,
    machine_name: '',
    device_fingerprint: ''
  });
  const [fraudForm, setFraudForm] = useState<LogFraudRequest>({
    license_key: '',
    hwid: '',
    app_name: defaultAppName,
    reason: 'suspicious machine change',
    machine_name: '',
    device_fingerprint: ''
  });
  const [authResult, setAuthResult] = useState<KeyAuthResponse | null>(null);
  const [fraudResult, setFraudResult] = useState<FraudLog | null>(null);
  const [authError, setAuthError] = useState('');
  const [fraudError, setFraudError] = useState('');

  const authMutation = useMutation({
    mutationFn: authenticateKey,
    onSuccess: (data) => {
      setAuthResult(data);
      setAuthError('');
      setFraudForm((current) => ({
        ...current,
        license_key: data.license_key,
        hwid: authForm.hwid,
        app_name: authForm.app_name,
        machine_name: authForm.machine_name,
        device_fingerprint: authForm.device_fingerprint
      }));
      push({ type: 'success', title: 'Key authenticated', message: data.expiry_date });
    },
    onError: (error) => {
      setAuthResult(null);
      setAuthError(getApiError(error));
    }
  });

  const fraudMutation = useMutation({
    mutationFn: logFraud,
    onSuccess: (data) => {
      setFraudResult(data);
      setFraudError('');
      push({ type: 'warning', title: 'Fraud report logged', message: `Audit event #${data.audit_event_id}` });
    },
    onError: (error) => {
      setFraudResult(null);
      setFraudError(getApiError(error));
    }
  });

  const handleAuthSubmit = (event: React.FormEvent) => {
    event.preventDefault();
    setAuthError('');
    const payload = createAuthPayload(authForm);
    if (!payload.license_key || !payload.hwid || !payload.app_name) {
      setAuthError('Vui lòng nhập license key, HWID và app name.');
      return;
    }
    authMutation.mutate(payload);
  };

  const handleFraudSubmit = (event: React.FormEvent) => {
    event.preventDefault();
    setFraudError('');
    const payload: LogFraudRequest = {
      ...createAuthPayload(fraudForm),
      reason: fraudForm.reason.trim()
    };
    if (!payload.license_key || !payload.hwid || !payload.app_name || !payload.reason) {
      setFraudError('Vui lòng nhập license key, HWID, app name và lý do.');
      return;
    }
    fraudMutation.mutate(payload);
  };

  const copyToken = () => {
    if (!authResult?.license_token) return;
    navigator.clipboard.writeText(authResult.license_token).then(() => {
      push({ type: 'success', title: 'Copied license token' });
    }).catch(() => {
      push({ type: 'error', title: 'Không thể copy token' });
    });
  };

  return (
    <section className="space-y-5">
      <div className="flex flex-col gap-3 rounded-2xl border border-slate-200 bg-white p-5 shadow-card lg:flex-row lg:items-center lg:justify-between">
        <div>
          <h2 className="text-xl font-bold text-slate-900">Key Authentication</h2>
          <p className="mt-1 text-sm text-slate-500">Test tool activation, HWID binding and active fraud logging.</p>
        </div>
        {authResult?.license_token ? (
          <button type="button" className="btn-secondary gap-2" onClick={copyToken}>
            <ClipboardDocumentIcon className="h-5 w-5" />
            Copy token
          </button>
        ) : null}
      </div>

      <div className="grid gap-5 xl:grid-cols-[minmax(0,1fr)_minmax(360px,0.9fr)]">
        <form className="card space-y-5" onSubmit={handleAuthSubmit}>
          <div className="flex items-center gap-3">
            <span className="rounded-xl bg-emerald-50 p-2 text-emerald-700">
              <ShieldCheckIcon className="h-6 w-6" />
            </span>
            <div>
              <h3 className="text-base font-semibold text-slate-900">Tool xác thực key + máy</h3>
              <p className="text-sm text-slate-500">POST /key-auth</p>
            </div>
          </div>

          <div className="grid gap-4 md:grid-cols-2">
            <div className="md:col-span-2">
              <label className="label" htmlFor="auth-license-key">License key</label>
              <input
                id="auth-license-key"
                className="input"
                value={authForm.license_key}
                onChange={(event) => setAuthForm((current) => ({ ...current, license_key: event.target.value }))}
                placeholder="generated-license-key"
              />
            </div>
            <div>
              <label className="label" htmlFor="auth-hwid">HWID</label>
              <input
                id="auth-hwid"
                className="input"
                value={authForm.hwid}
                onChange={(event) => setAuthForm((current) => ({ ...current, hwid: event.target.value }))}
                placeholder="machine-hwid"
              />
            </div>
            <div>
              <label className="label" htmlFor="auth-app-name">App name</label>
              <input
                id="auth-app-name"
                className="input"
                value={authForm.app_name}
                onChange={(event) => setAuthForm((current) => ({ ...current, app_name: event.target.value }))}
                placeholder={defaultAppName}
              />
            </div>
            <div>
              <label className="label" htmlFor="auth-machine-name">Machine name</label>
              <input
                id="auth-machine-name"
                className="input"
                value={authForm.machine_name}
                onChange={(event) => setAuthForm((current) => ({ ...current, machine_name: event.target.value }))}
                placeholder="DESKTOP-01"
              />
            </div>
            <div>
              <label className="label" htmlFor="auth-fingerprint">Device fingerprint</label>
              <input
                id="auth-fingerprint"
                className="input"
                value={authForm.device_fingerprint}
                onChange={(event) => setAuthForm((current) => ({ ...current, device_fingerprint: event.target.value }))}
                placeholder="optional-extra-device-fingerprint"
              />
            </div>
          </div>

          {authError ? (
            <div className="rounded-xl border border-rose-200 bg-rose-50 p-3 text-sm font-medium text-rose-700">
              {authError}
            </div>
          ) : null}

          <button className="btn-primary gap-2 disabled:opacity-50" disabled={authMutation.isPending}>
            <SignalIcon className="h-5 w-5" />
            {authMutation.isPending ? 'Authenticating...' : 'Authenticate key'}
          </button>
        </form>

        <div className="space-y-5">
          <JsonResult title="Key auth response" data={authResult} />
          <div className="rounded-xl border border-slate-200 bg-white p-4">
            <h3 className="text-sm font-semibold text-slate-900">Lỗi thường gặp</h3>
            <div className="mt-3 grid gap-2 text-sm text-slate-600">
              {['License key not found', 'License does not belong to the specified application', 'HWID mismatch detected. License sharing is not allowed.', 'License is inactive', 'License expired'].map((item) => (
                <div key={item} className="rounded-lg border border-slate-100 bg-slate-50 px-3 py-2">{item}</div>
              ))}
            </div>
          </div>
        </div>
      </div>

      <div className="grid gap-5 xl:grid-cols-[minmax(0,1fr)_minmax(360px,0.9fr)]">
        <form className="card space-y-5" onSubmit={handleFraudSubmit}>
          <div className="flex items-center gap-3">
            <span className="rounded-xl bg-amber-50 p-2 text-amber-700">
              <ExclamationTriangleIcon className="h-6 w-6" />
            </span>
            <div>
              <h3 className="text-base font-semibold text-slate-900">Tool báo gian lận chủ động</h3>
              <p className="text-sm text-slate-500">POST /log_fraud</p>
            </div>
          </div>

          <div className="grid gap-4 md:grid-cols-2">
            <div className="md:col-span-2">
              <label className="label" htmlFor="fraud-license-key">License key</label>
              <input
                id="fraud-license-key"
                className="input"
                value={fraudForm.license_key}
                onChange={(event) => setFraudForm((current) => ({ ...current, license_key: event.target.value }))}
                placeholder="generated-license-key"
              />
            </div>
            <div>
              <label className="label" htmlFor="fraud-hwid">HWID</label>
              <input
                id="fraud-hwid"
                className="input"
                value={fraudForm.hwid}
                onChange={(event) => setFraudForm((current) => ({ ...current, hwid: event.target.value }))}
                placeholder="machine-hwid"
              />
            </div>
            <div>
              <label className="label" htmlFor="fraud-app-name">App name</label>
              <input
                id="fraud-app-name"
                className="input"
                value={fraudForm.app_name}
                onChange={(event) => setFraudForm((current) => ({ ...current, app_name: event.target.value }))}
                placeholder={defaultAppName}
              />
            </div>
            <div>
              <label className="label" htmlFor="fraud-machine-name">Machine name</label>
              <input
                id="fraud-machine-name"
                className="input"
                value={fraudForm.machine_name}
                onChange={(event) => setFraudForm((current) => ({ ...current, machine_name: event.target.value }))}
                placeholder="DESKTOP-01"
              />
            </div>
            <div>
              <label className="label" htmlFor="fraud-fingerprint">Device fingerprint</label>
              <input
                id="fraud-fingerprint"
                className="input"
                value={fraudForm.device_fingerprint}
                onChange={(event) => setFraudForm((current) => ({ ...current, device_fingerprint: event.target.value }))}
                placeholder="optional-extra-device-fingerprint"
              />
            </div>
            <div className="md:col-span-2">
              <label className="label" htmlFor="fraud-reason">Reason</label>
              <textarea
                id="fraud-reason"
                className="min-h-24 w-full rounded-xl border border-slate-300 bg-white px-3 py-2 text-sm text-slate-900 placeholder:text-slate-400 focus:border-indigo-400 focus:outline-none focus:ring-2 focus:ring-indigo-100"
                value={fraudForm.reason}
                onChange={(event) => setFraudForm((current) => ({ ...current, reason: event.target.value }))}
                placeholder="suspicious machine change"
              />
            </div>
          </div>

          {fraudError ? (
            <div className="rounded-xl border border-rose-200 bg-rose-50 p-3 text-sm font-medium text-rose-700">
              {fraudError}
            </div>
          ) : null}

          <button className="btn-primary gap-2 bg-amber-600 hover:bg-amber-500 disabled:opacity-50" disabled={fraudMutation.isPending}>
            <ExclamationTriangleIcon className="h-5 w-5" />
            {fraudMutation.isPending ? 'Logging...' : 'Log fraud'}
          </button>
        </form>

        <JsonResult title="Fraud log response" data={fraudResult} />
      </div>

      <ClientUsagePanel licenseToken={authResult?.license_token} machineId={authResult ? authForm.hwid : undefined} />
    </section>
  );
}
