

# Add Unsplash Stock Photos Across the Site

## Overview
Add hospitality-themed stock photos from Unsplash to the landing page, directory listing cards, and blog posts to make the site visually engaging.

## Changes

### 1. Landing Page Hero Section (`src/pages/LandingPage.tsx`)
- Add a full-width background image behind the hero text (e.g., busy restaurant kitchen or elegant dining room)
- Use an Unsplash URL with dark overlay for text readability
- Add images to the "Why HoReCa Hub?" featured section (replace the gradient placeholder with a real photo)

### 2. Landing Page Role Cards (`src/pages/LandingPage.tsx`)
- Add a small illustrative image or photo header to each role card (restaurant scene, delivery/supply chain, chef at work)

### 3. Supplier Directory Cards (`src/pages/SuppliersPage.tsx`)
- Replace the `<Building2>` icon placeholder in the card header area with a relevant Unsplash stock photo (food supply, commercial kitchen equipment, etc.)
- Use a default fallback image when no custom image exists

### 4. Service Provider Directory Cards (`src/pages/ServiceProvidersPage.tsx`)
- Same approach — replace the `<Wrench>` icon placeholder with a hospitality services stock photo

### 5. Blog Post Thumbnails (`src/pages/BlogPage.tsx`)
- Add a placeholder thumbnail image to each blog post card using a generic hospitality/food photo
- Show it in the card header area above the title

### 6. Blog Post Detail (`src/pages/BlogPostPage.tsx`)
- Add a hero/banner image at the top of the post detail page

## Technical Approach
- Use Unsplash source URLs (e.g., `https://images.unsplash.com/photo-XXXXX?w=800&q=80`) — no API key needed
- Define a set of ~8-10 curated hospitality photo URLs as constants
- For directory cards without custom images, rotate through these photos deterministically (based on item index or id hash)
- Use `object-cover` CSS for consistent aspect ratios
- Add `loading="lazy"` for performance

## Files to Edit
- `src/pages/LandingPage.tsx` — hero bg image, role card images, featured section image
- `src/pages/SuppliersPage.tsx` — card thumbnail images
- `src/pages/ServiceProvidersPage.tsx` — card thumbnail images
- `src/pages/BlogPage.tsx` — post card thumbnails
- `src/pages/BlogPostPage.tsx` — post hero image

