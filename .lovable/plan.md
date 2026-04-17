

User asks who can publish a restaurant (toggle `is_published`). Let me check RLS policies on `restaurants` table from the context already provided.

From `<supabase-tables>` → `restaurants` → RLS policies:

**UPDATE policies on `restaurants`:**
1. `Admins can update all restaurants` — `USING: is_admin(auth.uid())`
2. `Owners can update their restaurant` — `USING: auth.uid() = owner_user_id`

Both can toggle `is_published` since it's just a column update. No column-level restriction exists.

**UI surfaces for publishing:**
- Owner: `src/pages/restaurant/RestaurantProfileEdit.tsx` — "Visibility" card with `Switch` bound to `is_published`, saved via `restaurants.update(...)` filtered by `id` (owner RLS allows it)
- Admin: `src/pages/admin/AdminModeration.tsx` — `toggleRestaurantPublished(id, currentStatus)` updates `restaurants.is_published` (admin RLS allows it)

# Publishing Permissions for Restaurants

**Yes, both can publish.** Confirmed by RLS policies on the `restaurants` table:

| Who | Policy | Where in app |
|---|---|---|
| Restaurant owner | `Owners can update their restaurant` (`auth.uid() = owner_user_id`) | Dashboard → Profile → "Visibility" toggle (`RestaurantProfileEdit.tsx`) |
| Admin | `Admins can update all restaurants` (`is_admin(auth.uid())`) | Admin → Moderation → publish switch on restaurants tab (`AdminModeration.tsx`) |

Same pattern applies to `suppliers`, `service_providers`, `properties` — owners publish their own, admins publish anyone's.

**Note on "Good Restaurant":** It's currently `is_published = false`. Either the owner logs in and flips the visibility switch on their profile, or an admin flips it from the Moderation page. No code changes needed — both paths already exist and work.

