## Goal
Translate the homepage (`/`) content to Georgian (ქართული).

## Scope
Only `src/pages/LandingPage.tsx` — all visible strings (hero, stats, role cards, "Why" section, CTA). Navigation header and footer are shared across the whole site and will stay in English for now (can be done as a follow-up).

## Translations (key strings)

- Hero title: "The B2B Marketplace for Hospitality Professionals" → „B2B პლატფორმა სასტუმრო-რესტორნის პროფესიონალებისთვის"
- Hero subtitle → "დააკავშირეთ რესტორნები სანდო მომწოდებლებთან, აღმოაჩინეთ საუკეთესო კადრები და გაზარდეთ თქვენი ბიზნესი HoReCa ინდუსტრიაში."
- Buttons: "Get Started Free" → „დაიწყეთ უფასოდ"; "Browse Suppliers" → „იხილეთ მომწოდებლები"; "Browse Jobs" → „ვაკანსიების დათვალიერება"; "Create Free Account" → „შექმენით უფასო ანგარიში"
- Stats labels: Verified Suppliers/Active Jobs/Restaurants/Satisfaction Rate → „დადასტურებული მომწოდებლები / აქტიური ვაკანსიები / რესტორნები / კმაყოფილების მაჩვენებელი"
- Section heading "How can we help you today?" → „როგორ შეგვიძლია დაგეხმაროთ?"
- Role cards (For Restaurants/Suppliers/Job Seekers) — titles, descriptions, feature bullets, CTAs all translated
- "Why HoReCa Hub?" + heading + paragraph + 4 bullet items translated
- Final CTA section heading + subtitle translated
- Brand name "HoReCa Hub" stays as-is

## Technical
- Single-file edit: hardcode Georgian strings directly in `LandingPage.tsx` (no i18n framework added).
- No new dependencies, no routing, no DB changes.
- Fonts: Outfit + DM Sans both support Georgian script via Google Fonts — already loaded.

## Out of scope
- Header (`PublicNav`) and `Footer` — remain English.
- Other pages (Suppliers, Jobs, Auth, etc.) — remain English.
- A real multi-language switcher (EN/GE/RU per project memory) — would require introducing `react-i18next`, a language context, and translating every page. Mention as a follow-up.

## Follow-ups (optional, ask after)
- Translate `PublicNav` + `Footer` so the page looks fully Georgian.
- Add a proper i18n system with EN/GE/RU switcher in the header.