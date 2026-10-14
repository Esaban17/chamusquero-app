-- penalitosGT: esquema del juego de penales (Postgres en Neon).
-- La web crea cuentas y lee la tabla; el progreso solo lo escribe el servidor de partidas.
-- Se puede aplicar varias veces: todo es "if not exists".

create table if not exists accounts (
  id uuid primary key default gen_random_uuid(),
  email text not null unique check (email = lower(email)),
  password_hash text not null,
  -- Freno a quien adivina contraseñas: 5 intentos fallidos bloquean la cuenta 15 minutos.
  failed_logins smallint not null default 0,
  locked_until timestamptz,
  created_at timestamptz not null default now()
);

create table if not exists profiles (
  id uuid primary key references accounts (id) on delete cascade,
  username text not null check (char_length(username) between 1 and 24),
  favorite_team_id text,
  division text not null default 'tercera'
    check (division in ('tercera', 'segunda', 'primera', 'liga-nacional')),
  season_wins smallint not null default 0,
  season_losses smallint not null default 0,
  titles integer not null default 0,
  wins integer not null default 0,
  losses integer not null default 0,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists matches (
  id uuid primary key default gen_random_uuid(),
  division text not null,
  player_a uuid references profiles (id) on delete set null,
  player_b uuid references profiles (id) on delete set null,
  team_a text not null,
  team_b text not null,
  score_a smallint not null,
  score_b smallint not null,
  winner smallint not null check (winner in (0, 1)),
  reason text not null check (reason in ('shootout', 'forfeit')),
  created_at timestamptz not null default now()
);

create index if not exists matches_player_a_idx on matches (player_a, created_at desc);
create index if not exists matches_player_b_idx on matches (player_b, created_at desc);
-- La tabla de cada liga: por división, ordenada por la temporada en curso.
create index if not exists profiles_league_idx on profiles (division, season_wins desc, wins desc);
