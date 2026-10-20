import type { LicenseUsage } from '../types';
import { formatDate } from '../utils/date';
import { cn } from '../utils/cn';

interface UsageMeterProps {
  usage?: LicenseUsage | null;
  compact?: boolean;
  custom?: boolean;
  customDaily?: boolean;
}

function UsageBar({ label, used, limit, remaining, custom }: { label: string; used: number; limit: number; remaining: number; custom: boolean }) {
  const percent = limit > 0 ? Math.min(100, Math.round((used / limit) * 100)) : 0;
  const exhausted = remaining <= 0;

  return (
    <div>
      <div className="flex items-center gap-1 text-xs">
        <span className="w-9 text-slate-500">{label}</span>
        <span className={cn('font-semibold', exhausted ? 'text-rose-600' : 'text-slate-700')}>
          {used}/{limit}
        </span>
        {custom ? <span className="text-indigo-600" title="Giới hạn riêng cho license này">· riêng</span> : null}
      </div>
      <div className="mt-1 h-1.5 overflow-hidden rounded-full bg-slate-100">
        <div
          className={cn('h-full rounded-full', exhausted ? 'bg-rose-500' : percent >= 80 ? 'bg-amber-500' : 'bg-emerald-500')}
          style={{ width: `${percent}%` }}
        />
      </div>
    </div>
  );
}

export default function UsageMeter({ usage, compact = false, custom = false, customDaily = false }: UsageMeterProps) {
  if (!usage) return <span className="text-slate-400">-</span>;

  const hasDaily = usage.daily_limit != null;

  return (
    <div className={cn('min-w-32', compact ? 'space-y-1.5' : 'space-y-2')}>
      <div className="flex justify-end">
        <span
          className={cn(
            'rounded-full px-1.5 py-0.5 text-[10px] font-semibold uppercase',
            usage.plan === 'pro' ? 'bg-indigo-100 text-indigo-700' : 'bg-slate-100 text-slate-600'
          )}
        >
          {usage.plan}
        </span>
      </div>
      <UsageBar label="Tháng" used={usage.used} limit={usage.limit} remaining={usage.remaining} custom={custom} />
      {hasDaily ? (
        <UsageBar
          label="Ngày"
          used={usage.daily_used ?? 0}
          limit={usage.daily_limit ?? 0}
          remaining={usage.daily_remaining ?? 0}
          custom={customDaily}
        />
      ) : null}
      {!compact ? (
        <div className="space-y-0.5 text-xs text-slate-500">
          <p>
            Tháng {usage.period}: đã tải {usage.used}/{usage.limit}, còn {usage.remaining}
            {custom ? ' · giới hạn riêng' : ' · theo cấu hình chung'}
          </p>
          {hasDaily ? (
            <p>
              Ngày {usage.daily_period}: đã tải {usage.daily_used ?? 0}/{usage.daily_limit}, còn {usage.daily_remaining ?? 0}
              {customDaily ? ' · giới hạn riêng' : ' · theo cấu hình chung'}
            </p>
          ) : null}
          {usage.plan_expiry ? <p>Pro đến {formatDate(usage.plan_expiry)}</p> : null}
        </div>
      ) : null}
    </div>
  );
}
