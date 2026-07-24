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
  -- Each player ID that can log in has its OWN auth user (Supabase Auth has
  -- one email per user, and each ID maps to its own synthetic email - see
  -- toSyntheticEmail in utils.js), even when several IDs belong to the same
  -- real person and share a password. Null means this player ID has no
  -- password yet (e.g. an admin added the record, or another player added
  -- it as an alt without claiming it).
  auth_user_id     uuid references auth.users(id) on delete set null,
  -- Groups a person's own player IDs together, since auth_user_id can't:
  -- the ID they first registered/claimed with is its own owner (null here),
  -- and every alt they subsequently add points back at that root ID. Used
  -- to scope the sidebar's account list to "my accounts" after login.
  owner_player_id  text references players(id) on delete set null,
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
  furnace         text not null default '1', -- e.g. '30', '30-4' (some furnace tiers include a letter/dash suffix)
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

-- Public read: tags/colors carry no sensitive info, and the registration
-- form needs to populate an alliance picker before the visitor has logged
-- in at all.
create policy "alliances: public read" on alliances
  for select using (true);
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

-- ---------------------------------------------------------------------------
-- Registration status check, callable before login
--
-- The login/registration screen needs to know, for a given player ID typed
-- by a not-yet-authenticated visitor: does it exist, and is it already
-- linked to a password? Rather than opening `players`/`accounts` to
-- anonymous reads, this single security-definer function (owned by the
-- table owner, so it bypasses RLS internally) answers just that question -
-- direct table access stays authenticated-only exactly as above.
--
-- Returns one of:
--   {status: 'not_found'}
--   {status: 'linked'}                         -- no player/account data leaked
--   {status: 'unlinked', player: {...}, account: {...} | null}
-- ---------------------------------------------------------------------------
create or replace function get_player_registration_status(p_id text)
returns jsonb
language plpgsql
security definer
set search_path = public
as $$
declare
  v_player  players%rowtype;
  v_account accounts%rowtype;
begin
  select * into v_player from players where id = p_id;

  if not found then
    return jsonb_build_object('status', 'not_found');
  end if;

  if v_player.auth_user_id is not null then
    return jsonb_build_object('status', 'linked');
  end if;

  select * into v_account from accounts where player_id = p_id limit 1;

  return jsonb_build_object(
    'status', 'unlinked',
    'player', jsonb_build_object(
      'id', v_player.id,
      'name', v_player.name,
      'alliance_tag', v_player.alliance_tag,
      'permission', v_player.permission,
      'roles', v_player.roles
    ),
    'account', case when found then to_jsonb(v_account) else null end
  );
end;
$$;

grant execute on function get_player_registration_status(text) to anon, authenticated;
