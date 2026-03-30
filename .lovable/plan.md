

# Add Image Support to Articles (URL + Upload)

## Overview
Add a `cover_image` field to posts so admins can either paste an image URL or upload an image file. Articles without a custom image will continue using the current Unsplash fallback.

## Changes

### 1. Database Migration
- Add `cover_image` (text, nullable) column to `posts` table
- Create a `post-images` storage bucket (public) with RLS policies allowing admin uploads

### 2. Admin Post Editor (`src/pages/admin/AdminContent.tsx`)
- Add a "Cover Image" section in the create/edit dialog with:
  - Tab toggle: "URL" | "Upload"
  - URL tab: text input for pasting any image URL
  - Upload tab: file input with drag-and-drop, uploads to `post-images` bucket
  - Image preview thumbnail when a URL or uploaded image is set
  - Clear button to remove the image
- Save `cover_image` URL to the `posts` table

### 3. Update Display Pages
- **BlogPage.tsx**: Use `post.cover_image || pickImage(UNSPLASH.blog, post.id)` for thumbnails
- **BlogPostPage.tsx**: Same fallback logic for hero image
- **KnowledgeCenterPage.tsx**: Same for featured article cards
- **KnowledgeCategoryPage.tsx**: Same for category article cards
- **KnowledgeArticlePage.tsx**: Same for article hero image

## Files to Edit
- **Migration**: Add `cover_image` column + storage bucket
- `src/pages/admin/AdminContent.tsx` — image input UI
- `src/pages/BlogPage.tsx` — use cover_image with fallback
- `src/pages/BlogPostPage.tsx` — use cover_image with fallback
- `src/pages/KnowledgeCenterPage.tsx` — use cover_image with fallback
- `src/pages/KnowledgeCategoryPage.tsx` — use cover_image with fallback
- `src/pages/KnowledgeArticlePage.tsx` — use cover_image with fallback

