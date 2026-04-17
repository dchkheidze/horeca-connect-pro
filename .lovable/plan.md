

User can't sign in as admin. The admin role row exists in `user_roles` (user_id `f1df0fc5...`) but the auth credentials may not work — likely because the `auth.users` row for that user_id doesn't exist anymore (DB merge could have wiped auth.users while leaving public schema intact), or the password is unknown.

Let me think through what I can verify vs. what needs action:

**Verifiable now (read-only):**
- Whether `auth.users` contains the admin user_id `f1df0fc5...`
- The admin's email (from auth.users)

**Not fixable in read-only mode:**
- Resetting the password (requires admin API / SQL)
- Creating a new admin user (requires signup + role insert migration)

# Plan: Restore Admin Access

## Step 1 — Diagnose (read-only, immediate)
Query `auth.users` to check whether the admin user (`f1df0fc5...`) still exists and what email it uses. Three possible outcomes:

| Finding | Meaning | Fix |
|---|---|---|
| User exists, email known | Password forgotten/changed | Send password reset OR set new password via admin API |
| User row missing | DB merge wiped auth user but left role | Create new admin: sign up via UI, then promote via SQL |
| User exists but email unknown to you | Need to confirm with you | Show email so you can request reset |

## Step 2 — Restore access (requires switch to default mode)
Based on what Step 1 finds, do one of:

- **A) Reset password for existing admin**: Use Supabase admin API (in a one-off edge function or migration) to set a known temporary password — you log in and change it.
- **B) Recreate admin from scratch**: You sign up normally with any email through `/auth/register` (pick any role). I then add an `admin` row in `user_roles` for your new `user_id` via migration. You'll have admin access on next login.
- **C) Promote an existing user**: If you already have another working account, I add an `admin` role row for that user_id via migration.

Option **B** is the safest and fastest if the original admin's auth row is gone.

## What I need from you
1. Approve so I can run the diagnostic query.
2. After I report findings, tell me your preferred fix path (A/B/C) and provide the email you want to use as admin.

