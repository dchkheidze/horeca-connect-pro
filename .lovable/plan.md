

# Fix Post Editor Dialog Scrolling

## Problem
The create/edit post dialog contains many form fields (title, slug, excerpt, content, status, category, read time, tags, cover image, featured) that exceed the viewport height. The dialog has no overflow scrolling, so the bottom fields are inaccessible.

## Fix

### `src/pages/admin/AdminContent.tsx`
- Add `max-h-[80vh] overflow-y-auto` to the `DialogContent` or to the form body `div` inside the dialog
- Specifically, wrap the form fields `div` (currently `className="space-y-4 py-4"`) with overflow scrolling: change to `className="space-y-4 py-4 max-h-[60vh] overflow-y-auto pr-2"`
- This keeps the dialog header and footer fixed while the form content scrolls

### Technical detail
The dialog structure is:
- `DialogContent` (fixed positioning)
  - `DialogHeader` (stays visible)
  - Form fields div → **add `max-h-[60vh] overflow-y-auto`**
  - `DialogFooter` (stays visible)

One file edit, one line change.

