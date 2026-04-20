export default function Settings() {
  return (
    <section className="grid gap-4 md:grid-cols-2">
      <article className="card">
        <h3 className="text-base font-semibold text-slate-900">Security</h3>
        <ul className="mt-3 space-y-2 text-sm text-slate-600">
          <li>Authorization header is attached for protected routes.</li>
          <li>X-Admin-Token is injected for /admin endpoints.</li>
          <li>CSRF token header is sent when csrf cookie exists.</li>
        </ul>
      </article>
      <article className="card">
        <h3 className="text-base font-semibold text-slate-900">Integrations</h3>
        <p className="mt-3 text-sm text-slate-600">Optional endpoints you can add: /admin/licenses/{key}/resend and /admin/licenses/import-csv.</p>
      </article>
    </section>
  );
}
