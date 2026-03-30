

# Knowledge Center — Implementation Plan

## Overview
Build a structured Knowledge Center that replaces/supplements the existing Blog with a professional, Notion-style knowledge system. This is a significant feature with multiple new pages, a new database table for categories, and enhanced article structure.

## Scope Review of the Prompt

The prompt is well-structured and feasible. Here are my notes:

**Fully implementable now:**
- Knowledge Center landing page with category grid, featured articles, popular topic chips, latest articles list, and CTA section
- Category page (filtered article list)
- Enhanced article page with sidebar (related articles, marketplace links)
- Search bar with filtering
- All UI/layout requirements (Notion + Stripe Docs style, rounded cards, soft shadows, etc.)

**Adjustments needed:**
- **Multi-language (EN/GEO/RU)**: This is a major feature on its own (i18n framework, translated content storage, language switcher). I recommend building the Knowledge Center first in English, then adding multi-language as a follow-up phase.
- **AI recommendations**: Noted as "future" in the prompt — will prepare structure but not implement now.
- **SEO optimization**: Can set up page titles/meta tags; full SSR-based SEO isn't possible with the current Vite SPA setup.

## Database Changes

### 1. New table: `knowledge_categories`
Stores the 10 predefined categories with icon names, descriptions, and sort order.

### 2. Modify `posts` table
Add columns:
- `category` (text) — links to a knowledge category slug
- `read_time` (integer) — estimated read time in minutes
- `is_featured` (boolean, default false) — marks featured articles
- `tags` (text array) — for popular topic filtering

## New Pages & Routes

| Route | Page | Description |
|-------|------|-------------|
| `/knowledge` | KnowledgeCenterPage | Main landing with category grid, featured, popular topics, latest, CTA |
| `/knowledge/:categorySlug` | KnowledgeCategoryPage | Category page with filtered article list and sort options |
| `/knowledge/:categorySlug/:articleSlug` | KnowledgeArticlePage | Article with sidebar (related articles, marketplace links) |

## Page Breakdown

### KnowledgeCenterPage
1. **Header**: Title, subtitle, search bar with category chip filters
2. **Category Grid**: 3-column grid of category cards (icon, title, description, article count) — "Coming soon" badge for empty categories
3. **Featured Insights**: 3-4 large cards for featured articles with images, excerpt, category tag, read time
4. **Popular Topics**: Clickable tag chips that filter content
5. **Latest Articles**: Compact list format (title, category, excerpt, date)
6. **CTA Block**: "Browse Marketplace" linking to `/suppliers`

### KnowledgeCategoryPage
- Category header with description and article count
- Article list with sort options (popular, newest, guides/case studies)

### KnowledgeArticlePage
- Article content with structured headings
- Sidebar: related articles, links to suppliers/service providers directory

## Navigation
- Replace "Blog" nav link with "Knowledge Center" pointing to `/knowledge`
- Keep existing `/blog` routes working (redirect or keep as-is)

## Files to Create/Edit
- **Create**: `src/pages/KnowledgeCenterPage.tsx`, `src/pages/KnowledgeCategoryPage.tsx`, `src/pages/KnowledgeArticlePage.tsx`
- **Edit**: `src/App.tsx` (add routes), `src/components/layout/PublicNav.tsx` (update nav link)
- **Create**: Migration for `knowledge_categories` table and `posts` table additions
- **Edit**: Admin content page to support new fields (category, read_time, featured, tags)

## Design Style
- White background with light grey sections
- Minimal color usage (primary brand color only)
- Rounded cards with soft shadows
- Clean typography using existing Outfit/DM Sans fonts
- Line icons from Lucide

## What I Recommend Deferring
- **Multi-language support** — build as a separate phase after the Knowledge Center structure is solid
- **AI recommendations** — structural prep only
- **Full SEO** — limited by SPA architecture; will add document titles

