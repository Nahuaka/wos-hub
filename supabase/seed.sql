-- Optional seed data - mirrors the demo data the original prototype shipped
-- with. Safe to run once after schema.sql. Re-running is idempotent thanks
-- to `on conflict do nothing`.

insert into alliances (tag, color) values
  ('FLG', '#3ddc97'),
  ('WNT', '#6c9bff'),
  ('TDR', '#ff9d42')
on conflict (tag) do nothing;

insert into players (id, name, alliance_tag, permission, roles) values
  ('80472391', 'IceWarden',  'FLG', 'Admin',          '["rally-lead"]'::jsonb),
  ('80472455', 'FrostByte',  'FLG', 'Team Maker',     '["potential-rally-lead","gather"]'::jsonb),
  ('80471902', 'Snowclaw',   'FLG', 'Battle Strat',   '["joiner"]'::jsonb),
  ('80473310', 'Glacia',     'FLG', 'Player Manager', '[]'::jsonb),
  ('80469981', 'Blizzard',   'WNT', 'Players',        '["looter"]'::jsonb),
  ('80470244', 'Permafrost', 'WNT', 'Players',        '[]'::jsonb),
  ('80468120', 'Thundrix',   'TDR', 'Battle Strat',   '["gather"]'::jsonb)
on conflict (id) do nothing;

insert into accounts (key, player_id, name, power, march, furnace, rally_lead, snow_ape_level, troops, rally, heroes) values
(
  'icewarden', '80472391', '[FLG] ICEWARDEN', '142.8M', '250,000', '30', true, 1,
  '{
    "infantry": {"fc": "FC1", "tier": "T11", "skill": 0},
    "lancer":   {"fc": "FC1", "tier": "T11", "skill": 0},
    "marksman": {"fc": "FC1", "tier": "T11", "skill": 0}
  }'::jsonb,
  '{
    "rallyCap": "2,800,000", "islandScore": "125,000",
    "petPower": "0", "expertPower": "0", "techPower": "0",
    "petLevels": {
      "titanRoc": 1, "snowLeopard": 1, "caveLion": 1, "ironRhino": 1,
      "sabertoothTiger": 1, "mammoth": 1, "frostGorilla": 1, "frostscaleChameleon": 1
    },
    "expert": {"romulus": 1, "fabian": 1, "valeria": 1},
    "gear": {"chiefMaxed": false, "heroMaxed": false, "maxSquad": 0},
    "charmLevels": {
      "Hat": {"left": 1, "top": 1, "right": 1}, "Watch": {"left": 1, "top": 1, "right": 1},
      "Coat": {"left": 1, "top": 1, "right": 1}, "Pants": {"left": 1, "top": 1, "right": 1},
      "Ring": {"left": 1, "top": 1, "right": 1}, "Cudgel": {"left": 1, "top": 1, "right": 1}
    }
  }'::jsonb,
  '{}'::jsonb
),
(
  'frostbyte', '80472455', '[FLG] FROSTBYTE', '98.4M', '180,000', '25', true, 1,
  '{
    "infantry": {"fc": "FC1", "tier": "T11", "skill": 0},
    "lancer":   {"fc": "FC1", "tier": "T11", "skill": 0},
    "marksman": {"fc": "FC1", "tier": "T11", "skill": 0}
  }'::jsonb,
  '{
    "rallyCap": "1,200,000", "islandScore": "64,000",
    "petPower": "0", "expertPower": "0", "techPower": "0",
    "petLevels": {
      "titanRoc": 1, "snowLeopard": 1, "caveLion": 1, "ironRhino": 1,
      "sabertoothTiger": 1, "mammoth": 1, "frostGorilla": 1, "frostscaleChameleon": 1
    },
    "expert": {"romulus": 1, "fabian": 1, "valeria": 1},
    "gear": {"chiefMaxed": false, "heroMaxed": false, "maxSquad": 0},
    "charmLevels": {
      "Hat": {"left": 1, "top": 1, "right": 1}, "Watch": {"left": 1, "top": 1, "right": 1},
      "Coat": {"left": 1, "top": 1, "right": 1}, "Pants": {"left": 1, "top": 1, "right": 1},
      "Ring": {"left": 1, "top": 1, "right": 1}, "Cudgel": {"left": 1, "top": 1, "right": 1}
    }
  }'::jsonb,
  '{}'::jsonb
)
on conflict (key) do nothing;

insert into events (id, tag, name, period, stage, status, finished) values
  ('tal-event',    'TAL', 'TAL Event',    'Ongoing',         'Survey ongoing',   'unregistered', false),
  ('polar-hunt',   'FDT', 'Polar Hunt',   'Jul 8',           'Strategy meeting', 'registered',   false),
  ('frozen-fort',  'SVS', 'Frozen Fort',  'Jun 30',          'Team sent',        'published',    false),
  ('winter-siege', 'SVS', 'Winter Siege', 'May 12 - May 19', 'Team sent',        'published',    true)
on conflict (id) do nothing;
