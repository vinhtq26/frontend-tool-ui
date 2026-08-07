import { useMemo, useState } from 'react';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import KpiCard from '../components/KpiCard';
import TrendChart from '../components/TrendChart';
import { createLicense, listLicenses } from '../services/licenses';
import CreateLicenseModal from '../components/CreateLicenseModal';
import { useToast } from '../components/Toasts';
import { listApplications } from '../services/applications';

export default function Dashboard() {
  const [openCreate, setOpenCreate] = useState(false);
  const queryClient = useQueryClient();
  const { push } = useToast();

  const { data } = useQuery({
    queryKey: ['licenses', 'dashboard'],
    queryFn: () => listLicenses({ limit: 200, offset: 0 })
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
      push({ type: 'success', title: 'License created', message: `Key copied: ${created.license_key}` });
    }
  });

  const stats = useMemo(() => {
    const licenses = data?.items ?? [];
    const total = licenses.length;
    const active = licenses.filter((license) => license.is_active).length;
    const expired = licenses.filter((license) => license.expiry_date && new Date(license.expiry_date) < new Date()).length;
    const pending = licenses.filter((license) => !license.owner_id).length;
    return { total, active, expired, pending };
  }, [data?.items]);

  const trends = useMemo(
    () => [
      { week: 'W1', activations: 8 },
      { week: 'W2', activations: 13 },
      { week: 'W3', activations: 10 },
      { week: 'W4', activations: 16 },
      { week: 'W5', activations: 11 },
      { week: 'W6', activations: 19 }
    ],
    []
  );

  return (
    <section className="space-y-6">
      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        <KpiCard title="Total licenses" value={stats.total} />
        <KpiCard title="Active" value={stats.active} hint="Healthy and valid" />
        <KpiCard title="Expired" value={stats.expired} hint="Need renewal" />
        <KpiCard title="Pending activations" value={stats.pending} hint="Not assigned yet" />
      </div>

      <div className="grid gap-6 lg:grid-cols-[2fr_1fr]">
        <TrendChart data={trends} />
        <aside className="card">
          <h3 className="text-base font-semibold text-slate-900">Quick actions</h3>
          <div className="mt-4 space-y-3">
            <button className="btn-primary w-full" onClick={() => setOpenCreate(true)}>
              Create License
            </button>
            <button className="btn-secondary w-full">Import CSV</button>
          </div>
        </aside>
      </div>

      <CreateLicenseModal
        open={openCreate}
        onOpenChange={setOpenCreate}
        applications={applicationsQuery.data?.items ?? []}
        applicationsLoading={applicationsQuery.isLoading}
        onSubmit={(payload) => createMutation.mutateAsync(payload)}
      />
    </section>
  );
}
