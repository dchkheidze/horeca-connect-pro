

# Open Properties to All Users

## Problem
Properties browsing requires login + paid subscription. Property posting is restricted to real estate agents only. User wants all users to see and post properties freely.

## Changes

### 1. `src/pages/PropertiesPage.tsx` — Remove auth & subscription gates
- Remove the `useAuth` hook, `hasSubscription` state, and subscription check logic
- Remove the "Sign in required" and "Upgrade Required" blocks
- Simply fetch all published/active properties on mount without any user check

### 2. `src/pages/PropertyDetailPage.tsx` — Remove auth & subscription gates
- Same approach: remove auth check, subscription check, and gating UI
- Fetch property by slug directly without requiring login

### 3. Database RLS — Allow public SELECT on published properties
Currently the `properties` table only allows subscribers to view published properties. Need to:
- **Drop** the policy `"Subscribers can view published properties"` (requires authenticated + subscription)
- **Add** a new policy `"Anyone can view published properties"` with `USING (is_published = true AND status = 'ACTIVE')` for `public` role

### 4. Database RLS — Allow any authenticated user to INSERT properties
Currently only owners can insert (tied to `owner_user_id = auth.uid()`). This already works for any authenticated user since they set themselves as owner. No RLS change needed — the existing `"Owners can insert their properties"` policy with `WITH CHECK (auth.uid() = owner_user_id)` allows any logged-in user to create a property as long as they set themselves as owner.

### 5. Route access — Properties listing page in `RealEstateListings.tsx`
This page is behind the `/re` protected route (realestate role only). To let all users manage their own properties, we need a new route accessible to all authenticated users. Options:
- Add a `/my-properties` or `/properties/manage` route outside the role-restricted `/re` path
- Or keep using the existing listings page but also mount it at an accessible path

### Summary of file changes:
1. **`src/pages/PropertiesPage.tsx`** — Remove auth/subscription gating, fetch properties directly
2. **`src/pages/PropertyDetailPage.tsx`** — Remove auth/subscription gating
3. **Migration SQL** — Replace subscriber-only SELECT policy with public SELECT policy
4. **`src/App.tsx`** — Add a new protected route (any authenticated user) for property management, e.g. `/my-properties` pointing to `RealEstateListings.tsx`

