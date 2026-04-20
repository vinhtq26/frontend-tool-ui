import { useQuery } from '@tanstack/react-query';
import api from '../api/axios';
import type { License } from '../types';
import { formatDate } from '../utils/date';

export default function MyLicenses() {
  const query = useQuery({
    queryKey: ['my-licenses'],
    queryFn: async () => {
      const { data } = await api.get<License[]>('/my/licenses');
      return data;
    }
  });

  return (
    <section className="space-y-4">
      <h2 className="text-xl font-semibold text-slate-900">My Licenses</h2>
      <div className="space-y-3">
        {query.data?.map((license) => (
          <article key={license.license_key} className="card !p-4">
            <p className="font-mono text-xs text-slate-700">{license.license_key}</p>
            <p className="mt-1 text-sm text-slate-600">Expiry date: {formatDate(license.expiry_date)}</p>
            <p className="text-sm text-slate-600">Last check: {formatDate(license.last_check)}</p>
          </article>
        ))}
      </div>
    </section>
  );
}
