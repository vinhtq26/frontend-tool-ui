import { useEffect, useState } from 'react';
import axios from 'axios';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { useNavigate } from 'react-router-dom';
import ApplicationModal from '../components/ApplicationModal';
import ConfirmDialog from '../components/ConfirmDialog';
import { useToast } from '../components/Toasts';
import { useAuth } from '../contexts/AuthContext';
import {
  createApplication,
  deleteApplication,
  getApplication,
  listApplications,
  updateApplication
} from '../services/applications';
import type { Application } from '../types';
import { getApplicationErrorMessage } from '../utils/applicationError';
import { formatDate } from '../utils/date';

export default function Applications() {
  const [openForm, setOpenForm] = useState(false);
  const [editingApplication, setEditingApplication] = useState<Application | null>(null);
  const [pendingDelete, setPendingDelete] = useState<Application | null>(null);
  const queryClient = useQueryClient();
  const navigate = useNavigate();
  const { signOut } = useAuth();
  const { push } = useToast();

  const applicationsQuery = useQuery({
    queryKey: ['applications'],
    queryFn: () => listApplications({ limit: 100, offset: 0 })
  });

  useEffect(() => {
    const error = applicationsQuery.error;
    if (axios.isAxiosError(error) && error.response?.status === 401) {
      signOut();
      navigate('/login', { replace: true });
    }
  }, [applicationsQuery.error, navigate, signOut]);

  const createMutation = useMutation({
    mutationFn: createApplication,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['applications'] });
      push({ type: 'success', title: 'Đã thêm ứng dụng.' });
    }
  });

  const updateMutation = useMutation({
    mutationFn: ({ id, payload }: { id: number; payload: Parameters<typeof updateApplication>[1] }) =>
      updateApplication(id, payload),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['applications'] });
      push({ type: 'success', title: 'Đã cập nhật ứng dụng.' });
    }
  });

  const deleteMutation = useMutation({
    mutationFn: deleteApplication,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['applications'] });
      push({ type: 'success', title: 'Đã xoá ứng dụng.' });
    },
    onError: (error) => {
      if (axios.isAxiosError(error) && error.response?.status === 401) {
        signOut();
        navigate('/login', { replace: true });
        return;
      }
      push({ type: 'error', title: getApplicationErrorMessage(error) });
    },
    onSettled: () => setPendingDelete(null)
  });

  const openEditForm = async (applicationId: number) => {
    try {
      const application = await getApplication(applicationId);
      setEditingApplication(application);
      setOpenForm(true);
    } catch (error) {
      if (axios.isAxiosError(error) && error.response?.status === 401) {
        signOut();
        navigate('/login', { replace: true });
        return;
      }
      push({ type: 'error', title: getApplicationErrorMessage(error) });
    }
  };

  const rows = applicationsQuery.data?.items ?? [];

  return (
    <section className="space-y-4">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <h2 className="text-xl font-bold text-slate-900">Ứng dụng</h2>
          <p className="mt-1 text-sm text-slate-500">Quản lý ứng dụng và sản phẩm dùng cho user, license.</p>
        </div>
        <button
          className="btn-primary"
          onClick={() => {
            setEditingApplication(null);
            setOpenForm(true);
          }}
        >
          Thêm ứng dụng
        </button>
      </div>

      {applicationsQuery.isLoading ? <div className="card">Đang tải ứng dụng...</div> : null}
      {applicationsQuery.isError && !(axios.isAxiosError(applicationsQuery.error) && applicationsQuery.error.response?.status === 401) ? (
        <div className="card text-sm text-rose-600">{getApplicationErrorMessage(applicationsQuery.error)}</div>
      ) : null}

      {!applicationsQuery.isLoading && !applicationsQuery.isError && rows.length === 0 ? (
        <div className="card text-center">
          <p className="font-medium text-slate-800">Chưa có ứng dụng</p>
          <p className="mt-1 text-sm text-slate-500">Hãy tạo ứng dụng đầu tiên trước khi tạo user hoặc license.</p>
        </div>
      ) : null}

      {rows.length > 0 ? (
        <div className="overflow-x-auto rounded-2xl border border-slate-200 bg-white shadow-card">
          <table className="min-w-full divide-y divide-slate-200 text-sm">
            <thead className="bg-slate-50 text-left text-xs uppercase tracking-wide text-slate-500">
              <tr>
                <th className="px-4 py-3">ID</th>
                <th className="px-4 py-3">Tên ứng dụng</th>
                <th className="px-4 py-3">Mô tả</th>
                <th className="px-4 py-3">Ngày tạo</th>
                <th className="px-4 py-3">Ngày cập nhật</th>
                <th className="px-4 py-3" />
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {rows.map((application) => (
                <tr key={application.id} className="text-slate-700 hover:bg-slate-50">
                  <td className="px-4 py-3">{application.id}</td>
                  <td className="px-4 py-3 font-medium text-slate-900">{application.name}</td>
                  <td className="max-w-sm px-4 py-3 text-slate-600">{application.description || '—'}</td>
                  <td className="px-4 py-3 whitespace-nowrap">{formatDate(application.created_at.replace(' ', 'T'))}</td>
                  <td className="px-4 py-3 whitespace-nowrap">
                    {application.updated_at ? formatDate(application.updated_at.replace(' ', 'T')) : '—'}
                  </td>
                  <td className="px-4 py-3">
                    <div className="flex justify-end gap-2">
                      <button className="btn-secondary !h-8 !px-3 !py-0" onClick={() => openEditForm(application.id)}>Sửa</button>
                      <button
                        className="rounded-lg px-3 py-1.5 text-sm font-medium text-rose-600 hover:bg-rose-50"
                        onClick={() => setPendingDelete(application)}
                      >
                        Xoá
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      ) : null}

      <ApplicationModal
        open={openForm}
        application={editingApplication}
        onOpenChange={setOpenForm}
        onSubmit={async (payload) => {
          try {
            if (editingApplication) await updateMutation.mutateAsync({ id: editingApplication.id, payload });
            else await createMutation.mutateAsync(payload);
          } catch (error) {
            if (axios.isAxiosError(error) && error.response?.status === 401) {
              signOut();
              navigate('/login', { replace: true });
            }
            throw new Error(getApplicationErrorMessage(error));
          }
        }}
      />

      <ConfirmDialog
        open={Boolean(pendingDelete)}
        onOpenChange={(open) => {
          if (!open) setPendingDelete(null);
        }}
        title="Xoá ứng dụng"
        description={pendingDelete ? `Bạn có chắc muốn xoá ứng dụng “${pendingDelete.name}”?` : ''}
        confirmLabel="Xoá ứng dụng"
        onConfirm={() => pendingDelete && deleteMutation.mutate(pendingDelete.id)}
      />
    </section>
  );
}
