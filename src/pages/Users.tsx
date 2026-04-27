import { useState } from 'react';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { activateUser, createUser, deactivateUser, deleteUser, getUserLicenses, listUsers } from '../services/users';
import type { License, User } from '../types';
import { useToast } from '../components/Toasts';
import ConfirmDialog from '../components/ConfirmDialog';

export default function Users() {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('password123');
  const [appName, setAppName] = useState('');
  const [selectedUser, setSelectedUser] = useState<User | null>(null);
  const [pendingDeleteUser, setPendingDeleteUser] = useState<User | null>(null);
  const queryClient = useQueryClient();
  const { push } = useToast();

  const usersQuery = useQuery({ queryKey: ['users'], queryFn: listUsers });
  const licensesQuery = useQuery({
    queryKey: ['user-licenses', selectedUser?.id, selectedUser?.app_name],
    queryFn: () => getUserLicenses(selectedUser!.id, selectedUser?.app_name),
    enabled: Boolean(selectedUser)
  });

  const updateUserCache = (userId: number, isActive: boolean) => {
    queryClient.setQueryData<User[]>(['users'], (current) =>
      current?.map((user) => (user.id === userId ? { ...user, is_active: isActive } : user)) ?? current
    );

    if (selectedUser?.id !== userId) return;

    queryClient.setQueryData<License[]>(['user-licenses', selectedUser?.id, selectedUser?.app_name], (current) =>
      current?.map((license) => ({
        ...license,
        is_active: isActive && (!license.expiry_date || new Date(license.expiry_date) >= new Date())
      })) ?? current
    );
  };

  const createMutation = useMutation({
    mutationFn: createUser,
    onSuccess: () => {
      setUsername('');
      setAppName('');
      queryClient.invalidateQueries({ queryKey: ['users'] });
      push({ type: 'success', title: 'User created' });
    }
  });

  const deactivateMutation = useMutation({
    mutationFn: deactivateUser,
    onMutate: async (userId) => {
      await queryClient.cancelQueries({ queryKey: ['users'] });
      await queryClient.cancelQueries({ queryKey: ['licenses'] });
      await queryClient.cancelQueries({ queryKey: ['user-licenses'] });

      const previousUsers = queryClient.getQueryData<User[]>(['users']);
      const previousUserLicenses = queryClient.getQueriesData({ queryKey: ['user-licenses'] });

      updateUserCache(userId, false);

      return { previousUsers, previousUserLicenses };
    },
    onError: (_error, _userId, context) => {
      if (context?.previousUsers) {
        queryClient.setQueryData(['users'], context.previousUsers);
      }
      context?.previousUserLicenses?.forEach(([queryKey, data]) => {
        queryClient.setQueryData(queryKey, data);
      });
      push({ type: 'error', title: 'Failed to deactivate user' });
    },
    onSuccess: () => {
      push({ type: 'info', title: 'User deactivated' });
    },
    onSettled: () => {
      queryClient.invalidateQueries({ queryKey: ['users'] });
      queryClient.invalidateQueries({ queryKey: ['licenses'] });
      queryClient.invalidateQueries({ queryKey: ['user-licenses'] });
    }
  });

  const activateMutation = useMutation({
    mutationFn: activateUser,
    onMutate: async (userId) => {
      await queryClient.cancelQueries({ queryKey: ['users'] });
      await queryClient.cancelQueries({ queryKey: ['licenses'] });
      await queryClient.cancelQueries({ queryKey: ['user-licenses'] });

      const previousUsers = queryClient.getQueryData<User[]>(['users']);
      const previousUserLicenses = queryClient.getQueriesData({ queryKey: ['user-licenses'] });

      updateUserCache(userId, true);

      return { previousUsers, previousUserLicenses };
    },
    onError: (_error, _userId, context) => {
      if (context?.previousUsers) {
        queryClient.setQueryData(['users'], context.previousUsers);
      }
      context?.previousUserLicenses?.forEach(([queryKey, data]) => {
        queryClient.setQueryData(queryKey, data);
      });
      push({ type: 'error', title: 'Failed to activate user' });
    },
    onSuccess: () => {
      push({ type: 'success', title: 'User activated' });
    },
    onSettled: () => {
      queryClient.invalidateQueries({ queryKey: ['users'] });
      queryClient.invalidateQueries({ queryKey: ['licenses'] });
      queryClient.invalidateQueries({ queryKey: ['user-licenses'] });
    }
  });

  const deleteMutation = useMutation({
    mutationFn: deleteUser,
    onMutate: async (userId) => {
      await queryClient.cancelQueries({ queryKey: ['users'] });
      await queryClient.cancelQueries({ queryKey: ['licenses'] });
      await queryClient.cancelQueries({ queryKey: ['user-licenses'] });

      const previousUsers = queryClient.getQueryData<User[]>(['users']);
      const previousLicenses = queryClient.getQueriesData({ queryKey: ['licenses'] });
      const previousUserLicenses = queryClient.getQueriesData({ queryKey: ['user-licenses'] });

      queryClient.setQueryData<User[]>(['users'], (current) => current?.filter((user) => user.id !== userId) ?? current);

      if (selectedUser?.id === userId) {
        setSelectedUser(null);
      }

      queryClient.setQueriesData({ queryKey: ['licenses'] }, (current: { items?: License[] } | undefined) => {
        if (!current?.items) return current;
        return {
          ...current,
          items: current.items.map((license) =>
            license.owner_id === userId
              ? { ...license, owner_id: null, owner_username: null, hwid: null, is_active: false }
              : license
          )
        };
      });

      queryClient.removeQueries({ queryKey: ['user-licenses', userId], exact: false });

      return { previousUsers, previousLicenses, previousUserLicenses };
    },
    onError: (_error, _userId, context) => {
      if (context?.previousUsers) {
        queryClient.setQueryData(['users'], context.previousUsers);
      }
      context?.previousLicenses?.forEach(([queryKey, data]) => {
        queryClient.setQueryData(queryKey, data);
      });
      context?.previousUserLicenses?.forEach(([queryKey, data]) => {
        queryClient.setQueryData(queryKey, data);
      });
      push({ type: 'error', title: 'Failed to delete user' });
    },
    onSuccess: () => {
      push({ type: 'success', title: 'User deleted' });
    },
    onSettled: () => {
      queryClient.invalidateQueries({ queryKey: ['users'] });
      queryClient.invalidateQueries({ queryKey: ['licenses'] });
      queryClient.invalidateQueries({ queryKey: ['user-licenses'] });
      setPendingDeleteUser(null);
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
                  <th className="px-3 py-2 whitespace-nowrap">App</th>
                  <th className="px-3 py-2 whitespace-nowrap">Role</th>
                  <th className="px-3 py-2 whitespace-nowrap">Status</th>
                  <th className="px-3 py-2" />
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 bg-white">
                {usersQuery.data?.map((user) => (
                  <tr key={user.id} className="hover:bg-slate-50 transition-colors">
                    <td className="px-3 py-2 font-medium whitespace-nowrap">{user.username}</td>
                    <td className="px-3 py-2 whitespace-nowrap text-slate-600">{user.app_name ?? '—'}</td>
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
                          onClick={() => setSelectedUser(user)}
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
                        <button
                          className="rounded-lg px-2 py-1 text-xs text-rose-700 hover:bg-rose-50 whitespace-nowrap disabled:opacity-50"
                          onClick={() => setPendingDeleteUser(user)}
                          disabled={deleteMutation.isPending}
                        >
                          Delete
                        </button>
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
            <input
              className="input"
              placeholder="App name"
              value={appName}
              onChange={(event) => setAppName(event.target.value)}
            />
            <button
              className="btn-primary w-full"
              onClick={() => createMutation.mutate({ username, password, app_name: appName.trim(), role: 'user' })}
              disabled={!username.trim() || !appName.trim() || createMutation.isPending}
            >
              {createMutation.isPending ? 'Creating…' : 'Create user'}
            </button>
          </div>
        </div>

        <div className="card overflow-hidden">
          <h3 className="text-base font-semibold text-slate-900">User licenses</h3>
          {!selectedUser ? (
            <p className="mt-3 text-sm text-slate-500">Select a user to view their licenses.</p>
          ) : licensesQuery.isLoading ? (
            <p className="mt-3 text-sm text-slate-400">Loading…</p>
          ) : licensesQuery.data?.length === 0 ? (
            <p className="mt-3 text-sm text-slate-500">No licenses found for this user.</p>
          ) : null}
          {selectedUser ? (
            <div className="mt-3 rounded-lg border border-slate-200 bg-slate-50 p-3 text-sm text-slate-600">
              <p className="font-medium text-slate-900">{selectedUser.username}</p>
              <p className="text-xs text-slate-500">App: {selectedUser.app_name ?? '—'}</p>
            </div>
          ) : null}
          <div className="mt-3 space-y-2 text-sm">
            {licensesQuery.data?.map((license) => (
              <div key={license.license_key} className="rounded-lg border border-slate-200 p-3 space-y-1">
                <p className="font-mono text-xs break-all text-slate-800">{license.license_key}</p>
                <p className="text-xs text-slate-500 break-all">
                  License token: {license.license_token ?? license.token ?? '—'}
                </p>
                <p className="text-xs text-slate-500">HWID: {license.hwid ?? '—'}</p>
              </div>
            ))}
          </div>
        </div>
      </div>

      <ConfirmDialog
        open={Boolean(pendingDeleteUser)}
        onOpenChange={(open) => {
          if (!open) setPendingDeleteUser(null);
        }}
        title="Delete user"
        description={
          pendingDeleteUser
            ? `Delete user "${pendingDeleteUser.username}"? Their assigned licenses will be released and the UI will refresh immediately.`
            : ''
        }
        confirmLabel="Delete user"
        onConfirm={() => {
          if (pendingDeleteUser) {
            deleteMutation.mutate(pendingDeleteUser.id);
          }
        }}
      />
    </section>
  );
}
