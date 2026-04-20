import { useQuery } from '@tanstack/react-query';
import { listAuditEvents } from '../services/audit';
import { formatDate } from '../utils/date';

export default function Audit() {
  const query = useQuery({ queryKey: ['audit'], queryFn: () => listAuditEvents(50, 0) });

  return (
    <section className="card">
      <h2 className="text-lg font-semibold text-slate-900">Audit Activity</h2>
      <p className="mt-1 text-sm text-slate-500">Timeline of created, activated, assigned, revoked, and renewed events.</p>
      <div className="mt-6 space-y-3">
        {query.data?.items.map((event) => (
          <article key={event.id} className="rounded-xl border border-slate-200 bg-white p-4">
            <div className="flex flex-wrap items-center gap-2 text-sm">
              <span className="rounded-full bg-indigo-50 px-2 py-1 text-xs font-semibold uppercase text-indigo-700">{event.event}</span>
              <span className="font-medium text-slate-800">{event.actor}</span>
              <span className="text-slate-500">on</span>
              <span className="font-mono text-xs text-slate-600">{event.target}</span>
            </div>
            <p className="mt-1 text-xs text-slate-500">{formatDate(event.timestamp)}</p>
            {event.detail ? <p className="mt-1 text-sm text-slate-700">{event.detail}</p> : null}
          </article>
        ))}
      </div>
    </section>
  );
}
