-- Demo Day · schema
--
-- Público (anon): lê evento, blocos, startups e jurados; entra só com um e-mail
-- cadastrado em `attendees` e grava avaliações por funções SECURITY DEFINER que
-- recebem o token de sessão. Nunca lê `attendees`, `ratings` nem as sessões.
-- Admin: usuário do Supabase Auth cujo e-mail está em `admins`; acesso total via RLS.

-- ───────────────────────── tabelas ─────────────────────────

create table public.event_settings (
  id smallint primary key default 1 check (id = 1),
  name text not null default 'Demo Day',
  tagline text not null default 'Acompanhe a ordem dos pitchs, avalie as startups e sinalize seu interesse.',
  voting_open boolean not null default true,
  updated_at timestamptz not null default now()
);

create table public.categories (
  id text primary key check (id ~ '^[a-z0-9_-]+$'),
  name text not null,
  position int not null default 0,
  slots int not null default 1 check (slots between 0 and 50)
);

create table public.startups (
  id uuid primary key default gen_random_uuid(),
  category_id text not null references public.categories(id) on update cascade,
  position int not null check (position >= 1),
  name text not null check (btrim(name) <> ''),
  tagline text not null default '',
  summary text not null default '',
  logo_url text,
  founders jsonb not null default '[]'::jsonb check (jsonb_typeof(founders) = 'array'),
  created_at timestamptz not null default now(),
  unique (category_id, position)
);

create table public.jurors (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  role text not null default '',
  photo_url text,
  position int not null default 0
);

create table public.attendees (
  id uuid primary key default gen_random_uuid(),
  email text not null unique check (email = lower(btrim(email)) and email ~ '^[^\s@]+@[^\s@]+\.[^\s@]+$'),
  name text,
  company text,
  created_at timestamptz not null default now(),
  last_login_at timestamptz
);

create table public.attendee_sessions (
  token uuid primary key default gen_random_uuid(),
  attendee_id uuid not null references public.attendees(id) on delete cascade,
  created_at timestamptz not null default now()
);
create index attendee_sessions_attendee_idx on public.attendee_sessions(attendee_id);

-- Interesses de conexão: invest · biz · partner · mentor · news
create table public.ratings (
  attendee_id uuid not null references public.attendees(id) on delete cascade,
  startup_id uuid not null references public.startups(id) on delete cascade,
  score smallint check (score between 1 and 5),
  interests text[] not null default '{}'
    check (interests <@ array['invest','biz','partner','mentor','news']::text[]),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  primary key (attendee_id, startup_id),
  check (score is not null or cardinality(interests) > 0)
);
create index ratings_startup_idx on public.ratings(startup_id);

create table public.admins (
  email text primary key check (email = lower(btrim(email)))
);

insert into public.event_settings (id, name) values (1, 'Demo Day 2026.2');

-- ───────────────────────── funções ─────────────────────────

create function public.is_admin() returns boolean
language sql stable security definer set search_path = public as $$
  select exists (
    select 1 from public.admins
    where email = lower(coalesce(auth.jwt() ->> 'email', ''))
  );
$$;

-- Resolve o token de sessão do público; erro se inválido (ex.: e-mail removido).
create function public._attendee_from_token(p_token uuid) returns uuid
language plpgsql stable security definer set search_path = public as $$
declare v uuid;
begin
  select attendee_id into v from public.attendee_sessions where token = p_token;
  if v is null then
    raise exception 'invalid_session' using errcode = 'P0001';
  end if;
  return v;
end $$;

create function public.attendee_login(p_email text) returns json
language plpgsql volatile security definer set search_path = public as $$
declare
  a public.attendees;
  t uuid;
begin
  select * into a from public.attendees where email = lower(btrim(coalesce(p_email, '')));
  if not found then
    raise exception 'not_registered' using errcode = 'P0001';
  end if;
  insert into public.attendee_sessions (attendee_id) values (a.id) returning token into t;
  update public.attendees set last_login_at = now() where id = a.id;
  return json_build_object('token', t, 'email', a.email, 'name', a.name);
end $$;

create function public.attendee_my_ratings(p_token uuid)
returns table (startup_id uuid, score smallint, interests text[], updated_at timestamptz)
language sql stable security definer set search_path = public as $$
  select r.startup_id, r.score, r.interests, r.updated_at
  from public.ratings r
  where r.attendee_id = public._attendee_from_token(p_token);
$$;

create function public.attendee_submit_rating(
  p_token uuid, p_startup_id uuid, p_score smallint, p_interests text[]
) returns void
language plpgsql volatile security definer set search_path = public as $$
declare
  v_attendee uuid := public._attendee_from_token(p_token);
  v_interests text[];
begin
  if not (select voting_open from public.event_settings where id = 1) then
    raise exception 'voting_closed' using errcode = 'P0001';
  end if;
  select coalesce(array_agg(distinct i order by i), '{}') into v_interests
  from unnest(coalesce(p_interests, '{}')) as i;

  insert into public.ratings as r (attendee_id, startup_id, score, interests)
  values (v_attendee, p_startup_id, p_score, v_interests)
  on conflict (attendee_id, startup_id) do update
    set score = excluded.score, interests = excluded.interests, updated_at = now();
end $$;

revoke all on function public._attendee_from_token(uuid) from public;
revoke all on function public.attendee_login(text) from public;
revoke all on function public.attendee_my_ratings(uuid) from public;
revoke all on function public.attendee_submit_rating(uuid, uuid, smallint, text[]) from public;
revoke all on function public.is_admin() from public;
grant execute on function public.attendee_login(text) to anon, authenticated;
grant execute on function public.attendee_my_ratings(uuid) to anon, authenticated;
grant execute on function public.attendee_submit_rating(uuid, uuid, smallint, text[]) to anon, authenticated;
grant execute on function public.is_admin() to anon, authenticated;

-- ───────────────────────── RLS ─────────────────────────

alter table public.event_settings enable row level security;
alter table public.categories enable row level security;
alter table public.startups enable row level security;
alter table public.jurors enable row level security;
alter table public.attendees enable row level security;
alter table public.attendee_sessions enable row level security;
alter table public.ratings enable row level security;
alter table public.admins enable row level security;

-- Conteúdo do evento: leitura pública, escrita só do admin.
create policy "public read" on public.event_settings for select to anon, authenticated using (true);
create policy "public read" on public.categories for select to anon, authenticated using (true);
create policy "public read" on public.startups for select to anon, authenticated using (true);
create policy "public read" on public.jurors for select to anon, authenticated using (true);

create policy "admin write" on public.event_settings for all to authenticated using (public.is_admin()) with check (public.is_admin());
create policy "admin write" on public.categories for all to authenticated using (public.is_admin()) with check (public.is_admin());
create policy "admin write" on public.startups for all to authenticated using (public.is_admin()) with check (public.is_admin());
create policy "admin write" on public.jurors for all to authenticated using (public.is_admin()) with check (public.is_admin());

-- Dados pessoais e respostas: só admin. Sessões: nenhuma policy (só via funções).
create policy "admin all" on public.attendees for all to authenticated using (public.is_admin()) with check (public.is_admin());
create policy "admin all" on public.ratings for all to authenticated using (public.is_admin()) with check (public.is_admin());
create policy "admin read" on public.admins for select to authenticated using (public.is_admin());
