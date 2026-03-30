

# Fix Post Creation Bug & Clarify Knowledge Center Content Flow

## Problem
The "New Post" dialog in admin Content Management freezes because the Category dropdown has `<SelectItem value="">None</SelectItem>` — Radix UI Select does not support empty string values, causing the component to break silently.

## Fix

### 1. Fix Category Select (`src/pages/admin/AdminContent.tsx`)
- Change `<SelectItem value="">None</SelectItem>` to `<SelectItem value="none">None</SelectItem>`
- Update `handleSave` to treat `"none"` as null when saving to the database
- Update `openEditDialog` to map null category to `"none"`
- Initialize `formData.category` default to `"none"` instead of `""`

### 2. How Knowledge Center Content Works (No code change needed)
The Knowledge Center pages pull from the same `posts` table that the admin manages:
- **Admin creates posts** via Admin Panel → Content Management → "New Post"
- **Assign a category** from the Knowledge Categories dropdown (e.g., "Operations & Management")
- **Set status to PUBLISHED** to make it visible
- **Mark as Featured** to show in the "Featured Insights" section on the Knowledge Center landing page
- **Add tags** to enable filtering via "Popular Topics" chips

The Knowledge Center hub (`/knowledge`) queries `posts` grouped by `knowledge_categories`. Category pages (`/knowledge/:slug`) filter posts by that category. Article pages (`/knowledge/:cat/:article`) display the full post with a sidebar.

## Files to Edit
- `src/pages/admin/AdminContent.tsx` — fix the empty-value Select bug

