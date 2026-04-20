import * as Dialog from '@radix-ui/react-dialog';
import { XMarkIcon } from '@heroicons/react/24/outline';

interface ErrorModalProps {
  open: boolean;
  title: string;
  message: string;
  onClose: () => void;
}

export default function ErrorModal({ open, title, message, onClose }: ErrorModalProps) {
  return (
    <Dialog.Root open={open} onOpenChange={onClose}>
      <Dialog.Portal>
        <Dialog.Overlay className="fixed inset-0 z-40 bg-slate-900/45" />
        <Dialog.Content className="fixed left-1/2 top-1/2 z-50 w-[92vw] max-w-lg -translate-x-1/2 -translate-y-1/2 rounded-2xl border border-rose-200 bg-white p-6 shadow-card">
          <div className="mb-4 flex items-center justify-between">
            <Dialog.Title className="text-lg font-semibold text-slate-900">{title}</Dialog.Title>
            <Dialog.Close className="rounded-lg p-1 text-slate-500 hover:bg-slate-100">
              <XMarkIcon className="h-5 w-5" />
            </Dialog.Close>
          </div>
          <Dialog.Description className="rounded-xl border border-rose-100 bg-rose-50 p-3 text-sm text-rose-700">
            {message}
          </Dialog.Description>
          <div className="mt-5 flex justify-end">
            <button className="btn-secondary" onClick={onClose}>
              Close
            </button>
          </div>
        </Dialog.Content>
      </Dialog.Portal>
    </Dialog.Root>
  );
}
