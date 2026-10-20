import { useMemo } from 'react';
import type { License } from '../types';
import LicenseRowActions from './LicenseRowActions';
import UsageMeter from './UsageMeter';
import { formatDate, getLicenseStatus } from '../utils/date';
import { cn } from '../utils/cn';

interface LicenseTableProps {
  licenses: License[];
  selectedIds?: Set<number>;
  onToggle?: (licenseId: number) => void;
  onToggleAll?: (checked: boolean) => void;
  onView: (item: License) => void;
  onAssign: (item: License) => void;
  onRevoke: (item: License) => void;
  onRenew: (item: License) => void;
}

export default function LicenseTable({
  licenses,
  selectedIds = new Set<number>(),
  onToggle,
  onToggleAll,
  onView,
  onAssign,
  onRevoke,
  onRenew
}: LicenseTableProps) {
  const rows = useMemo(() => licenses ?? [], [licenses]);
  const allSelected = rows.length > 0 && rows.every((license) => selectedIds.has(license.id));

  return (
    <>
      <div className="hidden overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-card md:block">
        <table className="min-w-full divide-y divide-slate-200 text-sm">
          <thead className="bg-slate-50">
            <tr className="text-left text-xs uppercase tracking-wide text-slate-500">
              {onToggle ? (
                <th className="w-10 px-4 py-3">
                  <input
                    type="checkbox"
                    className="h-4 w-4 rounded border-slate-300 text-indigo-600 focus:ring-indigo-500"
                    aria-label="Select all licenses"
                    checked={allSelected}
                    onChange={(event) => onToggleAll?.(event.target.checked)}
                  />
                </th>
              ) : null}
              <th className="px-4 py-3">License key</th>
              <th className="px-4 py-3">Owner</th>
              <th className="px-4 py-3">HWID</th>
              <th className="px-4 py-3">Status</th>
              <th className="px-4 py-3">Usage (tháng)</th>
              <th className="px-4 py-3">Duration (days)</th>
              <th className="px-4 py-3">Expiry date</th>
              <th className="px-4 py-3">Last check</th>
              <th className="px-4 py-3" />
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100 bg-white">
            {rows.map((license) => {
              const status = getLicenseStatus(license.expiry_date, license.is_active);
              return (
                <tr key={license.license_key} className="text-slate-700">
                  {onToggle ? (
                    <td className="px-4 py-3">
                      <input
                        type="checkbox"
                        className="h-4 w-4 rounded border-slate-300 text-indigo-600 focus:ring-indigo-500"
                        aria-label={`Select license ${license.license_key}`}
                        checked={selectedIds.has(license.id)}
                        onChange={() => onToggle(license.id)}
                      />
                    </td>
                  ) : null}
                  <td className="px-4 py-3 font-mono text-xs text-slate-900">{license.license_key}</td>
                  <td className="px-4 py-3">{license.owner_username ?? '-'}</td>
                  <td className="px-4 py-3">{license.hwid ?? '-'}</td>
                  <td className="px-4 py-3">
                    <span
                      className={cn(
                        'inline-flex rounded-full px-2 py-1 text-xs font-semibold',
                        status === 'active' && 'bg-emerald-100 text-emerald-700',
                        status === 'inactive' && 'bg-slate-100 text-slate-700',
                        status === 'expired' && 'bg-amber-100 text-amber-700'
                      )}
                    >
                      {status}
                    </span>
                  </td>
                  <td className="px-4 py-3">
                    <UsageMeter usage={license.usage} compact />
                  </td>
                  <td className="px-4 py-3">{license.duration_days}</td>
                  <td className="px-4 py-3">{formatDate(license.expiry_date)}</td>
                  <td className="px-4 py-3">{formatDate(license.last_check)}</td>
                  <td className="px-4 py-3 text-right">
                    <LicenseRowActions
                      onView={() => onView(license)}
                      onAssign={() => onAssign(license)}
                      onRevoke={() => onRevoke(license)}
                      onRenew={() => onRenew(license)}
                      locked={!license.is_active}
                    />
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>

      <div className="space-y-3 md:hidden">
        {onToggle && rows.length > 0 ? (
          <label className="flex items-center gap-2 rounded-xl border border-slate-200 bg-white px-4 py-3 text-sm font-medium text-slate-700">
            <input
              type="checkbox"
              className="h-4 w-4 rounded border-slate-300 text-indigo-600 focus:ring-indigo-500"
              checked={allSelected}
              onChange={(event) => onToggleAll?.(event.target.checked)}
            />
            Chọn tất cả license trên trang
          </label>
        ) : null}
        {rows.map((license) => (
          <article key={license.license_key} className="card !p-4">
            <div className="mb-2 flex items-start justify-between gap-2">
              <div className="flex items-start gap-3">
                {onToggle ? (
                  <input
                    type="checkbox"
                    className="mt-0.5 h-4 w-4 rounded border-slate-300 text-indigo-600 focus:ring-indigo-500"
                    aria-label={`Select license ${license.license_key}`}
                    checked={selectedIds.has(license.id)}
                    onChange={() => onToggle(license.id)}
                  />
                ) : null}
                <p className="font-mono text-xs text-slate-900">{license.license_key}</p>
              </div>
              <LicenseRowActions
                onView={() => onView(license)}
                onAssign={() => onAssign(license)}
                onRevoke={() => onRevoke(license)}
                onRenew={() => onRenew(license)}
                locked={!license.is_active}
              />
            </div>
            <div className="grid grid-cols-2 gap-2 text-xs text-slate-600">
              <span>Owner: {license.owner_username ?? '-'}</span>
              <span>HWID: {license.hwid ?? '-'}</span>
              <span>Duration: {license.duration_days} days</span>
              <span>Expiry: {formatDate(license.expiry_date)}</span>
              <div className="col-span-2">
                <UsageMeter usage={license.usage} compact />
              </div>
            </div>
          </article>
        ))}
      </div>
    </>
  );
}
