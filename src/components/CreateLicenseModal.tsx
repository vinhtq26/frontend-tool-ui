import * as Dialog from '@radix-ui/react-dialog';
import { useEffect, useState } from 'react';
import type { Application } from '../types';

interface CreateLicenseModalProps {
  open: boolean;
  onOpenChange: (value: boolean) => void;
  applications: Application[];
  applicationsLoading?: boolean;
  onSubmit: (payload: { duration_days: number; app_name: string; username?: string }) => Promise<unknown>;
}

export default function CreateLicenseModal({
  open,
  onOpenChange,
  applications,
  applicationsLoading = false,
  onSubmit
}: CreateLicenseModalProps) {
  const [durationDays, setDurationDays] = useState('30');
  const [appName, setAppName] = useState('');
  const [username, setUsername] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (appName && !applications.some((application) => application.name === appName)) {
      setAppName('');
    }
  }, [appName, applications]);

  const handleSubmit = async () => {
    setError('');
    const parsed = Number(durationDays);
    if (!parsed || parsed <= 0) {
      setError('Duration (days) must be greater than 0');
      return;
    }
    if (!appName) {
      setError('Vui lòng chọn ứng dụng');
      return;
    }

    setLoading(true);
    try {
      await onSubmit({
        duration_days: parsed,
        app_name: appName,
        username: username.trim() || undefined
      });
      onOpenChange(false);
      setDurationDays('30');
      setAppName('');
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
              <label className="label" htmlFor="license-application">Ứng dụng</label>
              <select
                id="license-application"
                className="input"
                value={appName}
                onChange={(event) => setAppName(event.target.value)}
                disabled={applicationsLoading || applications.length === 0}
              >
                <option value="">{applicationsLoading ? 'Đang tải...' : 'Chọn ứng dụng'}</option>
                {applications.map((application) => (
                  <option key={application.id} value={application.name}>{application.name}</option>
                ))}
              </select>
              {!applicationsLoading && applications.length === 0 ? (
                <p className="mt-2 text-sm text-amber-600">Chưa có ứng dụng, hãy tạo ứng dụng trước</p>
              ) : null}
            </div>
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
            <button
              className="btn-primary disabled:opacity-50"
              onClick={handleSubmit}
              disabled={loading || applicationsLoading || applications.length === 0 || !appName}
            >
              {loading ? 'Creating...' : 'Create & Copy'}
            </button>
          </div>
        </Dialog.Content>
      </Dialog.Portal>
    </Dialog.Root>
  );
}
