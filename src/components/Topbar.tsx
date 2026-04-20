import * as DropdownMenu from '@radix-ui/react-dropdown-menu';
import { BellIcon, MagnifyingGlassIcon, Bars3Icon, ChevronDownIcon } from '@heroicons/react/24/outline';
import { useAuth } from '../contexts/AuthContext';

interface TopbarProps {
  onMenu: () => void;
}

export default function Topbar({ onMenu }: TopbarProps) {
  const { username, signOut } = useAuth();

  return (
    <header className="sticky top-0 z-10 border-b border-slate-200 bg-white/85 px-4 py-3 backdrop-blur md:px-8">
      <div className="flex items-center gap-3">
        <button className="rounded-lg p-1 text-slate-600 hover:bg-slate-100 md:hidden" onClick={onMenu}>
          <Bars3Icon className="h-6 w-6" />
        </button>
        <div className="relative max-w-xl flex-1">
          <MagnifyingGlassIcon className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
          <input className="input pl-9" placeholder="Search licenses, users, events..." />
        </div>
        <button className="rounded-full border border-slate-200 p-2 text-slate-600 hover:bg-slate-50">
          <BellIcon className="h-5 w-5" />
        </button>
        <DropdownMenu.Root>
          <DropdownMenu.Trigger className="inline-flex items-center gap-2 rounded-full border border-slate-200 bg-white px-3 py-1.5 text-sm font-medium text-slate-700 hover:bg-slate-50">
            <span className="inline-flex h-8 w-8 items-center justify-center rounded-full bg-indigo-600 text-xs font-semibold text-white">
              {(username ?? 'U').slice(0, 1).toUpperCase()}
            </span>
            {username ?? 'User'}
            <ChevronDownIcon className="h-4 w-4" />
          </DropdownMenu.Trigger>
          <DropdownMenu.Portal>
            <DropdownMenu.Content
              sideOffset={8}
              className="z-50 min-w-40 rounded-xl border border-slate-200 bg-white p-1 shadow-card"
            >
              <DropdownMenu.Item className="cursor-pointer rounded-lg px-3 py-2 text-sm text-slate-700 outline-none hover:bg-slate-100">
                Profile
              </DropdownMenu.Item>
              <DropdownMenu.Item
                className="cursor-pointer rounded-lg px-3 py-2 text-sm text-rose-600 outline-none hover:bg-rose-50"
                onClick={signOut}
              >
                Sign out
              </DropdownMenu.Item>
            </DropdownMenu.Content>
          </DropdownMenu.Portal>
        </DropdownMenu.Root>
      </div>
    </header>
  );
}
