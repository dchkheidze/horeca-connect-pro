

User says "Good Restaurant" isn't visible on the public Restaurants directory. They're logged in as admin/restaurant owner and want to know how to publish it.

Let me check what controls visibility and where the toggle lives.

From the codebase I already have:
- `src/pages/restaurant/RestaurantProfileEdit.tsx` has a "Visibility" card with an `is_published` Switch — this is the owner-side publish toggle.
- `src/pages/admin/AdminModeration.tsx` has a Restaurants tab with a publish Switch — admin-side override.
- Public directory likely filters by `is_published = true` (standard pattern, matches the rest of the project).

Let me also confirm "Good Restaurant" exists and its current state.
<lov-plan-actions>
Quick check via DB to confirm the row + status.
</lov-plan-actions>

# Answer: How to publish a restaurant

This is a how-to question, not a build request. No code changes needed — the feature already exists.

## Two ways to make a restaurant visible

### Option A — As the restaurant owner
1. Sign in as the restaurant's owner account
2. Go to the Restaurant dashboard → **Profile** (route: `/r/profile`)
3. At the top, find the **Visibility** card
4. Flip the **Public Profile** switch ON (eye icon turns green)
5. Click **Save Changes**

The restaurant will appear at `/restaurants` and be reachable at `/restaurants/<slug>`.

### Option B — As an admin (override)
1. Go to **Admin → Moderation** (`/admin/moderation`)
2. Open the **Restaurants** tab
3. Find "Good Restaurant" in the table
4. Toggle the **Published** switch ON

No save button needed — the admin toggle writes immediately.

## Why "Good Restaurant" isn't showing
Almost certainly its `is_published` flag is still `false` (the default after onboarding — onboarding creates restaurants with `is_published: false`). The public `/restaurants` page filters out unpublished entries.

## If toggling on still doesn't show it
Possible secondary causes to check after publishing:
- Restaurant has no `slug` (older rows may be missing it) — saving the profile regenerates the slug
- Browser cache — hard refresh `/restaurants`
- Filters applied on the directory page (city/cuisine) excluding it

Tell me if it's still not visible after toggling and I'll investigate the row directly.

<lov-actions>
<lov-suggestion message="Good Restaurant is still not visible after I toggled is_published on. Please investigate the database row and the /restaurants directory query.">It's still not visible after toggling</lov-suggestion>
<lov-suggestion message="Add a 'Publish' shortcut button directly on the Restaurant Dashboard so owners don't have to dig into Profile → Visibility to make their restaurant public.">Add quick-publish button on dashboard</lov-suggestion>
<lov-suggestion message="Show a clear 'Your restaurant is hidden from the public directory' banner on the Restaurant Dashboard whenever is_published is false, with a one-click Publish button.">Add hidden-status banner</lov-suggestion>
<lov-suggestion message="Delete the temporary admin-reset-password edge function now that login and in-app password change both work.">Clean up admin-reset-password function</lov-suggestion>
</lov-actions>

