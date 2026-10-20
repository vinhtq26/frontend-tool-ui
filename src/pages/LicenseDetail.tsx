import { useState } from 'react';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { useParams } from 'react-router-dom';
import { getLicenseDetail, renewLicense, revokeLicense, setLicenseQuotaLimit } from '../services/licenses';
import { formatDate } from '../utils/date';
import { useToast } from '../components/Toasts';
import UsageMeter from '../components/UsageMeter';
import QuotaLimitModal from '../components/QuotaLimitModal';

export default function LicenseDetailPage() {
  const { key = '' } = useParams();
  const queryClient = useQueryClient();
  const { push } = useToast();
  const [openQuota, setOpenQuota] = useState(false);

  const detail = useQuery({
    queryKey: ['license-detail', key],
    queryFn: () => getLicenseDetail(key),
    enabled: Boolean(key)
  });

  const revokeMutation = useMutation({
    mutationFn: revokeLicense,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['license-detail', key] });
      queryClient.invalidateQueries({ queryKey: ['licenses'] });
      push({ type: 'success', title: 'Đã khóa key', message: 'License không thể đăng nhập hay tải video nữa.' });
    }
  });

  const renewMutation = useMutation({
    mutationFn: (extraDays: number) => renewLicense(key, { extra_days: extraDays }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['license-detail', key] });
      queryClient.invalidateQueries({ queryKey: ['licenses'] });
      push({ type: 'success', title: 'License renewed' });
    }
  });

  const quotaMutation = useMutation({
    mutationFn: (limit: number | null) => setLicenseQuotaLimit(key, limit),
    onSuccess: (updated) => {
      queryClient.setQueryData(['license-detail', key], updated);
      queryClient.invalidateQueries({ queryKey: ['licenses'] });
      push({ type: 'success', title: 'Đã lưu giới hạn tải' });
    },
    onError: (err: Error) => push({ type: 'error', title: 'Không lưu được giới hạn tải', message: err.message })
  });

  if (detail.isLoading) return <div className="card">Loading...</div>;
  if (!detail.data) return <div className="card">License not found.</div>;

  const item = detail.data;

  return (
    <section className="space-y-5">
      <div className="card">
        <h2 className="text-lg font-semibold text-slate-900">License Detail</h2>
        <p className="mt-2 font-mono text-sm text-slate-700">{item.license_key}</p>
      </div>
      <div className="grid gap-4 md:grid-cols-2">
        <div className="card !p-4">
          <p className="text-sm text-slate-500">Owner</p>
          <p className="mt-1 font-semibold text-slate-900">{item.owner_username ?? '-'}</p>
        </div>
        <div className="card !p-4">
          <p className="text-sm text-slate-500">HWID</p>
          <p className="mt-1 font-semibold text-slate-900">{item.hwid ?? '-'}</p>
        </div>
        <div className="card !p-4">
          <p className="text-sm text-slate-500">Expiry date</p>
          <p className="mt-1 font-semibold text-slate-900">{formatDate(item.expiry_date)}</p>
        </div>
        <div className="card !p-4">
          <p className="text-sm text-slate-500">Last check</p>
          <p className="mt-1 font-semibold text-slate-900">{formatDate(item.last_check)}</p>
        </div>
        <div className="card !p-4 md:col-span-2">
          <p className="mb-2 text-sm text-slate-500">Lượt tải video tháng này</p>
          <UsageMeter usage={item.usage} custom={item.custom_monthly_limit != null} />
        </div>
      </div>
      <div className="flex gap-2">
        <button
          className="btn-secondary"
          onClick={() => {
            const input = window.prompt('Extra days', '30');
            const parsed = Number(input);
            if (parsed > 0) renewMutation.mutate(parsed);
          }}
        >
          Renew
        </button>
        <button className="btn-secondary" onClick={() => setOpenQuota(true)}>
          Giới hạn tải
        </button>
        <button
          className="btn-primary bg-rose-600 hover:bg-rose-500 disabled:opacity-50"
          disabled={!item.is_active || revokeMutation.isPending}
          onClick={() => {
            if (window.confirm('Khóa key này? License sẽ bị chặn đăng nhập và tải video ngay lập tức.')) revokeMutation.mutate(key);
          }}
        >
          {item.is_active ? 'Khóa key' : 'Đã khóa'}
        </button>
      </div>
      <QuotaLimitModal
        open={openQuota}
        onOpenChange={setOpenQuota}
        license={item}
        onSubmit={(limit) => quotaMutation.mutateAsync(limit)}
      />
    </section>
  );
}
