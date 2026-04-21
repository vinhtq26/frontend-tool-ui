import { useState } from 'react';
import {
  ArrowRightOnRectangleIcon,
  BellAlertIcon,
  CheckCircleIcon,
  PaintBrushIcon,
  ShieldCheckIcon,
  SparklesIcon,
  UserCircleIcon,
  WrenchScrewdriverIcon
} from '@heroicons/react/24/outline';
import { useAuth, authStorage } from '../contexts/AuthContext';
import { useToast } from '../components/Toasts';

type WorkspaceMode = 'focused' | 'balanced' | 'compact';

export default function Settings() {
  const { username, role, signOut } = useAuth();
  const { push } = useToast();
  const hasToken = Boolean(authStorage.getToken());

  const [emailAlerts, setEmailAlerts] = useState(true);
  const [securityDigest, setSecurityDigest] = useState(role === 'admin');
  const [workspaceMode, setWorkspaceMode] = useState<WorkspaceMode>('balanced');

  const preferences = [
    {
      id: 'email-alerts',
      title: 'Email alerts',
      description: 'Get notified when licenses are close to expiry or assignment fails.',
      enabled: emailAlerts,
      onToggle: () => setEmailAlerts((current) => !current)
    },
    {
      id: 'security-digest',
      title: 'Security digest',
      description: 'Receive a weekly summary of admin actions, revokes, and renewals.',
      enabled: securityDigest,
      onToggle: () => setSecurityDigest((current) => !current)
    }
  ];

  const savePreferences = () => {
    push({
      type: 'success',
      title: 'Preferences saved',
      message: 'Your workspace choices were updated for this session.'
    });
  };

  return (
    <section className="space-y-6">
      <header className="overflow-hidden rounded-[28px] border border-slate-200 bg-white shadow-card">
        <div className="relative">
          <div className="absolute inset-x-0 top-0 h-32 bg-[radial-gradient(circle_at_top_left,_rgba(79,70,229,0.18),_transparent_38%),radial-gradient(circle_at_top_right,_rgba(16,185,129,0.14),_transparent_30%),linear-gradient(135deg,_rgba(15,23,42,0.02),_rgba(255,255,255,0))]" />
          <div className="relative flex flex-col gap-6 p-6 md:p-8 xl:flex-row xl:items-end xl:justify-between">
            <div className="space-y-4">
              <div className="inline-flex items-center gap-2 rounded-full border border-indigo-100 bg-indigo-50 px-3 py-1 text-xs font-semibold uppercase tracking-[0.24em] text-indigo-700">
                <SparklesIcon className="h-4 w-4" />
                Workspace Settings
              </div>
              <div className="space-y-3">
                <h1 className="max-w-2xl text-3xl font-black tracking-tight text-slate-900 md:text-4xl">
                  A cleaner home for your account, alerts, and workspace defaults.
                </h1>
                <p className="max-w-2xl text-sm leading-6 text-slate-600 md:text-base">
                  This page now surfaces the things people expect to find in settings: account context, security status,
                  notification choices, and a few session-level preferences that make the dashboard feel more complete.
                </p>
              </div>
            </div>

            <div className="grid gap-3 sm:grid-cols-3 xl:min-w-[420px]">
              <div className="rounded-2xl border border-white/70 bg-white/90 p-4 backdrop-blur">
                <p className="text-xs font-semibold uppercase tracking-[0.2em] text-slate-500">Session</p>
                <p className="mt-2 text-lg font-bold text-slate-900">{hasToken ? 'Active' : 'Expired'}</p>
                <p className="mt-1 text-xs text-slate-500">Token availability is checked from local storage.</p>
              </div>
              <div className="rounded-2xl border border-white/70 bg-white/90 p-4 backdrop-blur">
                <p className="text-xs font-semibold uppercase tracking-[0.2em] text-slate-500">Access</p>
                <p className="mt-2 text-lg font-bold capitalize text-slate-900">{role ?? 'unknown'}</p>
                <p className="mt-1 text-xs text-slate-500">Controls what admin routes and actions you can open.</p>
              </div>
              <div className="rounded-2xl border border-white/70 bg-white/90 p-4 backdrop-blur">
                <p className="text-xs font-semibold uppercase tracking-[0.2em] text-slate-500">Workspace</p>
                <p className="mt-2 text-lg font-bold text-slate-900 capitalize">{workspaceMode}</p>
                <p className="mt-1 text-xs text-slate-500">A small quality-of-life preference for this session.</p>
              </div>
            </div>
          </div>
        </div>
      </header>

      <div className="grid gap-6 xl:grid-cols-[1.25fr_0.75fr]">
        <div className="space-y-6">
          <article className="card">
            <div className="flex items-start gap-4">
              <div className="rounded-2xl bg-indigo-50 p-3 text-indigo-600">
                <UserCircleIcon className="h-6 w-6" />
              </div>
              <div className="flex-1">
                <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
                  <div>
                    <h2 className="text-lg font-semibold text-slate-900">Account overview</h2>
                    <p className="mt-1 text-sm text-slate-500">A quick summary of who is signed in and what this session can do.</p>
                  </div>
                  <button className="btn-secondary" onClick={signOut}>
                    <ArrowRightOnRectangleIcon className="mr-2 h-4 w-4" />
                    Sign out
                  </button>
                </div>

                <dl className="mt-5 grid gap-3 sm:grid-cols-2">
                  <div className="rounded-2xl border border-slate-200 bg-slate-50 p-4">
                    <dt className="text-xs font-semibold uppercase tracking-[0.18em] text-slate-500">Username</dt>
                    <dd className="mt-2 text-sm font-semibold text-slate-900">{username ?? 'Unknown user'}</dd>
                  </div>
                  <div className="rounded-2xl border border-slate-200 bg-slate-50 p-4">
                    <dt className="text-xs font-semibold uppercase tracking-[0.18em] text-slate-500">Role</dt>
                    <dd className="mt-2 text-sm font-semibold capitalize text-slate-900">{role ?? 'unknown'}</dd>
                  </div>
                  <div className="rounded-2xl border border-slate-200 bg-slate-50 p-4">
                    <dt className="text-xs font-semibold uppercase tracking-[0.18em] text-slate-500">Session state</dt>
                    <dd className="mt-2 inline-flex items-center gap-2 text-sm font-semibold text-slate-900">
                      <CheckCircleIcon className={`h-4 w-4 ${hasToken ? 'text-emerald-500' : 'text-amber-500'}`} />
                      {hasToken ? 'Authenticated' : 'Missing token'}
                    </dd>
                  </div>
                  <div className="rounded-2xl border border-slate-200 bg-slate-50 p-4">
                    <dt className="text-xs font-semibold uppercase tracking-[0.18em] text-slate-500">Privileges</dt>
                    <dd className="mt-2 text-sm font-semibold text-slate-900">
                      {role === 'admin' ? 'Can access dashboard, users, licenses, and audit.' : 'Can access end-user views only.'}
                    </dd>
                  </div>
                </dl>
              </div>
            </div>
          </article>

          <article className="card">
            <div className="flex items-start gap-4">
              <div className="rounded-2xl bg-amber-50 p-3 text-amber-600">
                <BellAlertIcon className="h-6 w-6" />
              </div>
              <div className="flex-1">
                <h2 className="text-lg font-semibold text-slate-900">Notifications and workflow</h2>
                <p className="mt-1 text-sm text-slate-500">These controls are session-side preferences for a more complete settings experience.</p>

                <div className="mt-5 space-y-3">
                  {preferences.map((preference) => (
                    <label
                      key={preference.id}
                      htmlFor={preference.id}
                      className="flex cursor-pointer items-start justify-between gap-4 rounded-2xl border border-slate-200 p-4 transition hover:border-slate-300 hover:bg-slate-50"
                    >
                      <div>
                        <p className="text-sm font-semibold text-slate-900">{preference.title}</p>
                        <p className="mt-1 text-sm leading-6 text-slate-500">{preference.description}</p>
                      </div>
                      <button
                        id={preference.id}
                        type="button"
                        role="switch"
                        aria-checked={preference.enabled}
                        onClick={preference.onToggle}
                        className={`relative mt-1 inline-flex h-7 w-12 shrink-0 items-center rounded-full transition ${
                          preference.enabled ? 'bg-indigo-600' : 'bg-slate-300'
                        }`}
                      >
                        <span
                          className={`inline-block h-5 w-5 rounded-full bg-white shadow transition ${
                            preference.enabled ? 'translate-x-6' : 'translate-x-1'
                          }`}
                        />
                      </button>
                    </label>
                  ))}
                </div>

                <div className="mt-5 flex flex-wrap gap-3">
                  <button className="btn-primary" onClick={savePreferences}>
                    Save preferences
                  </button>
                  <button
                    className="btn-secondary"
                    onClick={() => {
                      setEmailAlerts(true);
                      setSecurityDigest(role === 'admin');
                      setWorkspaceMode('balanced');
                    }}
                  >
                    Reset defaults
                  </button>
                </div>
              </div>
            </div>
          </article>
        </div>

        <div className="space-y-6">
          <article className="card">
            <div className="flex items-start gap-4">
              <div className="rounded-2xl bg-emerald-50 p-3 text-emerald-600">
                <ShieldCheckIcon className="h-6 w-6" />
              </div>
              <div>
                <h2 className="text-lg font-semibold text-slate-900">Security posture</h2>
                <p className="mt-1 text-sm text-slate-500">A plain-language summary of the protections already wired into the app.</p>
              </div>
            </div>

            <ul className="mt-5 space-y-3 text-sm text-slate-600">
              <li className="rounded-2xl border border-slate-200 p-4">Protected routes require an authenticated user before rendering admin pages.</li>
              <li className="rounded-2xl border border-slate-200 p-4">Authorization headers are attached automatically for backend requests that need them.</li>
              <li className="rounded-2xl border border-slate-200 p-4">Admin-only flows can add dedicated headers when the backend expects elevated access.</li>
            </ul>
          </article>

          <article className="card">
            <div className="flex items-start gap-4">
              <div className="rounded-2xl bg-sky-50 p-3 text-sky-600">
                <PaintBrushIcon className="h-6 w-6" />
              </div>
              <div className="flex-1">
                <h2 className="text-lg font-semibold text-slate-900">Workspace density</h2>
                <p className="mt-1 text-sm text-slate-500">Pick the feel you want for this session.</p>

                <div className="mt-5 grid gap-3">
                  {[
                    { value: 'focused', title: 'Focused', text: 'More breathing room and calmer scanning for detail work.' },
                    { value: 'balanced', title: 'Balanced', text: 'The default feel for everyday license and user management.' },
                    { value: 'compact', title: 'Compact', text: 'Denser information for quicker admin workflows.' }
                  ].map((option) => {
                    const isActive = workspaceMode === option.value;
                    return (
                      <button
                        key={option.value}
                        type="button"
                        onClick={() => setWorkspaceMode(option.value as WorkspaceMode)}
                        className={`rounded-2xl border p-4 text-left transition ${
                          isActive
                            ? 'border-indigo-200 bg-indigo-50 text-indigo-900'
                            : 'border-slate-200 bg-white text-slate-700 hover:border-slate-300 hover:bg-slate-50'
                        }`}
                      >
                        <div className="flex items-center justify-between gap-4">
                          <div>
                            <p className="text-sm font-semibold">{option.title}</p>
                            <p className="mt-1 text-sm leading-6 text-slate-500">{option.text}</p>
                          </div>
                          {isActive ? <CheckCircleIcon className="h-5 w-5 text-indigo-600" /> : null}
                        </div>
                      </button>
                    );
                  })}
                </div>
              </div>
            </div>
          </article>

          <article className="card">
            <div className="flex items-start gap-4">
              <div className="rounded-2xl bg-rose-50 p-3 text-rose-600">
                <WrenchScrewdriverIcon className="h-6 w-6" />
              </div>
              <div>
                <h2 className="text-lg font-semibold text-slate-900">What could come next</h2>
                <p className="mt-1 text-sm text-slate-500">Good candidates if you want this page to become fully functional settings.</p>
              </div>
            </div>

            <div className="mt-5 grid gap-3 text-sm text-slate-600">
              <div className="rounded-2xl border border-dashed border-slate-300 bg-slate-50 p-4">Password change and profile editing</div>
              <div className="rounded-2xl border border-dashed border-slate-300 bg-slate-50 p-4">Webhook, API endpoint, and import/export configuration</div>
              <div className="rounded-2xl border border-dashed border-slate-300 bg-slate-50 p-4">Real persisted notification preferences from the backend</div>
            </div>
          </article>
        </div>
      </div>
    </section>
  );
}
