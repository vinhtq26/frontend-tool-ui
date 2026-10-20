import * as Dialog from '@radix-ui/react-dialog';
import { useEffect, useState } from 'react';
import type { License, QuotaLimitPayload } from '../types';

interface QuotaLimitModalProps {
  open: boolean;
  onOpenChange: (value: boolean) => void;
  license?: License | null;
  onSubmit: (payload: QuotaLimitPayload) => Promise<unknown>;
}

interface LimitState {
  useCustom: boolean;
  value: string;
}

function initialState(custom: number | null | undefined, effective: number | undefined): LimitState {
  return { useCustom: custom != null, value: String(custom ?? effective ?? '') };
}

function LimitSection({
  name,
  title,
  usageText,
  state,
  onChange
}: {
  name: string;
  title: string;
  usageText?: string;
  state: LimitState;
  onChange: (next: LimitState) => void;
}) {
  return (
    <fieldset className="space-y-2">
      <legend className="text-sm font-semibold text-slate-900">{title}</legend>
      {usageText ? <p className="text-xs text-slate-500">{usageText}</p> : null}
      <label className="flex items-center gap-3 rounded-xl border border-slate-200 p-3">
        <input type="radio" name={name} checked={!state.useCustom} onChange={() => onChange({ ...state, useCustom: false })} />
        <span className="text-slate-900">Theo cấu hình chung</span>
      </label>
      <label className="flex items-center gap-3 rounded-xl border border-slate-200 p-3">
        <input type="radio" name={name} checked={state.useCustom} onChange={() => onChange({ ...state, useCustom: true })} />
        <span className="shrink-0 text-slate-900">Giới hạn riêng</span>
        <input
          type="number"
          min={0}
          step={1}
          aria-label={`${title} riêng`}
          className="input !h-9"
          value={state.value}
          disabled={!state.useCustom}
          onChange={(event) => onChange({ ...state, value: event.target.value })}
        />
      </label>
    </fieldset>
  );
}

function parseLimit(state: LimitState): number | null | 'invalid' {
  if (!state.useCustom) return null;
  const value = Number(state.value);
  return state.value.trim() === '' || !Number.isInteger(value) || value < 0 ? 'invalid' : value;
}

export default function QuotaLimitModal({ open, onOpenChange, license, onSubmit }: QuotaLimitModalProps) {
  const [monthly, setMonthly] = useState<LimitState>({ useCustom: false, value: '' });
  const [daily, setDaily] = useState<LimitState>({ useCustom: false, value: '' });
  const [error, setError] = useState('');
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    if (!open) return;
    setMonthly(initialState(license?.custom_monthly_limit, license?.usage?.limit));
    setDaily(initialState(license?.custom_daily_limit, license?.usage?.daily_limit));
    setError('');
  }, [open, license]);

  const usage = license?.usage;

  const submit = async () => {
    const monthlyLimit = parseLimit(monthly);
    const dailyLimit = parseLimit(daily);
    if (monthlyLimit === 'invalid' || dailyLimit === 'invalid') {
      setError('Giới hạn phải là số nguyên không âm.');
      return;
    }

    // Only send fields that changed; the backend keeps omitted fields as they are.
    const payload: QuotaLimitPayload = {};
    if (monthlyLimit !== (license?.custom_monthly_limit ?? null)) payload.monthly_limit = monthlyLimit;
    if (dailyLimit !== (license?.custom_daily_limit ?? null)) payload.daily_limit = dailyLimit;
    if (Object.keys(payload).length === 0) {
      onOpenChange(false);
      return;
    }

    setError('');
    setSaving(true);
    try {
      await onSubmit(payload);
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
        <Dialog.Content className="fixed left-1/2 top-1/2 z-50 max-h-[90vh] w-[92vw] max-w-md -translate-x-1/2 -translate-y-1/2 overflow-y-auto rounded-2xl border border-slate-200 bg-white p-6 shadow-card">
          <Dialog.Title className="text-lg font-semibold text-slate-900">Giới hạn tải của license</Dialog.Title>
          <Dialog.Description className="mt-1 break-all text-sm text-slate-500">{license?.license_key}</Dialog.Description>
          <div className="mt-5 space-y-5 text-sm">
            <LimitSection
              name="monthly-limit"
              title="Giới hạn tháng"
              usageText={usage ? `Tháng ${usage.period}: đã tải ${usage.used}/${usage.limit}` : undefined}
              state={monthly}
              onChange={setMonthly}
            />
            <LimitSection
              name="daily-limit"
              title="Giới hạn ngày"
              usageText={usage?.daily_limit != null ? `Ngày ${usage.daily_period}: đã tải ${usage.daily_used ?? 0}/${usage.daily_limit}` : undefined}
              state={daily}
              onChange={setDaily}
            />
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
