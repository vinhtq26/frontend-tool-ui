# Licensing Ops Dashboard (React + TypeScript + Tailwind)

Enterprise-style licensing management dashboard for admin/ops with responsive UX, secure API layer, mock server, unit tests, and E2E tests.

## Features

- Auth: `/login` with JWT, token persisted in `localStorage`, auto attach `Authorization: Bearer <token>`.
- Role guards: `admin` routes for operations, `user` route for `My Licenses`.
- Layout: collapsible sidebar, topbar search/notifications/avatar menu.
- Dashboard: KPI cards, trend chart, quick actions.
- Licenses: server-side pagination, search/filter, create, assign, renew, revoke, detail drawer.
- Users: list users, create user, deactivate user, view user licenses.
- Audit: timeline of events (created/activated/assigned/revoked/renewed).
- MSW mock adapter to run UI without backend updates.
- Unit tests (Vitest) + E2E tests (Cypress).

## Tech Stack

- React 18 + TypeScript + Vite
- Tailwind CSS
- Radix UI (`Dialog`, `DropdownMenu`)
- React Router
- React Query
- Axios
- date-fns
- Recharts
- MSW
- Vitest + Testing Library
- Cypress

## Project Structure

```txt
src/
  api/
  components/
  contexts/
  hooks/
  mocks/
  pages/
  services/
  test/
cypress/
```

## Setup

1. Install dependencies

```bash
npm install
```

If your local `npm` has issues, use another package manager:

```bash
pnpm install
# or
yarn install
```

2. Configure env

```bash
cp .env.example .env
```

3. Start dev server

```bash
npm run dev
```

## Commands

```bash
npm run dev
npm run build
npm run test
npm run test:watch
npm run cypress
npm run cypress:open
```

## Pages

- `/login`
- `/dashboard`
- `/licenses`
- `/licenses/:key`
- `/users`
- `/audit`
- `/settings`
- `/my-licenses`

## API Integration Mapping

### Implemented endpoints

- `POST /login`
- `POST /register`
- `POST /activate`
- `POST /verify`
- `POST /admin/licenses`
- `GET /admin/licenses?limit=&offset=&status=&owner=&search=`
- `GET /admin/licenses/{license_key}`
- `POST /admin/licenses/{license_key}/assign`
- `POST /admin/licenses/{license_key}/revoke`
- `POST /admin/licenses/{license_key}/renew`
- `GET /admin/users`
- `GET /admin/users/{id}/licenses`
- `GET /admin/audit?limit=&offset=`

### Proposed backend additions (if missing)

- `POST /admin/users/{id}/deactivate`
- `POST /admin/licenses/{license_key}/resend` (email trigger)
- `POST /admin/licenses/import-csv`
- `GET /my/licenses`

## Security Notes

- Never logs secrets.
- Automatically sends:
  - `Authorization: Bearer <token>`
  - `X-Admin-Token` for `/admin/*`
  - `X-CSRF-Token` if `csrf_token` cookie exists
- Admin route guard checks `role`/`is_admin` claims from JWT payload.

## Testing Scope

### Unit tests

- `LicenseTable`
- `CreateLicenseModal`
- `Login` form validation

### E2E test

- Login as admin
- Create license
- Assign owner
- Activate via API
- Verify via API

## MSW Mock Mode

Enable `VITE_USE_MSW=true` to run full UI flows without backend.

Default mock users:

- `ops-admin / password123` (admin)
- `alice / password123` (user)
- `bob / password123` (user)

## Milestone Guidance

- MVP (3 days): login + dashboard + licenses list/create/assign + mock server + README.
- Full (1-2 weeks): audit hardening, renew/revoke policies, CSV/email, CI tests, deployment.
