-- Demo Day · app do público + painel admin (repo linkventurestech/Demo-Day)
--
-- Vive no mesmo projeto do portfolio, com tudo prefixado por `demoday_app_`
-- para não encostar em nada existente (inclusive o módulo `demoday_*` de inscrição
-- de startups). Não altera nenhum objeto do portfolio.
--
-- Público (anon): lê evento, blocos, startups e jurados; entra só com um e-mail
-- em `demoday_app_attendees` e grava avaliações por funções SECURITY DEFINER que
-- recebem o token de sessão. Nunca lê inscritos, respostas nem sessões.
-- Admin: quem já é admin ou link_staff no portfolio (public.user_roles).

-- ───────────────────────── tabelas ─────────────────────────

create table public.demoday_app_settings (
  id smallint primary key default 1 check (id = 1),
  name text not null default 'Demo Day',
  tagline text not null default 'Acompanhe a ordem dos pitchs, avalie as startups e sinalize seu interesse.',
  voting_open boolean not null default true,
  updated_at timestamptz not null default now()
);
comment on table public.demoday_app_settings is 'Demo Day app: configuração do evento (linha única). Leitura pública; escrita admin/link_staff.';

create table public.demoday_app_blocks (
  id text primary key check (id ~ '^[a-z0-9_-]+$'),
  name text not null,
  position int not null default 0,
  slots int not null default 1 check (slots between 0 and 50)
);
comment on table public.demoday_app_blocks is 'Demo Day app: blocos da ordem dos pitchs (Inspiration, Startup School...). slots = posições exibidas, vazias = "A definir".';

create table public.demoday_app_startups (
  id uuid primary key default gen_random_uuid(),
  block_id text not null references public.demoday_app_blocks(id) on update cascade,
  position int not null check (position >= 1),
  name text not null check (btrim(name) <> ''),
  tagline text not null default '',
  summary text not null default '',
  logo_url text,
  founders jsonb not null default '[]'::jsonb check (jsonb_typeof(founders) = 'array'),
  created_at timestamptz not null default now(),
  unique (block_id, position)
);
comment on table public.demoday_app_startups is 'Demo Day app: startups que fazem pitch, na posição do bloco. Leitura pública.';

create table public.demoday_app_jurors (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  role text not null default '',
  photo_url text,
  position int not null default 0
);
comment on table public.demoday_app_jurors is 'Demo Day app: jurados exibidos no app do público.';

create table public.demoday_app_attendees (
  id uuid primary key default gen_random_uuid(),
  email text not null unique check (email = lower(btrim(email)) and email ~ '^[^\s@]+@[^\s@]+\.[^\s@]+$'),
  name text,
  company text,
  created_at timestamptz not null default now(),
  last_login_at timestamptz
);
comment on table public.demoday_app_attendees is 'Demo Day app: e-mails liberados para entrar no app do público (PII). RLS admin/link_staff.';

create table public.demoday_app_sessions (
  token uuid primary key default gen_random_uuid(),
  attendee_id uuid not null references public.demoday_app_attendees(id) on delete cascade,
  created_at timestamptz not null default now()
);
create index demoday_app_sessions_attendee_idx on public.demoday_app_sessions(attendee_id);
comment on table public.demoday_app_sessions is 'Demo Day app: tokens de sessão do público. Sem policies: acesso só pelas funções demoday_app_*.';

-- Interesses de conexão: invest · biz · partner · mentor · news
create table public.demoday_app_ratings (
  attendee_id uuid not null references public.demoday_app_attendees(id) on delete cascade,
  startup_id uuid not null references public.demoday_app_startups(id) on delete cascade,
  score smallint check (score between 1 and 5),
  interests text[] not null default '{}'
    check (interests <@ array['invest','biz','partner','mentor','news']::text[]),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  primary key (attendee_id, startup_id),
  check (score is not null or cardinality(interests) > 0)
);
create index demoday_app_ratings_startup_idx on public.demoday_app_ratings(startup_id);
comment on table public.demoday_app_ratings is 'Demo Day app: nota (1-5) e interesses de conexão por pessoa × startup. RLS admin/link_staff; escrita do público via demoday_app_submit_rating.';

insert into public.demoday_app_settings (id, name) values (1, 'Demo Day 2026.2');

-- ───────────────────────── funções ─────────────────────────

create function public.demoday_app_is_admin() returns boolean
language sql stable security definer set search_path = public as $$
  select exists (
    select 1 from public.user_roles
    where user_id = auth.uid() and role in ('admin', 'link_staff')
  );
$$;

-- Resolve o token de sessão do público; erro se inválido (ex.: e-mail removido).
create function public._demoday_app_attendee(p_token uuid) returns uuid
language plpgsql stable security definer set search_path = public as $$
declare v uuid;
begin
  select attendee_id into v from public.demoday_app_sessions where token = p_token;
  if v is null then
    raise exception 'invalid_session' using errcode = 'P0001';
  end if;
  return v;
end $$;

create function public.demoday_app_login(p_email text) returns json
language plpgsql volatile security definer set search_path = public as $$
declare
  a public.demoday_app_attendees;
  t uuid;
begin
  select * into a from public.demoday_app_attendees where email = lower(btrim(coalesce(p_email, '')));
  if not found then
    raise exception 'not_registered' using errcode = 'P0001';
  end if;
  insert into public.demoday_app_sessions (attendee_id) values (a.id) returning token into t;
  update public.demoday_app_attendees set last_login_at = now() where id = a.id;
  return json_build_object('token', t, 'email', a.email, 'name', a.name);
end $$;

create function public.demoday_app_my_ratings(p_token uuid)
returns table (startup_id uuid, score smallint, interests text[], updated_at timestamptz)
language sql stable security definer set search_path = public as $$
  select r.startup_id, r.score, r.interests, r.updated_at
  from public.demoday_app_ratings r
  where r.attendee_id = public._demoday_app_attendee(p_token);
$$;

create function public.demoday_app_submit_rating(
  p_token uuid, p_startup_id uuid, p_score smallint, p_interests text[]
) returns void
language plpgsql volatile security definer set search_path = public as $$
declare
  v_attendee uuid := public._demoday_app_attendee(p_token);
  v_interests text[];
begin
  if not (select voting_open from public.demoday_app_settings where id = 1) then
    raise exception 'voting_closed' using errcode = 'P0001';
  end if;
  select coalesce(array_agg(distinct i order by i), '{}') into v_interests
  from unnest(coalesce(p_interests, '{}')) as i;

  insert into public.demoday_app_ratings as r (attendee_id, startup_id, score, interests)
  values (v_attendee, p_startup_id, p_score, v_interests)
  on conflict (attendee_id, startup_id) do update
    set score = excluded.score, interests = excluded.interests, updated_at = now();
end $$;

revoke all on function public._demoday_app_attendee(uuid) from public, anon, authenticated;
revoke all on function public.demoday_app_login(text) from public;
revoke all on function public.demoday_app_my_ratings(uuid) from public;
revoke all on function public.demoday_app_submit_rating(uuid, uuid, smallint, text[]) from public;
revoke all on function public.demoday_app_is_admin() from public;
grant execute on function public.demoday_app_login(text) to anon, authenticated;
grant execute on function public.demoday_app_my_ratings(uuid) to anon, authenticated;
grant execute on function public.demoday_app_submit_rating(uuid, uuid, smallint, text[]) to anon, authenticated;
grant execute on function public.demoday_app_is_admin() to authenticated;

-- ───────────────────────── RLS ─────────────────────────

alter table public.demoday_app_settings enable row level security;
alter table public.demoday_app_blocks enable row level security;
alter table public.demoday_app_startups enable row level security;
alter table public.demoday_app_jurors enable row level security;
alter table public.demoday_app_attendees enable row level security;
alter table public.demoday_app_sessions enable row level security;
alter table public.demoday_app_ratings enable row level security;

-- Conteúdo do evento: leitura pública, escrita só da equipe.
create policy "demoday_app public read" on public.demoday_app_settings for select to anon, authenticated using (true);
create policy "demoday_app public read" on public.demoday_app_blocks for select to anon, authenticated using (true);
create policy "demoday_app public read" on public.demoday_app_startups for select to anon, authenticated using (true);
create policy "demoday_app public read" on public.demoday_app_jurors for select to anon, authenticated using (true);

create policy "demoday_app staff write" on public.demoday_app_settings for all to authenticated using (public.demoday_app_is_admin()) with check (public.demoday_app_is_admin());
create policy "demoday_app staff write" on public.demoday_app_blocks for all to authenticated using (public.demoday_app_is_admin()) with check (public.demoday_app_is_admin());
create policy "demoday_app staff write" on public.demoday_app_startups for all to authenticated using (public.demoday_app_is_admin()) with check (public.demoday_app_is_admin());
create policy "demoday_app staff write" on public.demoday_app_jurors for all to authenticated using (public.demoday_app_is_admin()) with check (public.demoday_app_is_admin());

-- Dados pessoais e respostas: só equipe. Sessões: nenhuma policy (só via funções).
create policy "demoday_app staff all" on public.demoday_app_attendees for all to authenticated using (public.demoday_app_is_admin()) with check (public.demoday_app_is_admin());
create policy "demoday_app staff all" on public.demoday_app_ratings for all to authenticated using (public.demoday_app_is_admin()) with check (public.demoday_app_is_admin());
