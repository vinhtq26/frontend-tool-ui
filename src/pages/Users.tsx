import { useState } from 'react';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { createUser, deactivateUser, getUserLicenses, listUsers } from '../services/users';
import { useToast } from '../components/Toasts';

export default function Users() {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('password123');
  const [selectedUserId, setSelectedUserId] = useState<number | null>(null);
  const queryClient = useQueryClient();
  const { push } = useToast();

  const usersQuery = useQuery({ queryKey: ['users'], queryFn: listUsers });
  const licensesQuery = useQuery({
    queryKey: ['user-licenses', selectedUserId],
    queryFn: () => getUserLicenses(selectedUserId!),
    enabled: Boolean(selectedUserId)
  });

  const createMutation = useMutation({
    mutationFn: createUser,
    onSuccess: () => {
      setUsername('');
      queryClient.invalidateQueries({ queryKey: ['users'] });
      push({ type: 'success', title: 'User created' });
    }
  });

  const deactivateMutation = useMutation({
    mutationFn: deactivateUser,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['users'] });
      push({ type: 'info', title: 'User deactivated' });
    }
  });

  return (
    <section className="grid gap-6 lg:grid-cols-[1.3fr_1fr]">
      <div className="space-y-4">
        <div className="card">
          <h2 className="text-base font-semibold text-slate-900">Users</h2>
          <div className="mt-4 overflow-hidden rounded-xl border border-slate-200">
            <table className="min-w-full text-sm">
              <thead className="bg-slate-50 text-left text-xs uppercase text-slate-500">
                <tr>
                  <th className="px-3 py-2">Username</th>
                  <th className="px-3 py-2">Role</th>
                  <th className="px-3 py-2">Status</th>
                  <th className="px-3 py-2" />
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 bg-white">
                {usersQuery.data?.map((user) => (
                  <tr key={user.id}>
                    <td className="px-3 py-2">{user.username}</td>
                    <td className="px-3 py-2">{user.role ?? 'user'}</td>
                    <td className="px-3 py-2">{user.is_active === false ? 'inactive' : 'active'}</td>
                    <td className="px-3 py-2 text-right">
                      <button className="btn-secondary !h-8 !px-2 !py-0" onClick={() => setSelectedUserId(user.id)}>
                        View licenses
                      </button>
                      <button
                        className="ml-2 rounded-lg px-2 py-1 text-xs text-rose-600 hover:bg-rose-50"
                        onClick={() => deactivateMutation.mutate(user.id)}
                      >
                        Deactivate
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>

      <div className="space-y-4">
        <div className="card">
          <h3 className="text-base font-semibold text-slate-900">Create user</h3>
          <div className="mt-4 space-y-3">
            <input className="input" placeholder="Username" value={username} onChange={(event) => setUsername(event.target.value)} />
            <input className="input" placeholder="Password" value={password} onChange={(event) => setPassword(event.target.value)} />
            <button
              className="btn-primary w-full"
              onClick={() => createMutation.mutate({ username, password, role: 'user' })}
              disabled={!username.trim()}
            >
              Create user
            </button>
          </div>
        </div>

        <div className="card">
          <h3 className="text-base font-semibold text-slate-900">User licenses</h3>
          {!selectedUserId ? <p className="mt-3 text-sm text-slate-500">Select a user to view licenses.</p> : null}
          <div className="mt-3 space-y-2 text-sm">
            {licensesQuery.data?.map((license) => (
              <div key={license.license_key} className="rounded-lg border border-slate-200 p-2">
                <p className="font-mono text-xs">{license.license_key}</p>
                <p className="text-xs text-slate-500">HWID: {license.hwid ?? '-'}</p>
              </div>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}
