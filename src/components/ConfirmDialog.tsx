import * as Dialog from '@radix-ui/react-dialog';
import { ExclamationTriangleIcon, XMarkIcon } from '@heroicons/react/24/outline';

interface ConfirmDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  title: string;
  description: string;
  onConfirm: () => void;
  confirmLabel?: string;
}

export default function ConfirmDialog({
  open,
  onOpenChange,
  title,
  description,
  onConfirm,
  confirmLabel = 'Confirm'
}: ConfirmDialogProps) {
  return (
    <Dialog.Root open={open} onOpenChange={onOpenChange}>
      <Dialog.Portal>
        <Dialog.Overlay className="fixed inset-0 z-40 bg-slate-900/45 backdrop-blur-sm" />
        <Dialog.Content className="fixed left-1/2 top-1/2 z-50 w-[92vw] max-w-md -translate-x-1/2 -translate-y-1/2 rounded-2xl border border-slate-200 bg-white p-6 shadow-card">
          <div className="mb-4 flex items-start justify-between">
            <div className="flex items-center gap-3">
              <span className="rounded-full bg-amber-100 p-2 text-amber-700">
                <ExclamationTriangleIcon className="h-5 w-5" />
              </span>
              <Dialog.Title className="text-lg font-semibold text-slate-900">{title}</Dialog.Title>
            </div>
            <Dialog.Close className="rounded-lg p-1 text-slate-500 hover:bg-slate-100">
              <XMarkIcon className="h-5 w-5" />
            </Dialog.Close>
          </div>
          <Dialog.Description className="text-sm text-slate-600">{description}</Dialog.Description>
          <div className="mt-6 flex justify-end gap-3">
            <Dialog.Close className="btn-secondary">Cancel</Dialog.Close>
            <button
              type="button"
              className="btn-primary bg-rose-600 hover:bg-rose-500"
              onClick={() => {
                onConfirm();
                onOpenChange(false);
              }}
            >
              {confirmLabel}
            </button>
          </div>
        </Dialog.Content>
      </Dialog.Portal>
    </Dialog.Root>
  );
}
