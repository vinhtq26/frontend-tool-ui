import { useEffect, useState } from 'react';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import axios from 'axios';
import { ArrowDownTrayIcon } from '@heroicons/react/24/outline';
import { getQuotaSettings, updateQuotaSettings } from '../services/usage';
import type { QuotaSettings } from '../types';
import { useToast } from './Toasts';

const fields: Array<{ key: keyof QuotaSettings; label: string }> = [
  { key: 'free_monthly_downloads', label: 'Gói Free (video/tháng)' },
  { key: 'pro_monthly_downloads', label: 'Gói Pro (video/tháng)' },
  { key: 'free_daily_downloads', label: 'Gói Free (video/ngày)' },
  { key: 'pro_daily_downloads', label: 'Gói Pro (video/ngày)' }
];

function getErrorMessage(error: unknown) {
  if (axios.isAxiosError(error)) {
    const detail = error.response?.data?.detail;
    if (typeof detail === 'string') return detail;
    return error.message;
  }
  return error instanceof Error ? error.message : 'Request failed';
}

export default function QuotaSettingsCard() {
  const queryClient = useQueryClient();
  const { push } = useToast();
  const [form, setForm] = useState<Record<keyof QuotaSettings, string>>({
    free_monthly_downloads: '',
    pro_monthly_downloads: '',
    free_daily_downloads: '',
    pro_daily_downloads: ''
  });
  const [error, setError] = useState('');

  const query = useQuery({ queryKey: ['quota-settings'], queryFn: getQuotaSettings });

  useEffect(() => {
    if (!query.data) return;
    setForm({
      free_monthly_downloads: String(query.data.free_monthly_downloads ?? ''),
      pro_monthly_downloads: String(query.data.pro_monthly_downloads ?? ''),
      free_daily_downloads: String(query.data.free_daily_downloads ?? ''),
      pro_daily_downloads: String(query.data.pro_daily_downloads ?? '')
    });
  }, [query.data]);

  const mutation = useMutation({
    mutationFn: updateQuotaSettings,
    onSuccess: (data) => {
      queryClient.setQueryData(['quota-settings'], data);
      queryClient.invalidateQueries({ queryKey: ['licenses'] });
      queryClient.invalidateQueries({ queryKey: ['user-licenses'] });
      setError('');
      push({ type: 'success', title: 'Đã lưu giới hạn tải', message: 'Áp dụng ngay cho các lượt tải tiếp theo.' });
    },
    onError: (err) => setError(getErrorMessage(err))
  });

  const handleSubmit = (event: React.FormEvent) => {
    event.preventDefault();
    const changes: Partial<QuotaSettings> = {};
    for (const { key, label } of fields) {
      const value = Number(form[key]);
      if (form[key].trim() === '' || !Number.isInteger(value) || value < 0) {
        setError(`${label} phải là số nguyên không âm.`);
        return;
      }
      if (value !== query.data?.[key]) changes[key] = value;
    }
    if (Object.keys(changes).length === 0) {
      setError('Không có thay đổi nào để lưu.');
      return;
    }
    mutation.mutate(changes);
  };

  return (
    <article className="card">
      <div className="flex items-start gap-4">
        <div className="rounded-2xl bg-emerald-50 p-3 text-emerald-600">
          <ArrowDownTrayIcon className="h-6 w-6" />
        </div>
        <form className="flex-1 space-y-4" onSubmit={handleSubmit}>
          <div>
            <h2 className="text-lg font-semibold text-slate-900">Giới hạn tải video</h2>
            <p className="mt-1 text-sm text-slate-500">Số video mỗi license được tải mỗi tháng và mỗi ngày. Lưu xong áp dụng ngay, không cần restart server. License có giới hạn riêng không bị ảnh hưởng.</p>
          </div>

          {query.isLoading ? <p className="text-sm text-slate-400">Loading…</p> : null}
          {query.isError ? <p className="text-sm text-rose-600">Không tải được cấu hình: {getErrorMessage(query.error)}</p> : null}

          <div className="grid gap-4 sm:grid-cols-2">
            {fields.map(({ key, label }) => (
              <div key={key}>
                <label className="label" htmlFor={`quota-${key}`}>{label}</label>
                <input
                  id={`quota-${key}`}
                  type="number"
                  min={0}
                  step={1}
                  className="input"
                  value={form[key]}
                  disabled={!query.data}
                  onChange={(event) => setForm((current) => ({ ...current, [key]: event.target.value }))}
                />
              </div>
            ))}
          </div>

          {error ? (
            <div className="rounded-xl border border-rose-200 bg-rose-50 p-3 text-sm font-medium text-rose-700">{error}</div>
          ) : null}

          <button className="btn-primary disabled:opacity-50" disabled={!query.data || mutation.isPending}>
            {mutation.isPending ? 'Đang lưu...' : 'Lưu giới hạn'}
          </button>
        </form>
      </div>
    </article>
  );
}
