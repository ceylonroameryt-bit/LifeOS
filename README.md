# LifeOS

This installation is a private personal LifeOS for one configured owner. The existing responsive interface uses protected Next.js module URLs and Supabase-backed account data. See [PRIVATE_DEPLOYMENT.md](PRIVATE_DEPLOYMENT.md) for the account, database and hosting setup. Production never substitutes example records or localStorage data after a database failure. A new account displays empty lists; failed operations display an error and retain the form.

## Run and deploy

1. Use Node.js 22 or later and run `npm ci`.
2. Copy `.env.local.example` to `.env.local`. Set `NEXT_PUBLIC_SUPABASE_URL` and `NEXT_PUBLIC_SUPABASE_ANON_KEY` to the Supabase project URL and public anon key. Set the server-only `LIFEOS_OWNER_ID` and database `private_app_owner` row to your verified auth UUID; missing configuration denies access. Never use a service-role key in the browser.
3. Apply the migrations in filename order. For an existing installation, apply only the new `20261002_persistence_security.sql`, `20261003_notifications_conversions.sql`, and `20261004_private_owner.sql` migrations after the two original migrations. Back up the database first. The first new migration keeps the latest duplicate review for a user/week before introducing its unique key.
4. In Supabase Auth, create or identify your own verified account, disable new signups, keep email/password authentication enabled, and configure your deployed Site URL. Allow redirect URLs ending in `/auth/callback` and `/auth/callback?next=/auth/reset`. Configure production SMTP for confirmation and password reset emails. Existing accounts must already have their profile rows; the signup trigger initializes new accounts.
5. Run `npm run typecheck`, `npm run lint`, `npm test`, and `npm run build`. Deploy with the same public environment variables available at build time; run `npm start` on the server. HTTPS is required for service workers outside localhost.
6. Verify owner sign-in, disabled API signup, password reset, and rejection of a second valid account against your actual Supabase project before storing personal data. No hosted Supabase credentials were supplied for this change; local validation uses a real PostgreSQL engine for migrations and a test HTTP backend for browser flows.

## Data and routes

`/today`, `/tasks`, `/money`, `/habits`, `/career`, `/ideas`, `/goals`, `/wishlist`, `/admin`, `/calendar`, `/inbox`, `/focus`, `/insights`, `/weekly-review`, `/me`, and `/settings` have real URLs. The sidebar, tablet rail and mobile navigation use links; back/forward and direct entry work. Middleware refreshes authentication cookies, and each module page also validates the user on the server. Database RLS remains the authorization boundary.

Services under `lib/services/` persist tasks, expenses, budgets, habit entries, ideas, goals, notes, inbox captures, wishlist items, admin items, all Career records, profile changes, Focus sessions, Weekly Review snapshots, notification preferences, and saved notification read state. Expenses resolve a category name to `category_id`; the UI name is never sent as a nonexistent expense column. Job adapters map `title`, `applied_date`, `salary`, and `follow_up_date` to their database equivalents. Inbox/idea conversions use a transaction and source-row lock.

The new ownership policies check referenced categories, recruiters, CVs, jobs, habits, and tasks. Shared expense categories are readable and cannot be changed by ordinary users. New profiles use the supplied account name, and dates use the current calendar rather than a fixed year/month.

## Offline behavior

- The service worker caches static assets and a public offline launch screen. It deliberately excludes authenticated HTML, React server responses, auth traffic, and account data from the shared HTTP cache.
- An already open signed-in tab can read previously loaded account records from IndexedDB and queue supported mutations. Module navigation in that tab uses the current client shell when disconnected. Opening or reloading a protected URL while offline shows the explicit offline launch screen.
- Queue entries and cached rows are saved in a single IndexedDB transaction and separated by account. Entries replay in creation order on reconnect or manual retry. Insert IDs are stable across retries. Update conflicts retain the pending change and show an error instead of silently replacing a changed field from another device. A pending change can be explicitly discarded online.
- Sign-out clears cached records; pending mutations remain separated by account for the next sign-in. A different account cannot replay them. Do not clear browser storage while changes remain pending.
- Categories must have been loaded online before recording an offline expense. Capture conversion requires an online connection because its database transaction spans multiple records. Offline writes are local until the pending count reaches zero; a browser may evict local storage.
- Sync runs with an open authenticated tab. There is no unattended background worker holding user credentials. New offline launches and cross-tab editing are more limited than an installed native app.

## Notifications and CV files

Notification preferences and saved notices/read state persist in Supabase. Scheduled push delivery is not enabled: a production scheduler, Web Push/VAPID keys, and subscription delivery infrastructure must be configured separately. The UI states this limitation.

Career provides forms for jobs, interviews, follow-ups, recruiters, and CV versions. CV versions store file links and notes; this change does not upload CV files or create a storage bucket. Use private, appropriately permissioned file storage for documents.

## Tests and development data

- `npm test`: service mapping/error tests, account-scoped IndexedDB queue integration, login UI tests, and migrations/RLS/transaction tests using PGlite PostgreSQL. The PGlite harness only substitutes `gen_random_uuid()` for the unavailable `uuid-ossp` extension.
- `npm run test:e2e`: Playwright browser flows with the actual Next.js app and a local test Supabase HTTP service. Install Chromium using `npx playwright install chromium` first. The test server has no production authentication authority and is never imported by the app.
- GitHub Actions runs typecheck, lint, tests, production build, and browser tests.
- `dev/seedData.ts` contains historical developer examples. It is excluded from the production import graph and is not automatically inserted into any account. A production demo mode is deliberately disabled; no account silently becomes a demo account.

The native `ios/` project is preserved but has not been built or validated on Windows.
