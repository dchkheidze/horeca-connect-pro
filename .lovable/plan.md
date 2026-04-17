
Root cause

- This does not look like a bad password.
- I found that the app is pointed at the wrong backend environment.
- The current project/backend we inspected and reset passwords in is `uuguukpjjsupbjidoyde`, but the browser auth client in `src/integrations/supabase/client.ts` is hardcoded to a different project: `whxpzfafivwcmhqtfbvy`.
- So the password reset was applied in the current backend, while the login form is checking credentials against the old backend. That exactly matches the “credentials are wrong” symptom and also explains why the reset-email logs were empty.

Plan

1. Repair the backend binding
   - Refresh/regenerate the managed backend client so the app uses the same backend as this project’s database and auth system.
   - Do not rely on the stale hardcoded client values going forward.

2. Retest authentication end-to-end
   - Try signing in again with the admin account using the password that was already reset.
   - Trigger forgot-password again and confirm the request now reaches the correct backend.

3. Verify access after login
   - Check `/dashboard` and `/admin/dashboard`.
   - Spot-check a couple of data-driven pages, because this mismatch can affect more than auth.

4. Clean up
   - Remove the temporary admin password-reset helper once login is confirmed working.

Technical details

- `.env` points to the current backend: `uuguukpjjsupbjidoyde`
- `src/integrations/supabase/client.ts` points to a different backend: `whxpzfafivwcmhqtfbvy`
- The admin user `dchkheidze@gmail.com` does exist in the current backend and is confirmed there, so the main fix is aligning the frontend with the correct backend, not recreating the user.
