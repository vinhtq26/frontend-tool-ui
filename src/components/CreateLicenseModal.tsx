import * as Dialog from '@radix-ui/react-dialog';
import { useState } from 'react';

interface CreateLicenseModalProps {
  open: boolean;
  onOpenChange: (value: boolean) => void;
  onSubmit: (payload: { duration_days: number; username?: string }) => Promise<unknown>;
}

export default function CreateLicenseModal({ open, onOpenChange, onSubmit }: CreateLicenseModalProps) {
  const [durationDays, setDurationDays] = useState('30');
  const [username, setUsername] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async () => {
    setError('');
    const parsed = Number(durationDays);
    if (!parsed || parsed <= 0) {
      setError('Duration (days) must be greater than 0');
      return;
    }

    setLoading(true);
    try {
      await onSubmit({
        duration_days: parsed,
        username: username.trim() || undefined
      });
      onOpenChange(false);
      setDurationDays('30');
      setUsername('');
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to create license');
    } finally {
      setLoading(false);
    }
  };

  return (
    <Dialog.Root open={open} onOpenChange={onOpenChange}>
      <Dialog.Portal>
        <Dialog.Overlay className="fixed inset-0 z-40 bg-slate-900/45" />
        <Dialog.Content className="fixed left-1/2 top-1/2 z-50 w-[92vw] max-w-lg -translate-x-1/2 -translate-y-1/2 rounded-2xl border border-slate-200 bg-white p-6 shadow-card">
          <Dialog.Title className="text-lg font-semibold text-slate-900">Create License</Dialog.Title>
          <Dialog.Description className="mt-1 text-sm text-slate-500">
            Generate a new key and optionally assign to a user.
          </Dialog.Description>

          <div className="mt-6 space-y-4">
            <div>
              <label className="label" htmlFor="duration-days">
                Duration (days)
              </label>
              <input
                id="duration-days"
                className="input"
                type="number"
                value={durationDays}
                onChange={(event) => setDurationDays(event.target.value)}
                placeholder="30"
              />
            </div>
            <div>
              <label className="label" htmlFor="assign-user">
                Assign to user (optional)
              </label>
              <input
                id="assign-user"
                className="input"
                value={username}
                onChange={(event) => setUsername(event.target.value)}
                placeholder="alice"
              />
            </div>
            {error ? <p className="text-sm text-rose-600">{error}</p> : null}
          </div>

          <div className="mt-6 flex justify-end gap-3">
            <button className="btn-secondary" onClick={() => onOpenChange(false)}>
              Cancel
            </button>
            <button className="btn-primary" onClick={handleSubmit} disabled={loading}>
              {loading ? 'Creating...' : 'Create & Copy'}
            </button>
          </div>
        </Dialog.Content>
      </Dialog.Portal>
    </Dialog.Root>
  );
}
