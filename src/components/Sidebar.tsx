import { NavLink } from 'react-router-dom';
import {
  HomeIcon,
  KeyIcon,
  UsersIcon,
  ClipboardDocumentListIcon,
  Cog6ToothIcon,
  XMarkIcon
} from '@heroicons/react/24/outline';
import { cn } from '../utils/cn';

const menus = [
  { name: 'Dashboard', to: '/dashboard', icon: HomeIcon },
  { name: 'Licenses', to: '/licenses', icon: KeyIcon },
  { name: 'Users', to: '/users', icon: UsersIcon },
  { name: 'Audit', to: '/audit', icon: ClipboardDocumentListIcon },
  { name: 'Settings', to: '/settings', icon: Cog6ToothIcon }
];

interface SidebarProps {
  open: boolean;
  onClose: () => void;
}

export default function Sidebar({ open, onClose }: SidebarProps) {
  return (
    <>
      <aside
        className={cn(
          'fixed inset-y-0 left-0 z-30 w-72 border-r border-slate-200 bg-white/95 px-4 py-6 backdrop-blur-sm transition-transform duration-300 md:translate-x-0',
          open ? 'translate-x-0' : '-translate-x-full'
        )}
      >
        <div className="mb-8 flex items-center justify-between px-2">
          <h1 className="text-lg font-extrabold tracking-tight text-slate-900">LicenseOps</h1>
          <button className="rounded-lg p-1 text-slate-500 hover:bg-slate-100 md:hidden" onClick={onClose}>
            <XMarkIcon className="h-5 w-5" />
          </button>
        </div>

        <nav className="space-y-1.5">
          {menus.map((menu) => {
            const Icon = menu.icon;
            return (
              <NavLink
                key={menu.to}
                to={menu.to}
                className={({ isActive }) =>
                  cn(
                    'flex items-center gap-3 rounded-xl px-3 py-2.5 text-sm font-medium transition',
                    isActive
                      ? 'bg-indigo-50 text-indigo-700'
                      : 'text-slate-600 hover:bg-slate-100 hover:text-slate-900'
                  )
                }
                onClick={onClose}
              >
                <Icon className="h-5 w-5" />
                {menu.name}
              </NavLink>
            );
          })}
        </nav>
      </aside>

      {open ? <div className="fixed inset-0 z-20 bg-slate-900/20 md:hidden" onClick={onClose} /> : null}
    </>
  );
}
