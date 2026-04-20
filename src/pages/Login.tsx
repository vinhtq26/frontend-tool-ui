import { FormEvent, useState } from 'react';
import { useMutation } from '@tanstack/react-query';
import { useNavigate } from 'react-router-dom';
import { login } from '../services/auth';
import { useAuth } from '../contexts/AuthContext';
import { useToast } from '../components/Toasts';

export default function Login() {
  const [username, setUsername] = useState('ops-admin');
  const [password, setPassword] = useState('password123');
  const [error, setError] = useState('');
  const { signIn } = useAuth();
  const { push } = useToast();
  const navigate = useNavigate();

  const mutation = useMutation({
    mutationFn: login,
    onSuccess: (data) => {
      signIn(data.access_token);
      push({ type: 'success', title: 'Welcome back', message: 'Logged in successfully.' });
      navigate('/dashboard');
    },
    onError: () => {
      setError('Invalid username or password');
    }
  });

  const onSubmit = (event: FormEvent) => {
    event.preventDefault();
    setError('');
    if (!username.trim() || !password.trim()) {
      setError('Username and password are required');
      return;
    }

    mutation.mutate({ username: username.trim(), password: password.trim() });
  };

  return (
    <section className="flex min-h-screen items-center justify-center px-4 py-10">
      <div className="w-full max-w-md rounded-3xl border border-slate-200 bg-white/95 p-8 shadow-card backdrop-blur">
        <h1 className="text-2xl font-bold tracking-tight text-slate-900">Licensing Admin Login</h1>
        <p className="mt-2 text-sm text-slate-500">Sign in to manage license lifecycle and audit operations.</p>

        <form className="mt-8 space-y-4" onSubmit={onSubmit}>
          <div>
            <label className="label" htmlFor="login-username">
              Username
            </label>
            <input
              id="login-username"
              className="input"
              value={username}
              onChange={(event) => setUsername(event.target.value)}
              placeholder="ops-admin"
            />
          </div>
          <div>
            <label className="label" htmlFor="login-password">
              Password
            </label>
            <input
              id="login-password"
              className="input"
              type="password"
              value={password}
              onChange={(event) => setPassword(event.target.value)}
              placeholder="••••••••"
            />
          </div>
          {error ? <p className="text-sm text-rose-600">{error}</p> : null}
          <button className="btn-primary w-full" type="submit" disabled={mutation.isPending}>
            {mutation.isPending ? 'Signing in...' : 'Sign in'}
          </button>
        </form>
      </div>
    </section>
  );
}
