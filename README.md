# WOS Hub

A Whiteout Survival alliance management dashboard: manage multiple accounts,
track troops/pets/experts/gear/charms, manage your hero roster, and run
alliance admin (players, events, settings).

**Stack:** React 18 + Vite (frontend), Supabase (Postgres backend), Node.js
tooling.

## Project structure

```
wos-hub/
├── index.html              Vite entry HTML
├── vite.config.js
├── package.json
├── .env.example            Copy to .env and fill in your Supabase project
├── supabase/
│   ├── schema.sql           Run once against your Supabase project
│   └── seed.sql              Optional demo data
└── src/
    ├── main.jsx              App bootstrap
    ├── App.jsx                Routing + top-level layout
    ├── styles/global.css      All app styling (design tokens, components)
    ├── assets/                Hero portraits, pet/charm icons, etc.
    ├── data/                  Static game data (hero roster, pet/charm defs)
    ├── lib/
    │   ├── supabaseClient.js  Supabase client singleton
    │   ├── api.js             All Supabase queries (accounts/players/alliances/events)
    │   └── utils.js           Small helpers (slugify, etc.)
    ├── context/
    │   └── AppDataContext.jsx Loads everything from Supabase, exposes state + mutators
    ├── components/
    │   ├── common/            Shared UI: Sidebar's Topbar, ProfileCard, StatCard, Modal, ...
    │   ├── sidebar/            Sidebar, account rows, Add Account modal
    │   ├── overview/           Troops Setup, Snow Ape card
    │   ├── rally/              Pet/Expert/Gear/Charm cards
    │   ├── heroes/             Hero card + hero generation sections
    │   ├── events/              Event card + Add Event modal
    │   └── players/, settings/ (styling only lives in global.css; page logic in pages/)
    └── pages/                 One file per route (Overview, RallyLead, Heroes,
                                Players, EventManagement, EventDetail, Settings, ...)
```

## Prerequisites

- Node.js 18+
- A Supabase project (free tier is fine) — create one at https://supabase.com

## 1. Set up the database

1. Open your Supabase project's **SQL Editor**.
2. Paste the contents of `supabase/schema.sql` and run it. This creates the
   `alliances`, `players`, `accounts`, and `events` tables, plus RLS policies.
3. (Optional, recommended for first run) Paste and run `supabase/seed.sql` to
   get demo data matching the original prototype (two accounts, a few
   players, three alliances, four events).

> The RLS policies shipped in `schema.sql` allow any authenticated Supabase
> user to read/write everything, since this is meant as an internal alliance
> tool. Tighten these before exposing the app more broadly — for example,
> restrict writes on `players` and `events` to callers whose own `players`
> row has `permission = 'Admin'`.

## 2. Configure environment variables

```bash
cp .env.example .env
```

Fill in `VITE_SUPABASE_URL` and `VITE_SUPABASE_ANON_KEY` from your Supabase
project's **Settings → API** page.

## 3. Install and run

```bash
npm install
npm run dev
```

Vite will print a local URL (typically `http://localhost:5173`).

## 4. Build for production

```bash
npm run build
npm run preview   # serves the production build locally to sanity-check it
```

The build output goes to `dist/`, ready to deploy to any static host (Vercel,
Netlify, Cloudflare Pages, or your own Node/nginx server).

## How the data model works

Most of the app's per-account state (troops setup, rally lead stats, pet/
expert/gear/charm levels, and hero ownership/widget levels) is stored as
JSONB columns on the `accounts` table rather than spread across many
relational tables. The frontend always reads and writes each of these as a
single nested object, so this avoids unnecessary joins while keeping the
shape self-documented in `supabase/schema.sql`.

Static game data that never changes at runtime (the hero roster, pet
definitions, charm types) lives in `src/data/*.js` as plain JS modules, not in
Supabase — there's no reason to round-trip that over the network.

## Known simplifications

- There's no authentication flow wired up yet (Supabase Auth would slot in
  naturally — `isCurrentUserAdmin` already checks a real `players.permission`
  value, it just isn't yet tied to a logged-in user's identity).
- Hero/pet/charm artwork embedded here are illustrative placeholders/user
  supplied assets, not official game assets.
