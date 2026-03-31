

# Fix: Admin Cannot Upsert Subscriptions

## Problem
The `subscriptions` table RLS policies don't allow admins to INSERT rows for other users. The upsert operation needs both INSERT and UPDATE permissions. Currently:
- ✅ "Admins can update all subscriptions" — UPDATE works
- ❌ No "Admins can insert subscriptions" — INSERT fails when no row exists

## Fix — Database Migration

Add an RLS policy allowing admins to insert subscriptions:

```sql
CREATE POLICY "Admins can insert all subscriptions"
ON public.subscriptions
FOR INSERT
TO authenticated
WITH CHECK (is_admin(auth.uid()));
```

Single migration, no code changes needed.

