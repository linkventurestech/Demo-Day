-- Demo Day · startups ligadas ao portfolio
-- Cada startup do Demo Day pode apontar para a empresa no portfolio (public.companies).
-- A sincronização copia do portfolio: logo, descrição curta, "setor · estágio" e
-- os founders ativos (nome, cargo e foto). O nome e a posição continuam do Demo Day.
-- Aditivo: nenhuma tabela, policy ou função do portfolio muda; só leitura dele.

alter table public.demoday_app_startups
  add column portfolio_company_id uuid references public.companies(id) on delete set null;

create unique index demoday_app_startups_portfolio_company_key
  on public.demoday_app_startups (portfolio_company_id) where portfolio_company_id is not null;

comment on column public.demoday_app_startups.portfolio_company_id is
  'Demo Day app: empresa no portfolio de onde vêm logo, descrição e founders (demoday_app_sync_from_portfolio).';

-- Interna: sem checagem de papel; só as funções abaixo (e o dono) chamam.
create function public._demoday_app_sync(p_startup_id uuid) returns int
language plpgsql volatile security definer set search_path = public as $$
declare n int;
begin
  update public.demoday_app_startups s set
    logo_url = coalesce(nullif(btrim(c.logo_url), ''), s.logo_url),
    summary = coalesce(nullif(btrim(regexp_replace(c.description_short, '\s+', ' ', 'g')), ''), s.summary),
    tagline = coalesce(nullif(concat_ws(' · ', nullif(btrim(c.main_sector), ''), nullif(btrim(c.stage), '')), ''), s.tagline),
    founders = coalesce((
      select jsonb_agg(jsonb_build_object(
               'name', btrim(p.full_name),
               'role', coalesce(nullif(btrim(cp.role_title), ''), nullif(btrim(cp.role_type), ''), 'Founder'),
               'photo_url', nullif(btrim(p.photo_url), ''))
             order by (cp.role_type = 'Founder') desc, cp.is_founder desc, p.full_name)
      from public.company_people cp
      join public.people p on p.id = cp.person_id
      where cp.company_id = c.id
        and coalesce(cp.is_active, true)
        and (cp.end_date is null or cp.end_date >= current_date)
        and (cp.is_founder or cp.role_title ilike '%founder%')
    ), s.founders)
  from public.companies c
  where c.id = s.portfolio_company_id
    and (p_startup_id is null or s.id = p_startup_id);
  get diagnostics n = row_count;
  return n;
end $$;

-- Painel: "Atualizar do sistema" (uma startup ou todas as ligadas).
create function public.demoday_app_sync_from_portfolio(p_startup_id uuid default null) returns int
language plpgsql volatile security definer set search_path = public as $$
begin
  if not public.demoday_app_is_admin() then
    raise exception 'not_admin' using errcode = 'P0001';
  end if;
  return public._demoday_app_sync(p_startup_id);
end $$;

-- Painel: lista de empresas do portfolio para ligar uma startup.
create function public.demoday_app_portfolio_companies()
returns table (id uuid, name text, has_logo boolean, founders int)
language plpgsql stable security definer set search_path = public as $$
begin
  if not public.demoday_app_is_admin() then
    raise exception 'not_admin' using errcode = 'P0001';
  end if;
  return query
    select c.id, c.name, c.logo_url is not null,
      (select count(*)::int from public.company_people cp
        where cp.company_id = c.id and coalesce(cp.is_active, true)
          and (cp.is_founder or cp.role_title ilike '%founder%'))
    from public.companies c
    order by c.name;
end $$;

revoke all on function public._demoday_app_sync(uuid) from public, anon, authenticated;
revoke all on function public.demoday_app_sync_from_portfolio(uuid) from public, anon;
revoke all on function public.demoday_app_portfolio_companies() from public, anon;
grant execute on function public.demoday_app_sync_from_portfolio(uuid) to authenticated;
grant execute on function public.demoday_app_portfolio_companies() to authenticated;
