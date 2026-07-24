-- WOS Hub schema
-- Run this once in the Supabase SQL editor (or via the Supabase CLI) against
-- your project. It creates every table the app reads from and writes to.

-- ---------------------------------------------------------------------------
-- alliances
-- ---------------------------------------------------------------------------
create table if not exists alliances (
  tag        text primary key,
  color      text not null default '#3ddc97',
  created_at timestamptz not null default now()
);

-- ---------------------------------------------------------------------------
-- players (the "Players" admin page)
-- ---------------------------------------------------------------------------
create table if not exists players (
  id           text primary key,          -- in-game numeric ID, as text
  name         text not null,
  alliance_tag text references alliances(tag) on delete set null,
  permission   text not null default 'Players'
               check (permission in ('Admin','Team Maker','Battle Strat','Player Manager','Players')),
  -- Any combination of: 'rally-lead','potential-rally-lead','joiner','looter','gather'.
  roles        jsonb not null default '[]'::jsonb,
  created_at   timestamptz not null default now()
);

-- ---------------------------------------------------------------------------
-- accounts (every account/alt shown in the sidebar; the heart of the app)
--
-- troops / rally / heroes are stored as JSONB because the front-end always
-- reads and writes each of them as a single nested object per account -
-- there is no need to query into their internals from SQL, so relational
-- tables would only add joins without adding value.
--
-- Shape of `troops`:
--   { infantry: {fc, tier, skill}, lancer: {...}, marksman: {...} }
--
-- Shape of `rally`:
--   {
--     rallyCap, islandScore, petPower, expertPower, techPower,
--     petLevels: { titanRoc, snowLeopard, caveLion, ironRhino,
--                  sabertoothTiger, mammoth, frostGorilla, frostscaleChameleon },
--     expert: { romulus, fabian, valeria },
--     gear: { chiefMaxed, heroMaxed, maxSquad },
--     charmLevels: { Hat: {left, top, right}, Watch: {...}, Coat: {...},
--                    Pants: {...}, Ring: {...}, Cudgel: {...} }
--   }
--
-- Shape of `heroes`:
--   { "<hero-slug>": { owned: boolean, widget: 0-10 }, ... }
-- ---------------------------------------------------------------------------
create table if not exists accounts (
  key             text primary key,        -- URL/JS-safe slug, e.g. 'icewarden'
  player_id       text references players(id) on delete set null,
  name            text not null,
  power           text not null default '0',
  march           text not null default '0',
  furnace         integer not null default 1,
  rally_lead      boolean not null default true,
  snow_ape_level  integer not null default 1 check (snow_ape_level between 1 and 10),
  troops          jsonb not null default '{}'::jsonb,
  rally           jsonb not null default '{}'::jsonb,
  heroes          jsonb not null default '{}'::jsonb,
  created_at      timestamptz not null default now(),
  updated_at      timestamptz not null default now()
);

-- ---------------------------------------------------------------------------
-- events (Event Management admin page + sidebar)
-- ---------------------------------------------------------------------------
create table if not exists events (
  id         text primary key,
  tag        text not null,                 -- SVS / TAL / FDT / ...
  name       text not null,
  period     text not null,
  stage      text not null,                 -- "Survey ongoing", "Strategy meeting", ...
  status     text not null
             check (status in ('unregistered','registered','published')),
  finished   boolean not null default false,
  created_at timestamptz not null default now()
);

-- ---------------------------------------------------------------------------
-- updated_at trigger for accounts
-- ---------------------------------------------------------------------------
create or replace function set_updated_at()
returns trigger as $$
begin
  new.updated_at = now();
  return new;
end;
$$ language plpgsql;

drop trigger if exists accounts_set_updated_at on accounts;
create trigger accounts_set_updated_at
  before update on accounts
  for each row execute function set_updated_at();

-- ---------------------------------------------------------------------------
-- Row Level Security
--
-- These policies are intentionally permissive (any authenticated user can
-- read/write everything) since this is an internal alliance tool, not a
-- multi-tenant public product. Tighten these before exposing the project
-- beyond a trusted group - e.g. restrict writes on `players`/`events` to
-- rows where the caller's own player record has permission = 'Admin'.
-- ---------------------------------------------------------------------------
alter table alliances enable row level security;
alter table players   enable row level security;
alter table accounts  enable row level security;
alter table events    enable row level security;

create policy "alliances: read for authenticated" on alliances
  for select using (auth.role() = 'authenticated');
create policy "alliances: write for authenticated" on alliances
  for all using (auth.role() = 'authenticated') with check (auth.role() = 'authenticated');

create policy "players: read for authenticated" on players
  for select using (auth.role() = 'authenticated');
create policy "players: write for authenticated" on players
  for all using (auth.role() = 'authenticated') with check (auth.role() = 'authenticated');

create policy "accounts: read for authenticated" on accounts
  for select using (auth.role() = 'authenticated');
create policy "accounts: write for authenticated" on accounts
  for all using (auth.role() = 'authenticated') with check (auth.role() = 'authenticated');

create policy "events: read for authenticated" on events
  for select using (auth.role() = 'authenticated');
create policy "events: write for authenticated" on events
  for all using (auth.role() = 'authenticated') with check (auth.role() = 'authenticated');
