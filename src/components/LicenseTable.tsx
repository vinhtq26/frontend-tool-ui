import { useMemo } from 'react';
import type { License } from '../types';
import LicenseRowActions from './LicenseRowActions';
import { formatDate, getLicenseStatus } from '../utils/date';
import { cn } from '../utils/cn';

interface LicenseTableProps {
  licenses: License[];
  onView: (item: License) => void;
  onAssign: (item: License) => void;
  onRevoke: (item: License) => void;
  onRenew: (item: License) => void;
}

export default function LicenseTable({ licenses, onView, onAssign, onRevoke, onRenew }: LicenseTableProps) {
  const rows = useMemo(() => licenses ?? [], [licenses]);

  return (
    <>
      <div className="hidden overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-card md:block">
        <table className="min-w-full divide-y divide-slate-200 text-sm">
          <thead className="bg-slate-50">
            <tr className="text-left text-xs uppercase tracking-wide text-slate-500">
              <th className="px-4 py-3">License key</th>
              <th className="px-4 py-3">Owner</th>
              <th className="px-4 py-3">HWID</th>
              <th className="px-4 py-3">Status</th>
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
                  <td className="px-4 py-3">{license.duration_days}</td>
                  <td className="px-4 py-3">{formatDate(license.expiry_date)}</td>
                  <td className="px-4 py-3">{formatDate(license.last_check)}</td>
                  <td className="px-4 py-3 text-right">
                    <LicenseRowActions
                      onView={() => onView(license)}
                      onAssign={() => onAssign(license)}
                      onRevoke={() => onRevoke(license)}
                      onRenew={() => onRenew(license)}
                    />
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>

      <div className="space-y-3 md:hidden">
        {rows.map((license) => (
          <article key={license.license_key} className="card !p-4">
            <div className="mb-2 flex items-start justify-between gap-2">
              <p className="font-mono text-xs text-slate-900">{license.license_key}</p>
              <LicenseRowActions
                onView={() => onView(license)}
                onAssign={() => onAssign(license)}
                onRevoke={() => onRevoke(license)}
                onRenew={() => onRenew(license)}
              />
            </div>
            <div className="grid grid-cols-2 gap-2 text-xs text-slate-600">
              <span>Owner: {license.owner_username ?? '-'}</span>
              <span>HWID: {license.hwid ?? '-'}</span>
              <span>Duration: {license.duration_days} days</span>
              <span>Expiry: {formatDate(license.expiry_date)}</span>
            </div>
          </article>
        ))}
      </div>
    </>
  );
}
