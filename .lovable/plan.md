

The user is asking how to change their password. Let me think about what exists and what's missing.

**Current state:**
- Forgot password flow exists (`/auth/forgot-password` → email link → `/auth/reset-password`)
- No in-app "change password" page for logged-in users
- The user is on `/` (landing) — likely asking generally

**Two interpretations:**
1. "How do I do it right now?" → instructional answer (no code)
2. "Build a change-password feature" → implementation

Given the recent thread (admin login struggles, email reset unreliable without custom domain), the user most likely wants an **in-app change password option** so they don't depend on email at all.

# Plan: Add in-app "Change Password" for logged-in users

## What to build
A simple settings page where any signed-in user can change their password by entering current + new password.

## Pages & routes
- New page: `src/pages/auth/ChangePasswordPage.tsx`
- New route: `/account/password` (wrapped in `ProtectedRoute`, no role restriction so all authenticated users can use it)

## Form fields
- Current password (re-authenticate by calling `signInWithPassword` with current email + current pw to verify)
- New password (min 8 chars, Zod validation)
- Confirm new password (must match)

## Logic
1. Validate inputs with Zod (same pattern as `ResetPasswordPage`)
2. Verify current password by re-signing in with `supabase.auth.signInWithPassword`
3. If verified, call `supabase.auth.updateUser({ password: newPassword })`
4. Toast success + stay on page (session remains valid)

## Entry points (so user can find it)
- Add "Change password" link in `PublicNav`'s authenticated dropdown/menu area (next to "Sign out")
- Optionally add it to each dashboard sidebar — but a single global header link is enough for now

## Out of scope
- 2FA, password strength meter, session-wide logout-on-change (Supabase handles session refresh automatically)

## Meanwhile — answer to "how to change password right now"
Three existing options:
1. **Forgot password flow** — `/auth/forgot-password`, but email delivery is unreliable until a custom sender domain is configured
2. **Admin reset edge function** — still deployed; can set a temporary password directly (what we used for `dchkheidze@gmail.com`)
3. **After this feature ships** — just sign in and visit `/account/password`

