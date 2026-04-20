interface KpiCardProps {
  title: string;
  value: string | number;
  hint?: string;
}

export default function KpiCard({ title, value, hint }: KpiCardProps) {
  return (
    <article className="card">
      <p className="text-sm font-medium text-slate-500">{title}</p>
      <p className="mt-3 text-3xl font-extrabold tracking-tight text-slate-900">{value}</p>
      {hint ? <p className="mt-2 text-xs text-slate-500">{hint}</p> : null}
    </article>
  );
}
