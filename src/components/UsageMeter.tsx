import type { LicenseUsage } from '../types';
import { formatDate } from '../utils/date';
import { cn } from '../utils/cn';

interface UsageMeterProps {
  usage?: LicenseUsage | null;
  compact?: boolean;
}

export default function UsageMeter({ usage, compact = false }: UsageMeterProps) {
  if (!usage) return <span className="text-slate-400">-</span>;

  const percent = usage.limit > 0 ? Math.min(100, Math.round((usage.used / usage.limit) * 100)) : 0;
  const exhausted = usage.remaining <= 0;

  return (
    <div className={cn('min-w-28', !compact && 'space-y-2')}>
      <div className="flex items-center justify-between gap-2 text-xs">
        <span className={cn('font-semibold', exhausted ? 'text-rose-600' : 'text-slate-700')}>
          {usage.used}/{usage.limit}
        </span>
        <span
          className={cn(
            'rounded-full px-1.5 py-0.5 text-[10px] font-semibold uppercase',
            usage.plan === 'pro' ? 'bg-indigo-100 text-indigo-700' : 'bg-slate-100 text-slate-600'
          )}
        >
          {usage.plan}
        </span>
      </div>
      <div className="mt-1 h-1.5 overflow-hidden rounded-full bg-slate-100">
        <div
          className={cn('h-full rounded-full', exhausted ? 'bg-rose-500' : percent >= 80 ? 'bg-amber-500' : 'bg-emerald-500')}
          style={{ width: `${percent}%` }}
        />
      </div>
      {!compact ? (
        <p className="text-xs text-slate-500">
          Đã tải {usage.used}/{usage.limit} video tháng {usage.period} · còn {usage.remaining}
          {usage.plan_expiry ? ` · Pro đến ${formatDate(usage.plan_expiry)}` : ''}
        </p>
      ) : null}
    </div>
  );
}
