import * as Dialog from '@radix-ui/react-dialog';
import { useState } from 'react';

interface AssignUserModalProps {
  open: boolean;
  onOpenChange: (value: boolean) => void;
  onSubmit: (username: string) => Promise<void>;
}

export default function AssignUserModal({ open, onOpenChange, onSubmit }: AssignUserModalProps) {
  const [username, setUsername] = useState('');
  const [error, setError] = useState('');

  return (
    <Dialog.Root open={open} onOpenChange={onOpenChange}>
      <Dialog.Portal>
        <Dialog.Overlay className="fixed inset-0 z-40 bg-slate-900/45" />
        <Dialog.Content className="fixed left-1/2 top-1/2 z-50 w-[92vw] max-w-md -translate-x-1/2 -translate-y-1/2 rounded-2xl border border-slate-200 bg-white p-6 shadow-card">
          <Dialog.Title className="text-lg font-semibold text-slate-900">Assign License</Dialog.Title>
          <Dialog.Description className="mt-1 text-sm text-slate-500">Attach this license to a username.</Dialog.Description>
          <div className="mt-5">
            <label className="label">Owner</label>
            <input
              className="input"
              value={username}
              onChange={(event) => setUsername(event.target.value)}
              placeholder="alice"
            />
            {error ? <p className="mt-2 text-sm text-rose-600">{error}</p> : null}
          </div>
          <div className="mt-6 flex justify-end gap-3">
            <button className="btn-secondary" onClick={() => onOpenChange(false)}>
              Cancel
            </button>
            <button
              className="btn-primary"
              onClick={async () => {
                if (!username.trim()) {
                  setError('Please enter username');
                  return;
                }
                setError('');
                await onSubmit(username.trim());
                onOpenChange(false);
                setUsername('');
              }}
            >
              Assign
            </button>
          </div>
        </Dialog.Content>
      </Dialog.Portal>
    </Dialog.Root>
  );
}
