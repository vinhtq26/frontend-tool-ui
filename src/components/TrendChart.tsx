import { Line, LineChart, ResponsiveContainer, Tooltip, XAxis, YAxis } from 'recharts';
import type { TrendItem } from '../types';

interface TrendChartProps {
  data: TrendItem[];
}

export default function TrendChart({ data }: TrendChartProps) {
  return (
    <div className="card h-80">
      <div className="mb-6 flex items-center justify-between">
        <h3 className="text-base font-semibold text-slate-900">Activations per week</h3>
        <span className="rounded-full bg-emerald-50 px-2 py-1 text-xs font-medium text-emerald-700">Live trend</span>
      </div>
      <ResponsiveContainer width="100%" height="85%">
        <LineChart data={data}>
          <XAxis dataKey="week" tickLine={false} axisLine={false} />
          <YAxis tickLine={false} axisLine={false} />
          <Tooltip />
          <Line type="monotone" dataKey="activations" stroke="#4F46E5" strokeWidth={3} dot={{ fill: '#10B981' }} />
        </LineChart>
      </ResponsiveContainer>
    </div>
  );
}
