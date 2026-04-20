import { useState } from 'react';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { activateUser, createUser, deactivateUser, getUserLicenses, listUsers } from '../services/users';
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

  const activateMutation = useMutation({
    mutationFn: activateUser,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['users'] });
      push({ type: 'success', title: 'User activated' });
    }
  });

  return (
    <section className="grid gap-6 md:grid-cols-2 lg:grid-cols-[1.3fr_1fr]">
      {/* Users table */}
      <div className="space-y-4">
        <div className="card">
          <h2 className="text-base font-semibold text-slate-900">Users</h2>
          <div className="mt-4 overflow-x-auto rounded-xl border border-slate-200">
            <table className="min-w-full text-sm">
              <thead className="bg-slate-50 text-left text-xs uppercase text-slate-500">
                <tr>
                  <th className="px-3 py-2 whitespace-nowrap">Username</th>
                  <th className="px-3 py-2 whitespace-nowrap">Role</th>
                  <th className="px-3 py-2 whitespace-nowrap">Status</th>
                  <th className="px-3 py-2" />
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 bg-white">
                {usersQuery.data?.map((user) => (
                  <tr key={user.id} className="hover:bg-slate-50 transition-colors">
                    <td className="px-3 py-2 font-medium whitespace-nowrap">{user.username}</td>
                    <td className="px-3 py-2 whitespace-nowrap">
                      <span className={`inline-flex items-center rounded-full px-2 py-0.5 text-xs font-medium ${
                        user.role === 'admin'
                          ? 'bg-indigo-100 text-indigo-700'
                          : 'bg-slate-100 text-slate-600'
                      }`}>
                        {user.role ?? 'user'}
                      </span>
                    </td>
                    <td className="px-3 py-2 whitespace-nowrap">
                      <span className={`inline-flex items-center rounded-full px-2 py-0.5 text-xs font-medium ${
                        user.is_active === false
                          ? 'bg-rose-100 text-rose-600'
                          : 'bg-emerald-100 text-emerald-700'
                      }`}>
                        {user.is_active === false ? 'inactive' : 'active'}
                      </span>
                    </td>
                    <td className="px-3 py-2">
                      <div className="flex flex-col items-end gap-1 sm:flex-row sm:justify-end">
                        <button
                          className="btn-secondary !h-7 !px-2 !py-0 !text-xs whitespace-nowrap"
                          onClick={() => setSelectedUserId(user.id)}
                        >
                          View licenses
                        </button>
                        {user.is_active === false ? (
                          <button
                            className="rounded-lg px-2 py-1 text-xs text-emerald-600 hover:bg-emerald-50 whitespace-nowrap disabled:opacity-50"
                            onClick={() => activateMutation.mutate(user.id)}
                            disabled={activateMutation.isPending}
                          >
                            Activate
                          </button>
                        ) : (
                          <button
                            className="rounded-lg px-2 py-1 text-xs text-rose-600 hover:bg-rose-50 whitespace-nowrap disabled:opacity-50"
                            onClick={() => deactivateMutation.mutate(user.id)}
                            disabled={deactivateMutation.isPending}
                          >
                            Deactivate
                          </button>
                        )}
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>

      {/* Right column: Create user + User licenses */}
      <div className="space-y-4">
        <div className="card">
          <h3 className="text-base font-semibold text-slate-900">Create user</h3>
          <div className="mt-4 space-y-3">
            <input
              className="input"
              placeholder="Username"
              value={username}
              onChange={(event) => setUsername(event.target.value)}
            />
            <input
              className="input"
              placeholder="Password"
              value={password}
              onChange={(event) => setPassword(event.target.value)}
            />
            <button
              className="btn-primary w-full"
              onClick={() => createMutation.mutate({ username, password, role: 'user' })}
              disabled={!username.trim() || createMutation.isPending}
            >
              {createMutation.isPending ? 'Creating…' : 'Create user'}
            </button>
          </div>
        </div>

        <div className="card overflow-hidden">
          <h3 className="text-base font-semibold text-slate-900">User licenses</h3>
          {!selectedUserId ? (
            <p className="mt-3 text-sm text-slate-500">Select a user to view their licenses.</p>
          ) : licensesQuery.isLoading ? (
            <p className="mt-3 text-sm text-slate-400">Loading…</p>
          ) : licensesQuery.data?.length === 0 ? (
            <p className="mt-3 text-sm text-slate-500">No licenses found for this user.</p>
          ) : null}
          <div className="mt-3 space-y-2 text-sm">
            {licensesQuery.data?.map((license) => (
              <div key={license.license_key} className="rounded-lg border border-slate-200 p-3 space-y-1">
                <p className="font-mono text-xs break-all text-slate-800">{license.license_key}</p>
                <p className="text-xs text-slate-500">HWID: {license.hwid ?? '—'}</p>
              </div>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}
