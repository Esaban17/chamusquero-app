-- Chamusqueros: esquema inicial del juego de penales.
-- Solo el servidor de partidas escribe (con la clave secreta, que salta RLS).
-- La web y cualquier cliente solo pueden leer.

create table public.profiles (
  id uuid primary key references auth.users (id) on delete cascade,
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

create table public.matches (
  id uuid primary key default gen_random_uuid(),
  division text not null,
  player_a uuid references public.profiles (id) on delete set null,
  player_b uuid references public.profiles (id) on delete set null,
  team_a text not null,
  team_b text not null,
  score_a smallint not null,
  score_b smallint not null,
  winner smallint not null check (winner in (0, 1)),
  reason text not null check (reason in ('shootout', 'forfeit')),
  created_at timestamptz not null default now()
);

create index matches_player_a_idx on public.matches (player_a, created_at desc);
create index matches_player_b_idx on public.matches (player_b, created_at desc);
create index profiles_ranking_idx on public.profiles (titles desc, wins desc);

-- Crear el perfil al registrarse, con el nombre antes de la arroba.
create function public.handle_new_user()
returns trigger
language plpgsql
security definer set search_path = ''
as $$
begin
  insert into public.profiles (id, username)
  values (new.id, left(coalesce(new.raw_user_meta_data ->> 'username', split_part(new.email, '@', 1), 'Jugador'), 24))
  on conflict (id) do nothing;
  return new;
end;
$$;

create trigger on_auth_user_created
  after insert on auth.users
  for each row execute function public.handle_new_user();

-- Guardar el progreso de una temporada y sumar al historial en una sola operación.
create function public.save_progress(
  p_user_id uuid,
  p_division text,
  p_season_wins smallint,
  p_season_losses smallint,
  p_titles integer,
  p_won boolean
)
returns void
language sql
security definer set search_path = ''
as $$
  update public.profiles set
    division = p_division,
    season_wins = p_season_wins,
    season_losses = p_season_losses,
    titles = p_titles,
    wins = wins + case when p_won then 1 else 0 end,
    losses = losses + case when p_won then 0 else 1 end,
    updated_at = now()
  where id = p_user_id;
$$;

revoke execute on function public.save_progress from public, anon, authenticated;

alter table public.profiles enable row level security;
alter table public.matches enable row level security;

create policy "Perfiles visibles para todos" on public.profiles for select using (true);
create policy "Partidas visibles para todos" on public.matches for select using (true);
