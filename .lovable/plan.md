

# Property Listings Feature

## Overview
Add a commercial property listings system where registered real estate agents can list properties (restaurants, cafes, hotels, bakeries) for sale or rent. Properties are visible only to authenticated users with standard or premium subscriptions.

## Database Changes

### 1. Add `realestate` to `app_role` enum
```sql
ALTER TYPE public.app_role ADD VALUE 'realestate';
```

### 2. Create `properties` table
| Column | Type | Notes |
|--------|------|-------|
| id | uuid | PK, default gen_random_uuid() |
| owner_user_id | uuid | NOT NULL, the real estate lister |
| listing_type | text | NOT NULL, 'SALE' or 'RENT' |
| property_type | text | NOT NULL (restaurant, cafe, hotel, bakery, other) |
| title | text | NOT NULL |
| slug | text | NOT NULL |
| description | text | nullable |
| price | numeric | nullable |
| currency | text | default 'GEL' |
| area_sqm | numeric | nullable |
| city | text | nullable |
| address | text | nullable |
| contact_phone | text | nullable |
| contact_email | text | nullable |
| cover_image | text | nullable |
| images | text[] | additional photo URLs |
| is_published | boolean | default false |
| status | text | default 'ACTIVE' (ACTIVE, SOLD, RENTED) |
| created_at | timestamptz | default now() |
| updated_at | timestamptz | default now() |

### 3. Create `property-images` storage bucket (public)

### 4. RLS Policies on `properties`
- **SELECT**: Authenticated users with standard/premium subscription can view published properties (uses a security definer function to check subscription)
- **SELECT**: Owners can view their own listings
- **SELECT**: Admins can view all
- **INSERT/UPDATE/DELETE**: Owners can manage their own (owner_user_id = auth.uid())
- **UPDATE**: Admins can update all

### 5. Helper function
```sql
CREATE FUNCTION public.has_active_subscription(_user_id uuid)
RETURNS boolean -- checks subscriptions table for plan IN ('standard','premium')
```

## New Files

### Public-Facing
- **`src/pages/PropertiesPage.tsx`** — Listing directory with filters (sale/rent, property type, city, price range). Requires auth + subscription check. Shows upgrade prompt for free-tier users.
- **`src/pages/PropertyDetailPage.tsx`** — Single property view with image gallery, details, contact info.

### Real Estate Dashboard
- **`src/pages/dashboards/RealEstateDashboard.tsx`** — Overview: listing counts, published status, quick actions
- **`src/pages/realestate/RealEstateListings.tsx`** — CRUD for property listings with create/edit dialog (title, type, price, photos via URL/upload, description)
- **`src/pages/realestate/RealEstateProfileEdit.tsx`** — Agent profile/settings (placeholder)
- **`src/components/onboarding/RealEstateOnboarding.tsx`** — Simple onboarding form (company/agent name, phone, city)

## Modified Files

### Auth & Routing
- **`src/contexts/AuthContext.tsx`** — Add `"realestate"` to `AppRole` type
- **`src/components/auth/ProtectedRoute.tsx`** — Add `"realestate"` to allowed roles type
- **`src/App.tsx`** — Add routes:
  - `/properties` and `/properties/:slug` (inside PublicLayout, but with auth gate)
  - `/re/*` dashboard routes (protected, role=realestate)
- **`src/pages/DashboardRedirect.tsx`** — Add realestate redirect logic
- **`src/pages/OnboardingPage.tsx`** — Add realestate onboarding step
- **`src/pages/auth/RegisterPage.tsx`** — Add "Real Estate Agent" role option

### Navigation
- **`src/components/layout/PublicNav.tsx`** — Add "Properties" nav link
- **`src/components/layout/DashboardLayout.tsx`** — Add realestate role config with nav items (Dashboard, Listings, Settings)

### Admin
- **`src/pages/admin/AdminModeration.tsx`** — Add Properties tab for admin moderation
- **`src/pages/admin/AdminDashboard.tsx`** — Add property count to KPIs (if applicable)

## Access Control Summary
- **Browse properties**: Must be logged in AND have standard/premium subscription
- **Free users**: See an upgrade prompt instead of listings
- **Real estate agents**: Full CRUD on their own listings
- **Admins**: Can view/moderate all listings

## Implementation Order
1. Database migration (enum, table, RLS, storage bucket, helper function)
2. Auth context + registration updates
3. Onboarding component for realestate role
4. Real estate dashboard + listings CRUD
5. Public properties page + detail page
6. Navigation + routing updates
7. Admin moderation tab

