import * as Dialog from '@radix-ui/react-dialog';
import { useEffect, useState } from 'react';
import type { Application } from '../types';
import type { ApplicationPayload } from '../services/applications';

interface ApplicationModalProps {
  open: boolean;
  application?: Application | null;
  onOpenChange: (open: boolean) => void;
  onSubmit: (payload: ApplicationPayload) => Promise<unknown>;
}

export default function ApplicationModal({ open, application, onOpenChange, onSubmit }: ApplicationModalProps) {
  const [name, setName] = useState('');
  const [description, setDescription] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (!open) return;
    setName(application?.name ?? '');
    setDescription(application?.description ?? '');
    setError('');
  }, [application, open]);

  const handleSubmit = async () => {
    const normalizedName = name.trim();
    if (normalizedName.length < 1 || normalizedName.length > 100) {
      setError('Tên ứng dụng phải có từ 1 đến 100 ký tự');
      return;
    }

    setLoading(true);
    setError('');
    try {
      await onSubmit({
        name: normalizedName,
        description: description.trim() || null
      });
      onOpenChange(false);
    } catch (submitError) {
      setError(submitError instanceof Error ? submitError.message : 'Không thể lưu ứng dụng');
    } finally {
      setLoading(false);
    }
  };

  return (
    <Dialog.Root open={open} onOpenChange={onOpenChange}>
      <Dialog.Portal>
        <Dialog.Overlay className="fixed inset-0 z-40 bg-slate-900/45" />
        <Dialog.Content className="fixed left-1/2 top-1/2 z-50 w-[92vw] max-w-lg -translate-x-1/2 -translate-y-1/2 rounded-2xl border border-slate-200 bg-white p-6 shadow-card">
          <Dialog.Title className="text-lg font-semibold text-slate-900">
            {application ? 'Sửa ứng dụng' : 'Thêm ứng dụng'}
          </Dialog.Title>
          <Dialog.Description className="mt-1 text-sm text-slate-500">
            Tên ứng dụng sẽ được dùng khi tạo user và license.
          </Dialog.Description>

          <div className="mt-6 space-y-4">
            <div>
              <label className="label" htmlFor="application-name">Tên ứng dụng</label>
              <input
                id="application-name"
                className="input"
                value={name}
                maxLength={100}
                onChange={(event) => setName(event.target.value)}
                placeholder="tool_reup_youtube_master"
              />
              <p className="mt-1 text-right text-xs text-slate-400">{name.length}/100</p>
            </div>
            <div>
              <label className="label" htmlFor="application-description">Mô tả</label>
              <textarea
                id="application-description"
                className="min-h-28 w-full rounded-xl border border-slate-300 bg-white px-3 py-2 text-sm text-slate-900 placeholder:text-slate-400 focus:border-indigo-400 focus:outline-none focus:ring-2 focus:ring-indigo-100"
                value={description}
                onChange={(event) => setDescription(event.target.value)}
                placeholder="Mô tả ứng dụng (không bắt buộc)"
              />
            </div>
            {error ? <p className="text-sm text-rose-600">{error}</p> : null}
          </div>

          <div className="mt-6 flex justify-end gap-3">
            <button className="btn-secondary" onClick={() => onOpenChange(false)} disabled={loading}>Huỷ</button>
            <button className="btn-primary" onClick={handleSubmit} disabled={loading || !name.trim()}>
              {loading ? 'Đang lưu...' : 'Lưu ứng dụng'}
            </button>
          </div>
        </Dialog.Content>
      </Dialog.Portal>
    </Dialog.Root>
  );
}
