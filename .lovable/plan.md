
Root cause

- The restaurant record itself is fine: “Good Restaurant” is already `is_published = true` in the database.
- The real issue is the frontend: this project does not currently have a public restaurant directory or restaurant detail route.
- I confirmed:
  - `App.tsx` has routes for `/suppliers`, `/service-providers`, `/jobs`, `/properties`, but no `/restaurants`.
  - There is no `RestaurantsPage` or `RestaurantDetailPage` component.
  - Admin Moderation links to `/restaurants/:slug`, but that route does not exist, so the preview link is effectively broken.
- That is why the restaurant is neither visible nor searchable on Restgo even though it is published.

What I’ll build

1. Add a public Restaurants directory
   - New page modeled after Suppliers / Service Providers.
   - Query published restaurants only.
   - Add client-side search for name, description, city, and cuisine tags.
   - Show restaurant cards with name, city, cuisine, price level, and link to the public profile.

2. Add a public Restaurant detail page
   - New slug-based page at `/restaurants/:slug`.
   - Load only published restaurants.
   - Show full restaurant details: description, city, address, phone, website, cuisine tags, and price level.

3. Wire routing and navigation
   - Register `/restaurants` and `/restaurants/:slug` in `App.tsx`.
   - Add “Restaurants” to the public nav so users can actually browse them.
   - Keep SEO-friendly slug behavior consistent with the rest of the app.

4. Align existing links
   - Ensure Admin Moderation’s existing external link now opens a real public page.
   - Review any other places that should point to the restaurant directory/profile.

5. Verify the specific case
   - Confirm “Good Restaurant” appears in the directory.
   - Confirm searching “Good Restaurant” returns it.
   - Confirm `/restaurants/good-restaurant-mo1pb703` loads correctly.

Technical notes

- No database migration should be needed.
- Existing RLS already allows public reads for published restaurants: `is_published = true`.
- I’ll follow the same structure and styling patterns already used by:
  - `SuppliersPage.tsx`
  - `SupplierProfilePage.tsx`
  - `ServiceProvidersPage.tsx`
  - `ServiceProviderProfilePage.tsx`

Files likely involved

- `src/App.tsx`
- `src/components/layout/PublicNav.tsx`
- new `src/pages/RestaurantsPage.tsx`
- new `src/pages/RestaurantProfilePage.tsx`

Expected outcome

- Published restaurants become visible to the public.
- “Good Restaurant” becomes browseable and searchable on Restgo.
- Admin preview links for restaurants stop leading to missing pages.
