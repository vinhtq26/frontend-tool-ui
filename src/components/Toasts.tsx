import { createContext, useContext, useMemo, useState } from 'react';
import { XMarkIcon } from '@heroicons/react/24/outline';
import { cn } from '../utils/cn';

type ToastType = 'success' | 'warning' | 'error' | 'info';

interface ToastItem {
  id: string;
  title: string;
  message?: string;
  type: ToastType;
}

interface ToastContextValue {
  push: (toast: Omit<ToastItem, 'id'>) => void;
}

const ToastContext = createContext<ToastContextValue | null>(null);

export function ToastProvider({ children }: { children: React.ReactNode }) {
  const [items, setItems] = useState<ToastItem[]>([]);

  const value = useMemo<ToastContextValue>(
    () => ({
      push: (toast) => {
        const id = crypto.randomUUID();
        setItems((prev) => [...prev, { ...toast, id }]);
        window.setTimeout(() => {
          setItems((prev) => prev.filter((item) => item.id !== id));
        }, 3600);
      }
    }),
    []
  );

  return (
    <ToastContext.Provider value={value}>
      {children}
      <div className="fixed right-4 top-4 z-[70] flex w-full max-w-sm flex-col gap-3">
        {items.map((toast) => (
          <article
            key={toast.id}
            className={cn(
              'rounded-xl border p-4 shadow-card backdrop-blur-sm transition',
              toast.type === 'success' && 'border-emerald-200 bg-emerald-50',
              toast.type === 'warning' && 'border-amber-200 bg-amber-50',
              toast.type === 'error' && 'border-rose-200 bg-rose-50',
              toast.type === 'info' && 'border-slate-200 bg-white'
            )}
          >
            <div className="flex items-start justify-between gap-3">
              <div>
                <h4 className="text-sm font-semibold text-slate-900">{toast.title}</h4>
                {toast.message ? <p className="mt-1 text-xs text-slate-600">{toast.message}</p> : null}
              </div>
              <button
                type="button"
                className="rounded-lg p-1 text-slate-500 hover:bg-white"
                onClick={() => setItems((prev) => prev.filter((item) => item.id !== toast.id))}
              >
                <XMarkIcon className="h-4 w-4" />
              </button>
            </div>
          </article>
        ))}
      </div>
    </ToastContext.Provider>
  );
}

export function useToast() {
  const ctx = useContext(ToastContext);
  if (!ctx) throw new Error('useToast must be used in ToastProvider');
  return ctx;
}
