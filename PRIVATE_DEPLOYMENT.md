# Private LifeOS deployment

This installation is for one owner. The public registration interface is removed, protected pages verify a server-configured owner UUID, and restrictive database policies deny every other account. The database and server each deny access until configured. No account is selected automatically.

## Account and database setup

1. Choose the intended Supabase project. Apply migrations in filename order; on an existing database, back up first and apply only migrations not already recorded. The newest migration is `20261004_private_owner.sql`.
2. Create or identify your email/password account in Supabase Authentication > Users. Enter or reset your password yourself; do not share it in chat. Ensure its email is verified and its profile/settings rows exist. New users are initialized by the existing signup trigger.
3. Disable **Allow new users to sign up** in Supabase Auth settings. Keep email/password sign-in enabled. The website's missing signup button does not disable Supabase's API registration by itself.
4. Copy the intended user's UUID from Authentication > Users. In the SQL editor, run the following with that exact UUID. This configuration is restricted to database administrators; never expose an endpoint that lets a browser claim ownership.

```sql
BEGIN;
INSERT INTO public.private_app_owner (singleton, user_id)
VALUES (true, 'REPLACE_WITH_YOUR_VERIFIED_AUTH_USER_UUID'::uuid)
ON CONFLICT (singleton) DO UPDATE SET user_id = EXCLUDED.user_id;
COMMIT;
```

5. Set the server-only environment variable `LIFEOS_OWNER_ID` to the same UUID. Do not prefix it with `NEXT_PUBLIC_`. Set `NEXT_PUBLIC_SUPABASE_URL` and `NEXT_PUBLIC_SUPABASE_ANON_KEY` to this project's URL and public key. Never deploy a service-role key in the browser.

Changing the configured UUID deliberately transfers app access; confirm it before doing so. The migration retains existing records. Deleting the owner auth account removes its owner configuration and denies further access.

## Hosting

Use the validated GitHub branch `fix/lifeos-production` while PR #1 is under review. Production settings for a Render Node web service:

- Plan: free, unless you choose paid hosting.
- Build: `npm ci && npm run build`.
- Start: `npm start -- --hostname 0.0.0.0 --port $PORT`.
- Node: version 22 (the CI validation version).
- Environment: both Supabase public variables and server-only `LIFEOS_OWNER_ID`.

Use the resulting HTTPS URL in Supabase Auth's Site URL. Add redirect URLs for `/auth/callback` and `/auth/callback?next=/auth/reset`. Configure usable email delivery for password resets. Domain purchase is optional.

A hosted login page is publicly reachable, but private data and modules require the owner account. An unlisted URL is not a security control. Free hosting can sleep between visits; the first request may be slow. Free Supabase projects may pause when inactive.

## Verify before adding real data

- Confirm your account signs in and saves a task/expense that survives reload.
- Confirm a logged-out visitor is redirected to login.
- Confirm a second valid test account cannot enter modules or access tables directly.
- Confirm public signup is rejected by Supabase, even through its direct API.
- Confirm password reset returns only to the approved site.
- Confirm owner UUIDs match in the server and database configuration.
- Test on your phone and add LifeOS to its home screen.

The local suite validates SQL policies in PGlite and browser flows against a test backend. Actual hosted Supabase verification still requires access to your project.

## Backups and account protection

Use Profile & Settings > Download JSON to export account data after online sync. Store exports securely: they contain your private records. Export regularly and before migrations. A JSON export does not include authentication passwords, full database schema, or external CV files, and is not an automatic database restore.

For database recovery, configure backups available on your Supabase plan or use an external database dump. Test a restore into a separate project. Don't restore over the live database without a verified backup. Automated database backups have not been configured by the code changes alone.

Enable MFA for your GitHub, Supabase and hosting administrator accounts, keep your device locked, and retain password recovery access. Sign-out clears cached account records; pending offline changes remain on the device until synced/discarded. Avoid clearing browser storage while changes are pending.

## Current handoff

Deployment requires a confirmed hosting workspace, intended owner email, and authenticated Supabase project access. Code preparation is complete independently of those choices; no production configuration or live deployment should be claimed until verified.

