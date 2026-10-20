import { useMemo, useState } from 'react';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';
import LicenseTable from '../components/LicenseTable';
import CreateLicenseModal from '../components/CreateLicenseModal';
import AssignUserModal from '../components/AssignUserModal';
import ConfirmDialog from '../components/ConfirmDialog';
import ErrorModal from '../components/ErrorModal';
import LicenseDetailDrawer from '../components/LicenseDetailDrawer';
import QuotaLimitModal from '../components/QuotaLimitModal';
import { assignLicense, createLicense, deleteLicensesBatch, listLicenses, renewLicense, revokeLicense, setLicenseQuotaLimit } from '../services/licenses';
import type { License } from '../types';
import { useDebounce } from '../hooks/useDebounce';
import { useToast } from '../components/Toasts';
import { useAuth } from '../contexts/AuthContext';
import { formatBatchItems } from '../utils/batchDelete';
import { listApplications } from '../services/applications';

const pageSizes = [5, 10, 20, 50];

export default function Licenses() {
  const [search, setSearch] = useState('');
  const [status, setStatus] = useState('');
  const [owner, setOwner] = useState('');
  const [expiryFrom, setExpiryFrom] = useState('');
  const [expiryTo, setExpiryTo] = useState('');
  const [pageSize, setPageSize] = useState(10);
  const [page, setPage] = useState(1);

  const [openCreate, setOpenCreate] = useState(false);
  const [openAssign, setOpenAssign] = useState(false);
  const [openConfirm, setOpenConfirm] = useState(false);
  const [openDetail, setOpenDetail] = useState(false);
  const [openQuota, setOpenQuota] = useState(false);
  const [selected, setSelected] = useState<License | null>(null);
  const [selectedLicenseIds, setSelectedLicenseIds] = useState<Set<number>>(() => new Set());
  const [openBatchDelete, setOpenBatchDelete] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const debouncedSearch = useDebounce(search);
  const queryClient = useQueryClient();
  const navigate = useNavigate();
  const { signOut } = useAuth();
  const { push } = useToast();

  const query = useQuery({
    queryKey: ['licenses', page, pageSize, status, owner, debouncedSearch, expiryFrom, expiryTo],
    queryFn: () =>
      listLicenses({
        limit: pageSize,
        offset: (page - 1) * pageSize,
        status: status || undefined,
        owner: owner || undefined,
        search: debouncedSearch || undefined,
        expiry_from: expiryFrom || undefined,
        expiry_to: expiryTo || undefined
      })
  });

  const applicationsQuery = useQuery({
    queryKey: ['applications'],
    queryFn: () => listApplications({ limit: 100, offset: 0 }),
    enabled: openCreate
  });

  const createMutation = useMutation({
    mutationFn: createLicense,
    onSuccess: (created) => {
      queryClient.invalidateQueries({ queryKey: ['licenses'] });
      navigator.clipboard.writeText(created.license_key).catch(() => undefined);
      push({ type: 'success', title: 'License created', message: created.license_key });
    },
    onError: (err: Error) => setError(err.message)
  });

  const assignMutation = useMutation({
    mutationFn: ({ key, username }: { key: string; username: string }) => assignLicense(key, { username }),
    onMutate: async ({ key, username }) => {
      await queryClient.cancelQueries({ queryKey: ['licenses'] });
      const previous = queryClient.getQueriesData({ queryKey: ['licenses'] });
      queryClient.setQueriesData({ queryKey: ['licenses'] }, (old: any) => {
        if (!old?.items) return old;
        return {
          ...old,
          items: old.items.map((item: License) =>
            item.license_key === key ? { ...item, owner_username: username } : item
          )
        };
      });
      return { previous };
    },
    onError: (err: Error, _vars, context) => {
      context?.previous?.forEach(([q, data]: any) => queryClient.setQueryData(q, data));
      setError(err.message);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['licenses'] });
      push({ type: 'success', title: 'Assigned successfully' });
    }
  });

  const revokeMutation = useMutation({
    mutationFn: revokeLicense,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['licenses'] });
      push({ type: 'success', title: 'Đã khóa key', message: 'License không thể đăng nhập hay tải video nữa.' });
    },
    onError: (err: Error) => setError(err.message)
  });

  const renewMutation = useMutation({
    mutationFn: ({ key, extraDays }: { key: string; extraDays: number }) => renewLicense(key, { extra_days: extraDays }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['licenses'] });
      push({ type: 'success', title: 'License renewed' });
    },
    onError: (err: Error) => setError(err.message)
  });

  const quotaMutation = useMutation({
    mutationFn: ({ key, limit }: { key: string; limit: number | null }) => setLicenseQuotaLimit(key, limit),
    onSuccess: (updated) => {
      setSelected((current) => (current?.license_key === updated.license_key ? updated : current));
      queryClient.invalidateQueries({ queryKey: ['licenses'] });
      queryClient.invalidateQueries({ queryKey: ['license-detail', updated.license_key] });
      push({
        type: 'success',
        title: 'Đã lưu giới hạn tải',
        message: updated.custom_monthly_limit == null ? 'License dùng cấu hình chung.' : `Giới hạn riêng: ${updated.custom_monthly_limit} video/tháng.`
      });
    },
    onError: (err: Error) => setError(err.message)
  });

  const batchDeleteMutation = useMutation({
    mutationFn: deleteLicensesBatch,
    onSuccess: (result) => {
      setSelectedLicenseIds(new Set());
      const details = [
        result.skipped_assigned.length ? `Bỏ qua ${result.skipped_assigned.length} license đang gắn user.` : '',
        result.not_found.length ? `Không tìm thấy: ${result.not_found.join(', ')}.` : '',
        result.failed.length ? `Lỗi khi xoá: ${formatBatchItems(result.failed)}.` : ''
      ].filter(Boolean).join(' ');

      push({
        type: result.skipped_assigned.length || result.not_found.length || result.failed.length ? 'warning' : 'success',
        title: `Đã xoá ${result.deleted.length} license.`,
        message: details || undefined
      });
    },
    onError: (error) => {
      if (axios.isAxiosError(error) && error.response?.status === 401) {
        signOut();
        navigate('/login', { replace: true });
        return;
      }
      if (axios.isAxiosError(error) && error.response?.status === 403) {
        push({ type: 'error', title: 'Bạn không có quyền xoá license.' });
        return;
      }
      push({
        type: 'error',
        title: 'Không thể xoá các license đã chọn.',
        message: error instanceof Error ? error.message : undefined
      });
    },
    onSettled: () => queryClient.invalidateQueries({ queryKey: ['licenses'] })
  });

  const toggleLicense = (licenseId: number) => {
    setSelectedLicenseIds((current) => {
      const next = new Set(current);
      if (next.has(licenseId)) next.delete(licenseId);
      else next.add(licenseId);
      return next;
    });
  };

  const totalPages = useMemo(() => Math.max(1, Math.ceil((query.data?.total ?? 0) / pageSize)), [query.data, pageSize]);

  return (
    <section className="space-y-4">
      <div className="flex flex-col gap-3 rounded-2xl border border-slate-200 bg-white p-4 shadow-card md:flex-row md:items-end">
        <div className="flex-1">
          <label className="label">Search</label>
          <input
            className="input"
            placeholder="Search by key/username"
            value={search}
            onChange={(event) => {
              setPage(1);
              setSearch(event.target.value);
            }}
          />
        </div>
        <div className="md:w-44">
          <label className="label">Status</label>
          <select
            className="input"
            value={status}
            onChange={(event) => {
              setPage(1);
              setStatus(event.target.value);
            }}
          >
            <option value="">All</option>
            <option value="active">Active</option>
            <option value="inactive">Inactive</option>
            <option value="expired">Expired</option>
          </select>
        </div>
        <div className="md:w-44">
          <label className="label">Owner</label>
          <input
            className="input"
            placeholder="alice"
            value={owner}
            onChange={(event) => {
              setPage(1);
              setOwner(event.target.value);
            }}
          />
        </div>
        <div className="md:w-44">
          <label className="label">Expiry from</label>
          <input
            type="date"
            className="input"
            value={expiryFrom}
            onChange={(event) => {
              setPage(1);
              setExpiryFrom(event.target.value);
            }}
          />
        </div>
        <div className="md:w-44">
          <label className="label">Expiry to</label>
          <input
            type="date"
            className="input"
            value={expiryTo}
            onChange={(event) => {
              setPage(1);
              setExpiryTo(event.target.value);
            }}
          />
        </div>
        <button className="btn-primary" onClick={() => setOpenCreate(true)}>
          Create License
        </button>
        <button
          className="btn-primary bg-rose-600 hover:bg-rose-500 disabled:opacity-50"
          disabled={selectedLicenseIds.size === 0 || batchDeleteMutation.isPending}
          onClick={() => setOpenBatchDelete(true)}
        >
          Xoá đã chọn{selectedLicenseIds.size ? ` (${selectedLicenseIds.size})` : ''}
        </button>
      </div>

      {query.isLoading ? <div className="card">Loading licenses...</div> : null}
      {query.data ? (
        <LicenseTable
          licenses={query.data.items}
          selectedIds={selectedLicenseIds}
          onToggle={toggleLicense}
          onToggleAll={(checked) => {
            setSelectedLicenseIds((current) => {
              const next = new Set(current);
              query.data.items.forEach((license) => checked ? next.add(license.id) : next.delete(license.id));
              return next;
            });
          }}
          onView={(item) => {
            setSelected(item);
            setOpenDetail(true);
          }}
          onAssign={(item) => {
            setSelected(item);
            setOpenAssign(true);
          }}
          onRevoke={(item) => {
            setSelected(item);
            setOpenConfirm(true);
          }}
          onEditQuota={(item) => {
            setSelected(item);
            setOpenQuota(true);
          }}
          onRenew={(item) => {
            const input = window.prompt('Extra days', '30');
            const parsed = Number(input);
            if (parsed > 0) {
              renewMutation.mutate({ key: item.license_key, extraDays: parsed });
            }
          }}
        />
      ) : null}

      <div className="flex flex-wrap items-center justify-between gap-3 rounded-2xl border border-slate-200 bg-white px-4 py-3 text-sm">
        <div className="text-slate-600">
          Showing {query.data?.items.length ?? 0} / {query.data?.total ?? 0}
        </div>
        <div className="flex items-center gap-2">
          <label className="text-slate-500">Page size</label>
          <select
            className="rounded-lg border border-slate-300 px-2 py-1"
            value={pageSize}
            onChange={(event) => {
              setPageSize(Number(event.target.value));
              setPage(1);
            }}
          >
            {pageSizes.map((size) => (
              <option key={size} value={size}>
                {size}
              </option>
            ))}
          </select>
          <button className="btn-secondary !h-9 !px-3 !py-0" disabled={page === 1} onClick={() => setPage((p) => p - 1)}>
            Prev
          </button>
          <span>
            {page}/{totalPages}
          </span>
          <button
            className="btn-secondary !h-9 !px-3 !py-0"
            disabled={page >= totalPages}
            onClick={() => setPage((p) => p + 1)}
          >
            Next
          </button>
        </div>
      </div>

      <CreateLicenseModal
        open={openCreate}
        onOpenChange={setOpenCreate}
        applications={applicationsQuery.data?.items ?? []}
        applicationsLoading={applicationsQuery.isLoading}
        onSubmit={(payload) => createMutation.mutateAsync(payload)}
      />
      <AssignUserModal
        open={openAssign}
        onOpenChange={setOpenAssign}
        onSubmit={(username) => assignMutation.mutateAsync({ key: selected?.license_key ?? '', username })}
      />
      <ConfirmDialog
        open={openConfirm}
        onOpenChange={setOpenConfirm}
        title="Khóa key"
        description={`Khóa key ${selected?.license_key ?? ''}? License sẽ bị chặn đăng nhập và tải video ngay lập tức. Hiện chưa thể mở khóa lại từng key riêng lẻ.`}
        confirmLabel="Khóa key"
        onConfirm={() => selected && revokeMutation.mutate(selected.license_key)}
      />
      <ConfirmDialog
        open={openBatchDelete}
        onOpenChange={setOpenBatchDelete}
        title="Xoá các license đã chọn"
        description={`Bạn sắp yêu cầu xoá ${selectedLicenseIds.size} license. License đã gắn user sẽ không bị xoá và sẽ được backend tự động bỏ qua.`}
        confirmLabel="Xoá license"
        onConfirm={() => batchDeleteMutation.mutate(Array.from(selectedLicenseIds))}
      />
      <LicenseDetailDrawer
        open={openDetail}
        onOpenChange={setOpenDetail}
        license={selected ?? undefined}
        onAssign={() => {
          setOpenDetail(false);
          setOpenAssign(true);
        }}
        onRenew={() => {
          if (!selected) return;
          const input = window.prompt('Extra days', '30');
          const parsed = Number(input);
          if (parsed > 0) renewMutation.mutate({ key: selected.license_key, extraDays: parsed });
        }}
        onRevoke={() => {
          setOpenDetail(false);
          setOpenConfirm(true);
        }}
        onEditQuota={() => {
          setOpenDetail(false);
          setOpenQuota(true);
        }}
        onResend={() => push({ type: 'info', title: 'Email queued', message: 'Mock endpoint: /admin/licenses/{key}/resend' })}
      />

      <QuotaLimitModal
        open={openQuota}
        onOpenChange={setOpenQuota}
        license={selected}
        onSubmit={(limit) => quotaMutation.mutateAsync({ key: selected?.license_key ?? '', limit })}
      />

      <ErrorModal open={Boolean(error)} title="Server error" message={error ?? ''} onClose={() => setError(null)} />

      <button className="hidden" onClick={() => selected && navigate(`/licenses/${selected.license_key}`)}>
        Open detail route
      </button>
    </section>
  );
}
