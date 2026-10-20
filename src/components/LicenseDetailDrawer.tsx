import * as Dialog from '@radix-ui/react-dialog';
import { XMarkIcon } from '@heroicons/react/24/outline';
import type { License } from '../types';
import { formatDate } from '../utils/date';
import UsageMeter from './UsageMeter';

interface LicenseDetailDrawerProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  license?: License;
  onRenew: () => void;
  onRevoke: () => void;
  onResend: () => void;
  onAssign: () => void;
  onEditQuota: () => void;
}

export default function LicenseDetailDrawer({
  open,
  onOpenChange,
  license,
  onRenew,
  onRevoke,
  onResend,
  onAssign,
  onEditQuota
}: LicenseDetailDrawerProps) {
  return (
    <Dialog.Root open={open} onOpenChange={onOpenChange}>
      <Dialog.Portal>
        <Dialog.Overlay className="fixed inset-0 z-40 bg-slate-900/40" />
        <Dialog.Content className="fixed right-0 top-0 z-50 h-screen w-[95vw] max-w-xl border-l border-slate-200 bg-white p-6 shadow-card animate-[slideIn_220ms_ease-out]">
          <div className="mb-5 flex items-center justify-between">
            <Dialog.Title className="text-lg font-semibold text-slate-900">License Detail</Dialog.Title>
            <Dialog.Close className="rounded-lg p-1 text-slate-500 hover:bg-slate-100">
              <XMarkIcon className="h-5 w-5" />
            </Dialog.Close>
          </div>

          {license ? (
            <div className="space-y-4 text-sm">
              <div className="card !p-4">
                <p className="text-xs uppercase text-slate-500">License key</p>
                <p className="mt-1 break-all font-semibold text-slate-900">{license.license_key}</p>
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div className="card !p-4">
                  <p className="text-xs text-slate-500">Owner</p>
                  <p className="mt-1 font-medium text-slate-900">{license.owner_username ?? '-'}</p>
                </div>
                <div className="card !p-4">
                  <p className="text-xs text-slate-500">HWID</p>
                  <p className="mt-1 font-medium text-slate-900">{license.hwid ?? '-'}</p>
                </div>
                <div className="card !p-4">
                  <p className="text-xs text-slate-500">Expiry date</p>
                  <p className="mt-1 font-medium text-slate-900">{formatDate(license.expiry_date)}</p>
                </div>
                <div className="card !p-4">
                  <p className="text-xs text-slate-500">Last check</p>
                  <p className="mt-1 font-medium text-slate-900">{formatDate(license.last_check)}</p>
                </div>
              </div>
              <div className="card !p-4">
                <p className="mb-2 text-xs text-slate-500">Lượt tải video tháng này</p>
                <UsageMeter usage={license.usage} custom={license.custom_monthly_limit != null} customDaily={license.custom_daily_limit != null} />
              </div>
              <div className="card">
                <p className="mb-3 text-sm font-semibold text-slate-900">Actions</p>
                <div className="flex flex-wrap gap-2">
                  <button className="btn-secondary" onClick={onAssign}>
                    Assign to user
                  </button>
                  <button className="btn-secondary" onClick={onResend}>
                    Resend to email
                  </button>
                  <button className="btn-secondary" onClick={onRenew}>
                    Renew
                  </button>
                  <button className="btn-secondary" onClick={onEditQuota}>
                    Giới hạn tải
                  </button>
                  <button
                    className="btn-primary bg-rose-600 hover:bg-rose-500 disabled:opacity-50"
                    disabled={!license.is_active}
                    onClick={onRevoke}
                  >
                    {license.is_active ? 'Khóa key' : 'Đã khóa'}
                  </button>
                </div>
              </div>
            </div>
          ) : null}
        </Dialog.Content>
      </Dialog.Portal>
    </Dialog.Root>
  );
}
