

# Plan: Re-point Supabase Client to Shared Database

## What We're Doing
Switching this project's backend connection from `uuguukpjjsupbjidoyde` to the shared fork.ge (RestGo) database at `whxpzfafivwcmhqtfbvy`.

## Important Caveat
- **`.env` is auto-managed** by Lovable Cloud and cannot be manually edited. The Lovable Cloud integration for this project is permanently bound to `uuguukpjjsupbjidoyde`. Editing `.env` would be overwritten.
- **`src/integrations/supabase/client.ts`** is also auto-generated, but we can override its hardcoded values to point to the shared DB.

## Steps

### 1. Update `src/integrations/supabase/client.ts`
Hardcode the URL and anon key to the shared database:
- URL: `https://whxpzfafivwcmhqtfbvy.supabase.co`
- Anon key: the key you provided

### 2. Update `src/integrations/supabase/types.ts`
Replace the current types file with types matching the shared database schema (restaurants with Google Places columns, neighborhoods, restaurant_cuisines, offers, reviews, events, bookmarks, post_likes, post_comments, etc.). This will require querying or manually defining the schema based on the shared DB's actual structure.

Since I cannot run migrations or introspect the remote DB directly from this project, I'll need either:
- A copy of the types from the RestGo project, or
- To manually construct the types based on your schema description.

I can pull the types from the RestGo project using cross-project tools if available.

### 3. No Migrations
No database changes — schema already exists on the shared DB.

## Risk
- Lovable Cloud may regenerate `client.ts` and overwrite our changes. If that happens, the override will need to be re-applied.
- RLS policies on the shared DB may differ from what this project expects — some features may need adjustment.

