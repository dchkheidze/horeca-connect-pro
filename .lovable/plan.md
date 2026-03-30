

# Add "New Listing" Button to Real Estate Dashboard

## Problem
The Real Estate Dashboard (`src/pages/dashboards/RealEstateDashboard.tsx`) has a "Manage Listings" button but no direct "Add New Listing" button. Agents need a quick way to create a new property.

## Fix — `src/pages/dashboards/RealEstateDashboard.tsx`

In the Quick Actions card (line ~89), add a "New Listing" button that opens the listings page. Since the create dialog lives in `RealEstateListings.tsx`, the simplest approach is to link to `/re/listings` with a query param `?new=1` and update `RealEstateListings.tsx` to auto-open the create dialog when that param is present.

### Changes:
1. **`src/pages/dashboards/RealEstateDashboard.tsx`** — Add a prominent "Add New Listing" button in Quick Actions:
   ```tsx
   <Button asChild>
     <Link to="/re/listings?new=1">
       <Plus className="h-4 w-4 mr-2" /> Add New Listing
     </Link>
   </Button>
   ```

2. **`src/pages/realestate/RealEstateListings.tsx`** — Read `?new=1` from URL search params and auto-open the create dialog on mount:
   ```tsx
   const [searchParams] = useSearchParams();
   useEffect(() => {
     if (searchParams.get("new") === "1") openCreate();
   }, []);
   ```

Two files, minimal changes.

