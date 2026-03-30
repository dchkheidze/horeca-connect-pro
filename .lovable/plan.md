

# Add Subscription Level Editing for Admin

## Overview
Add an "Edit Subscription" action per user in Admin Users, allowing admins to change a user's plan (Free/Standard/Premium) and billing period (Monthly/Annual).

## Changes

### `src/pages/admin/AdminUsers.tsx`
1. Add state for subscription editing: `editingSubscription` (user), `selectedPlan`, `selectedBilling`
2. Add an "Edit Subscription" button next to the existing "Edit Roles" button in each user row
3. Add a new Dialog with:
   - Radio group for plan selection: Free, Standard, Premium
   - Radio group for billing period: Monthly, Annual
4. On save: `supabase.from("subscriptions").update({ plan, billing_period }).eq("user_id", userId)`
5. Refresh user list after save

No database or RLS changes needed — the `subscriptions` table already has an "Admins can update all subscriptions" policy.

## Files to Edit
- `src/pages/admin/AdminUsers.tsx` — add subscription edit dialog and button

