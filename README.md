# RESET Repair Shop

Customer booking and repair-tracking website for the RESET service center in Astana.

## Features

- Repair request form with a customer tracking code
- Repair status page
- Russian, Kazakh, and English interfaces
- Prices, deals, reviews, and site images managed through the admin panel
- Responsive customer and admin layouts
- Supabase authentication, database, storage, and notifications

## Stack

- Vite, React 18, and TypeScript
- wouter
- Supabase
- Vercel

## Local setup

Requires Node.js 22 or newer.

```bash
npm install
npm run dev
```

Create a local `.env` file with the public Supabase project settings:

```text
VITE_SUPABASE_URL=...
VITE_SUPABASE_ANON_KEY=...
```

Never commit `.env` or a Supabase `service_role` key.

## Checks and deployment

```bash
npm run build
npm run preview
```

Pushing `main` to GitHub triggers the Vercel deployment. Database changes belong in
`supabase/migrations/` and are applied with the Supabase CLI workflow documented in `AGENTS.md`.

## Main routes

- `/` — customer website
- `/request` — repair request
- `/track` — repair tracking
- `/admin` — staff administration
