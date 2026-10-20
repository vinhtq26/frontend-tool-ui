import { useEffect, useState } from 'react';
import { useMutation } from '@tanstack/react-query';
import axios from 'axios';
import { ArrowDownTrayIcon, ChartBarIcon } from '@heroicons/react/24/outline';
import { getClientUsage, getQuotaExceeded, quotaExceededMessage, resolveVideo } from '../services/usage';
import type { LicenseUsage, ResolveVideoResponse } from '../types';
import UsageMeter from './UsageMeter';

interface ClientUsagePanelProps {
  licenseToken?: string;
  machineId?: string;
}

function getClientError(error: unknown) {
  const quota = getQuotaExceeded(error);
  if (quota) return quotaExceededMessage(quota);
  if (axios.isAxiosError(error)) {
    const detail = error.response?.data?.detail;
    if (typeof detail === 'string') return detail;
    return error.message;
  }
  return error instanceof Error ? error.message : 'Request failed';
}

export default function ClientUsagePanel({ licenseToken = '', machineId = '' }: ClientUsagePanelProps) {
  const [token, setToken] = useState(licenseToken);
  const [machine, setMachine] = useState(machineId);
  const [videoId, setVideoId] = useState('');
  const [usage, setUsage] = useState<LicenseUsage | null>(null);
  const [video, setVideo] = useState<ResolveVideoResponse | null>(null);
  const [error, setError] = useState('');

  useEffect(() => setToken(licenseToken), [licenseToken]);
  useEffect(() => setMachine(machineId), [machineId]);

  const credentials = () => ({ license_token: token.trim(), machine_id: machine.trim() });

  const usageMutation = useMutation({
    mutationFn: getClientUsage,
    onSuccess: (data) => {
      setUsage(data);
      setError('');
    },
    onError: (err) => setError(getClientError(err))
  });

  const resolveMutation = useMutation({
    mutationFn: resolveVideo,
    onSuccess: (data) => {
      setVideo(data);
      setError('');
      usageMutation.mutate(credentials());
    },
    onError: (err) => {
      setVideo(null);
      const quota = getQuotaExceeded(err);
      if (quota) setUsage(quota);
      setError(getClientError(err));
    }
  });

  const validate = () => {
    const payload = credentials();
    if (!payload.license_token || !payload.machine_id) {
      setError('Vui lòng nhập license token và machine ID.');
      return null;
    }
    return payload;
  };

  return (
    <div className="grid gap-5 xl:grid-cols-[minmax(0,1fr)_minmax(360px,0.9fr)]">
      <div className="card space-y-5">
        <div className="flex items-center gap-3">
          <span className="rounded-xl bg-indigo-50 p-2 text-indigo-700">
            <ChartBarIcon className="h-6 w-6" />
          </span>
          <div>
            <h3 className="text-base font-semibold text-slate-900">Lượt tải video của client</h3>
            <p className="text-sm text-slate-500">POST /api/usage · POST /api/resolve-video</p>
          </div>
        </div>

        <div className="grid gap-4 md:grid-cols-2">
          <div className="md:col-span-2">
            <label className="label" htmlFor="client-license-token">License token</label>
            <input
              id="client-license-token"
              className="input"
              value={token}
              onChange={(event) => setToken(event.target.value)}
              placeholder="license_token từ /key-auth"
            />
          </div>
          <div>
            <label className="label" htmlFor="client-machine-id">Machine ID</label>
            <input
              id="client-machine-id"
              className="input"
              value={machine}
              onChange={(event) => setMachine(event.target.value)}
              placeholder="machine-hwid"
            />
          </div>
          <div>
            <label className="label" htmlFor="client-video-id">Video ID</label>
            <input
              id="client-video-id"
              className="input"
              value={videoId}
              onChange={(event) => setVideoId(event.target.value)}
              placeholder="video-id"
            />
          </div>
        </div>

        {error ? (
          <div className="rounded-xl border border-rose-200 bg-rose-50 p-3 text-sm font-medium text-rose-700">{error}</div>
        ) : null}

        <div className="flex flex-wrap gap-2">
          <button
            type="button"
            className="btn-secondary gap-2 disabled:opacity-50"
            disabled={usageMutation.isPending}
            onClick={() => {
              const payload = validate();
              if (payload) usageMutation.mutate(payload);
            }}
          >
            <ChartBarIcon className="h-5 w-5" />
            {usageMutation.isPending ? 'Đang kiểm tra...' : 'Xem lượt đã dùng'}
          </button>
          <button
            type="button"
            className="btn-primary gap-2 disabled:opacity-50"
            disabled={resolveMutation.isPending || (usage ? usage.remaining <= 0 : false)}
            onClick={() => {
              const payload = validate();
              if (!payload) return;
              if (!videoId.trim()) {
                setError('Vui lòng nhập video ID.');
                return;
              }
              resolveMutation.mutate({ ...payload, video_id: videoId.trim() });
            }}
          >
            <ArrowDownTrayIcon className="h-5 w-5" />
            {resolveMutation.isPending ? 'Đang resolve...' : 'Resolve video'}
          </button>
        </div>
      </div>

      <div className="space-y-5">
        {usage ? (
          <div className="card !p-4">
            <UsageMeter usage={usage} />
          </div>
        ) : null}
        {video ? (
          <div className="rounded-xl border border-slate-200 bg-slate-950 p-4 text-slate-100">
            <h3 className="mb-3 text-sm font-semibold">Resolve video response</h3>
            <pre className="max-h-80 overflow-auto whitespace-pre-wrap break-words text-xs leading-5">
              {JSON.stringify(video, null, 2)}
            </pre>
          </div>
        ) : null}
      </div>
    </div>
  );
}
