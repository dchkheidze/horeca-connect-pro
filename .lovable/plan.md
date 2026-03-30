

# Fix Subscription Editing in Admin Users

## Problem
Two bugs:
1. **Fetch bug**: `subsRes.error` is never checked/thrown (line 76 checks rolesRes but skips subsRes), so subscription data silently fails to load — hence "None" for everyone.
2. **Save bug**: `handleSaveSub` uses `.update()` which does nothing if no subscription row exists for a user. Need to use `.upsert()` instead.

## Fix — `src/pages/admin/AdminUsers.tsx`

### 1. Add error check for subscriptions fetch (after line 76)
```typescript
if (subsRes.error) throw subsRes.error;
```

### 2. Change `handleSaveSub` from `.update()` to `.upsert()`
Replace:
```typescript
const { error } = await supabase
  .from("subscriptions")
  .update({ plan: selectedPlan, billing_period: selectedBilling })
  .eq("user_id", editingSub.id);
```
With:
```typescript
const { error } = await supabase
  .from("subscriptions")
  .upsert(
    { user_id: editingSub.id, plan: selectedPlan, billing_period: selectedBilling },
    { onConflict: "user_id" }
  );
```

This requires a unique constraint on `subscriptions.user_id`. Need to check if one exists — if not, add a migration for it.

### 3. Database migration (if needed)
Add unique constraint on `subscriptions.user_id`:
```sql
ALTER TABLE public.subscriptions ADD CONSTRAINT subscriptions_user_id_key UNIQUE (user_id);
```

One file edit, one possible migration. Minimal change.

