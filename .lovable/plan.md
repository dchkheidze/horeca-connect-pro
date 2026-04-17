

User confirmed the other Lovable project is named "RESTGO". I should use cross_project tools to find it and read its types.ts so I can build accurate shared types for this project — since they cannot disable Cloud, the workaround (hardcoded client.ts override + hand-written shared types) is the path forward.

Let me search for the project first to confirm it exists and get its ID.

# Plan: Sync Types From RESTGO Project

## Situation Recap
- Cloud cannot be disabled on this project (no UI button exposed)
- `src/integrations/supabase/client.ts` is already overridden to point at RESTGO's DB (`whxpzfafivwcmhqtfbvy`) — runtime works
- `src/integrations/supabase/types.ts` is locked to the old Cloud DB schema → causes TypeScript errors against the actual shared schema
- You confirmed the other project is **RESTGO**

## What I'll Do (once approved)

### 1. Locate RESTGO and read its types
- Use `cross_project--search_project` with query "RESTGO" to find the project
- Read `src/integrations/supabase/types.ts` from RESTGO — that file already has accurate types for the shared DB

### 2. Create a parallel typed client (does NOT touch locked files)
- New file `src/integrations/supabase/shared-types.ts` — copy of RESTGO's `Database` type definition
- New file `src/integrations/supabase/shared-client.ts`:
  ```ts
  import { createClient } from "@supabase/supabase-js";
  import type { Database } from "./shared-types";
  export const supabase = createClient<Database>(
    "https://whxpzfafivwcmhqtfbvy.supabase.co",
    "<anon key>",
    { auth: { storage: localStorage, persistSession: true, autoRefreshToken: true } }
  );
  ```
- Leaves auto-managed `client.ts` and `types.ts` alone so Lovable Cloud doesn't fight us

### 3. Repoint app imports
- Find every `from "@/integrations/supabase/client"` across the codebase
- Replace with `from "@/integrations/supabase/shared-client"`
- Estimated ~40-50 files based on the file tree (all dashboards, onboarding, profile-edit, public listing pages, admin pages, RFQ component, AuthContext, DashboardRedirect)

### 4. Reconcile schema gaps
RESTGO's schema may not contain every table this project uses. After reading RESTGO's types, I'll list:
- **Tables only in RESTGO** (extra capabilities now available — e.g. `neighborhoods`, `dishes`, `reviews`, `events`, `bookmarks`, `post_likes`, `post_comments`, Google Places columns)
- **Tables only in this project** that don't exist in RESTGO (likely: `service_providers`, `service_provider_offers`, `service_provider_categories`, `rfqs`, `rfq_responses`, `properties`, `real_estate_agents`, `subscriptions`, `knowledge_categories`, `job_seekers`, `job_applications`, `job_categories`, `supplier_categories`, `cuisines`, `cities`)

For tables missing in RESTGO, you'll need to decide per table:
- **(a)** Add them to RESTGO's DB (you/RESTGO owner runs migrations there) — preserves all features here
- **(b)** Remove the corresponding pages/routes from this project — slimmer app, no service-provider/property/RFQ/subscription features

I will not delete any files in this step — I'll just give you the gap report after reading RESTGO's types, and you decide.

### 5. Verify
- Run `SELECT count(*) FROM restaurants`, `cities`, `user_roles` against the connected DB
- Note: the `supabase--read_query` tool is bound to *this* project's original Cloud DB (`uuguukpjjsupbjidoyde`), not RESTGO. So I'll verify by reading the same tables from RESTGO via `cross_project` tools and comparing — that's the closest I can get without you granting DB access manually

## Risks
- Lovable Cloud may regenerate `client.ts` later. The new `shared-client.ts` is independent, so the app keeps working
- If RESTGO's RLS or table shapes change, this project breaks silently — coordinate any RESTGO migrations
- Some pages will likely need to be removed if you choose option (b) for missing tables

## What I Need From You
Approve and I'll execute steps 1-5 in order, pausing after step 4 to show you the gap report before any deletions.

