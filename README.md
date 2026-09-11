# Sackhe Technologies — Website

Marketing + storefront site for **Sackhe Technologies Pvt Ltd** (Hyderabad) — providers of sustainable waste-management solutions such as emission-controlled incinerators, biodegradable sanitary pads, and smart dispensers.

## Features

- Single-page Vite app with a lightweight hash-based router (`#/`, `#/about`, `#/products`, `#/services`, `#/initiatives`, `#/contact`) and editorial marketing pages built from real campaign photography
- Product catalog (e.g. Dual-Chamber Eco Incinerator, Biodegradable Sanitary Pads institutional box, Smart Automated Dispenser) with detail views
- Cart drawer with subtotal/total, quantity badge, and a checkout flow (address, notes, bank-transfer UTR reference) that persists orders to localStorage
- Authentication overlay with sign-in / register panes; role-based access (admin vs standard user) re-validated against the local user store on every session
- Admin dashboard (admin-only route) with stats (leads, orders, revenue, units), lead search, order management, CSV export of leads, and a settings form
- Lead capture feeding the admin pipeline; SEO basics (robots.txt, sitemap.xml) in place

## Tech Stack

- Vanilla JavaScript SPA (no frontend framework) with Vite 5
- Plain CSS (`index.css`), optimized `webp`/`jpg` imagery served from the repo root
- State persisted entirely client-side in `localStorage` (users, auth, cart, orders, leads) — no backend
- Dev tooling: Lighthouse 13, Puppeteer, compression (devDependencies only)

## Getting Started

```bash
npm install
npm run dev      # vite dev server
npm run build    # production build to dist/
npm run preview  # preview the production build
```

## Project Structure

```
├── index.html            # SPA shell with all page templates
├── app.js                # router, auth, cart, checkout, admin logic
├── index.css             # global styles
├── vite.config.js
├── vercel.json           # build + long-lived immutable cache headers for assets
├── public/               # static assets
├── extracted_content.md  # source content notes used to build the pages
└── lighthouse-*.json     # performance audit snapshots
```

## Deployment

Vercel (`vercel.json` pins `vite` framework, builds with `npm run build`, outputs `dist/`, and serves static assets with `Cache-Control: immutable`). Live at **sackhe.srishanth.com**.

## Notes

All state (users, orders, leads, cart) is demo-grade and stored in the browser only — there is no server or database. No credentials are required to run locally; admin features are gated by the seeded admin account.
