import * as Dialog from '@radix-ui/react-dialog';
import { useEffect, useState } from 'react';
import type { License } from '../types';

interface QuotaLimitModalProps {
  open: boolean;
  onOpenChange: (value: boolean) => void;
  license?: License | null;
  onSubmit: (monthlyLimit: number | null) => Promise<unknown>;
}

export default function QuotaLimitModal({ open, onOpenChange, license, onSubmit }: QuotaLimitModalProps) {
  const [useCustom, setUseCustom] = useState(false);
  const [limit, setLimit] = useState('');
  const [error, setError] = useState('');
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    if (!open) return;
    const custom = license?.custom_monthly_limit;
    setUseCustom(custom != null);
    setLimit(String(custom ?? license?.usage?.limit ?? ''));
    setError('');
  }, [open, license]);

  const submit = async () => {
    let value: number | null = null;
    if (useCustom) {
      value = Number(limit);
      if (limit.trim() === '' || !Number.isInteger(value) || value < 0) {
        setError('Giới hạn phải là số nguyên không âm.');
        return;
      }
    }
    setError('');
    setSaving(true);
    try {
      await onSubmit(value);
      onOpenChange(false);
    } catch {
      // Error is surfaced by the caller's mutation handler.
    } finally {
      setSaving(false);
    }
  };

  return (
    <Dialog.Root open={open} onOpenChange={onOpenChange}>
      <Dialog.Portal>
        <Dialog.Overlay className="fixed inset-0 z-40 bg-slate-900/45" />
        <Dialog.Content className="fixed left-1/2 top-1/2 z-50 w-[92vw] max-w-md -translate-x-1/2 -translate-y-1/2 rounded-2xl border border-slate-200 bg-white p-6 shadow-card">
          <Dialog.Title className="text-lg font-semibold text-slate-900">Giới hạn tải của license</Dialog.Title>
          <Dialog.Description className="mt-1 break-all text-sm text-slate-500">{license?.license_key}</Dialog.Description>
          <div className="mt-5 space-y-3 text-sm">
            <label className="flex items-start gap-3 rounded-xl border border-slate-200 p-3">
              <input type="radio" className="mt-0.5" checked={!useCustom} onChange={() => setUseCustom(false)} />
              <span>
                <span className="font-medium text-slate-900">Theo cấu hình chung</span>
                <span className="block text-xs text-slate-500">Đổi theo giới hạn Free/Pro trong Settings.</span>
              </span>
            </label>
            <label className="flex items-start gap-3 rounded-xl border border-slate-200 p-3">
              <input type="radio" className="mt-0.5" checked={useCustom} onChange={() => setUseCustom(true)} />
              <span className="flex-1">
                <span className="font-medium text-slate-900">Giới hạn riêng (video/tháng)</span>
                <input
                  type="number"
                  min={0}
                  step={1}
                  aria-label="Giới hạn riêng"
                  className="input mt-2"
                  value={limit}
                  disabled={!useCustom}
                  onChange={(event) => setLimit(event.target.value)}
                />
              </span>
            </label>
            {license?.usage ? (
              <p className="text-xs text-slate-500">
                Tháng {license.usage.period}: đã tải {license.usage.used}/{license.usage.limit}
              </p>
            ) : null}
            {error ? <p className="text-sm text-rose-600">{error}</p> : null}
          </div>
          <div className="mt-6 flex justify-end gap-3">
            <button className="btn-secondary" onClick={() => onOpenChange(false)}>
              Cancel
            </button>
            <button className="btn-primary disabled:opacity-50" disabled={saving} onClick={submit}>
              {saving ? 'Đang lưu...' : 'Lưu'}
            </button>
          </div>
        </Dialog.Content>
      </Dialog.Portal>
    </Dialog.Root>
  );
}
