import * as DropdownMenu from '@radix-ui/react-dropdown-menu';
import { EllipsisHorizontalIcon } from '@heroicons/react/24/outline';

interface LicenseRowActionsProps {
  onView: () => void;
  onAssign: () => void;
  onRevoke: () => void;
  onRenew: () => void;
}

export default function LicenseRowActions({ onView, onAssign, onRevoke, onRenew }: LicenseRowActionsProps) {
  return (
    <DropdownMenu.Root>
      <DropdownMenu.Trigger className="rounded-lg p-1 text-slate-500 hover:bg-slate-100">
        <EllipsisHorizontalIcon className="h-5 w-5" />
      </DropdownMenu.Trigger>
      <DropdownMenu.Portal>
        <DropdownMenu.Content sideOffset={6} className="z-50 min-w-32 rounded-xl border border-slate-200 bg-white p-1 shadow-card">
          <DropdownMenu.Item className="cursor-pointer rounded-lg px-3 py-2 text-sm hover:bg-slate-100" onClick={onView}>
            View
          </DropdownMenu.Item>
          <DropdownMenu.Item className="cursor-pointer rounded-lg px-3 py-2 text-sm hover:bg-slate-100" onClick={onAssign}>
            Assign
          </DropdownMenu.Item>
          <DropdownMenu.Item className="cursor-pointer rounded-lg px-3 py-2 text-sm hover:bg-slate-100" onClick={onRenew}>
            Renew
          </DropdownMenu.Item>
          <DropdownMenu.Item className="cursor-pointer rounded-lg px-3 py-2 text-sm text-rose-600 hover:bg-rose-50" onClick={onRevoke}>
            Revoke
          </DropdownMenu.Item>
        </DropdownMenu.Content>
      </DropdownMenu.Portal>
    </DropdownMenu.Root>
  );
}
