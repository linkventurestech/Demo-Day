-- Demo Day · jurados puxados do portfolio
-- Os jurados do app passam a poder vir da edição do Demo Day cadastrada no portfolio
-- (public.demoday_juror, só os publicados). A edição fica em demoday_app_settings.
-- Nome, empresa e foto vêm sempre do sistema; cargo e descrição vêm do sistema quando
-- preenchidos lá, senão fica o que foi escrito no painel do Demo Day.
-- Aditivo: nenhuma tabela, policy ou função do portfolio muda; só leitura dele.

alter table public.demoday_app_jurors
  add column company text not null default '',
  add column bio text not null default '',
  add column linkedin_url text,
  add column portfolio_juror_id uuid references public.demoday_juror(id) on delete set null;

create unique index demoday_app_jurors_portfolio_juror_key
  on public.demoday_app_jurors (portfolio_juror_id) where portfolio_juror_id is not null;

alter table public.demoday_app_settings
  add column portfolio_edition text not null default '2026.2';

comment on column public.demoday_app_jurors.portfolio_juror_id is
  'Demo Day app: jurado no portfolio (demoday_juror) de onde vêm nome, empresa, foto, cargo e bio.';
comment on column public.demoday_app_settings.portfolio_edition is
  'Demo Day app: código da edição em demoday_edition de onde vêm os jurados.';

-- Interna: sem checagem de papel.
create function public._demoday_app_sync_jurors() returns int
language plpgsql volatile security definer set search_path = public as $$
declare
  v_code text := (select portfolio_edition from public.demoday_app_settings where id = 1);
  n int;
begin
  -- Sai quem deixou de estar publicado na edição.
  delete from public.demoday_app_jurors a
  where a.portfolio_juror_id is not null
    and not exists (
      select 1 from public.demoday_juror j join public.demoday_edition e on e.id = j.edition_id
      where j.id = a.portfolio_juror_id and e.code = v_code and j.is_published);

  insert into public.demoday_app_jurors as a
    (portfolio_juror_id, name, role, company, bio, photo_url, linkedin_url, position)
  select j.id, btrim(j.name), coalesce(btrim(j.role), ''), coalesce(btrim(j.company), ''),
         coalesce(btrim(j.bio), ''), nullif(btrim(j.photo_url), ''), nullif(btrim(j.linkedin_url), ''),
         coalesce(j.display_order, 0)
  from public.demoday_juror j join public.demoday_edition e on e.id = j.edition_id
  where e.code = v_code and j.is_published
  on conflict (portfolio_juror_id) where portfolio_juror_id is not null do update set
    name = excluded.name,
    company = excluded.company,
    photo_url = coalesce(excluded.photo_url, a.photo_url),
    linkedin_url = coalesce(excluded.linkedin_url, a.linkedin_url),
    role = coalesce(nullif(excluded.role, ''), a.role),
    bio = coalesce(nullif(excluded.bio, ''), a.bio),
    position = excluded.position;
  get diagnostics n = row_count;
  return n;
end $$;

-- Painel: "Atualizar do sistema" na página Jurados.
create function public.demoday_app_sync_jurors_from_portfolio() returns int
language plpgsql volatile security definer set search_path = public as $$
begin
  if not public.demoday_app_is_admin() then
    raise exception 'not_admin' using errcode = 'P0001';
  end if;
  return public._demoday_app_sync_jurors();
end $$;

revoke all on function public._demoday_app_sync_jurors() from public, anon, authenticated;
revoke all on function public.demoday_app_sync_jurors_from_portfolio() from public, anon;
grant execute on function public.demoday_app_sync_jurors_from_portfolio() to authenticated;
