create table if not exists events (
  id uuid primary key default gen_random_uuid(),
  sport text not null,
  name text not null,
  question text not null,
  question_options jsonb not null,
  market_start_price numeric,
  market_close_price numeric,
  outcome_option text,
  locks_at timestamptz not null,
  reveal_generated boolean default false,
  created_at timestamptz default now()
);

create table if not exists odds_snapshots (
  id uuid primary key default gen_random_uuid(),
  event_id uuid references events(id) on delete cascade,
  price numeric not null,
  captured_at timestamptz default now()
);

create table if not exists predictions (
  id uuid primary key default gen_random_uuid(),
  event_id uuid references events(id) on delete cascade,
  user_id uuid not null,
  squad_id uuid,
  choice text not null,
  created_at timestamptz default now(),
  unique (event_id, user_id)
);

create table if not exists squads (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  invite_code text unique not null,
  created_by uuid not null,
  created_at timestamptz default now()
);

create table if not exists squad_members (
  squad_id uuid references squads(id) on delete cascade,
  user_id uuid not null,
  joined_at timestamptz default now(),
  primary key (squad_id, user_id)
);

create table if not exists reveals (
  id uuid primary key default gen_random_uuid(),
  event_id uuid references events(id) on delete cascade,
  script_text text not null,
  audio_url text,
  crowd_accuracy_pct numeric,
  created_at timestamptz default now()
);

create index if not exists idx_predictions_event on predictions(event_id);
create index if not exists idx_odds_event on odds_snapshots(event_id);
