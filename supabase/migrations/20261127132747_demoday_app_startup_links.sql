-- Demo Day · site e Instagram das startups; sem a linha "setor · estágio"
-- A página da startup mostra os links do site e do Instagram quando o portfolio tem.
-- A sincronização deixa de escrever "setor · estágio" no tagline, e o que ela tinha escrito sai.
-- Aditivo para o portfolio: só lê companies.website / instagram_url / instagram_handle.

alter table public.demoday_app_startups
  add column website_url text,
  add column instagram_url text;

comment on column public.demoday_app_startups.website_url is 'Demo Day app: site da startup (do portfolio ou do painel).';
comment on column public.demoday_app_startups.instagram_url is 'Demo Day app: Instagram da startup (do portfolio ou do painel).';

-- Completa "dominio.com" com https:// e "@perfil" (ou "perfil.x", sem instagram.com) com o endereço do Instagram.
create function public._demoday_app_url(p text, p_instagram boolean default false) returns text
language sql immutable set search_path = public as $$
  select case
    when nullif(btrim(p), '') is null then null
    when btrim(p) ~* '^https?://' then btrim(p)
    when p_instagram and btrim(p) !~* 'instagram\.com' then 'https://www.instagram.com/' || ltrim(btrim(p), '@') || '/'
    else 'https://' || ltrim(btrim(p), '/')
  end;
$$;

create or replace function public._demoday_app_sync(p_startup_id uuid) returns int
language plpgsql volatile security definer set search_path = public as $$
declare n int;
begin
  update public.demoday_app_startups s set
    logo_url = case
      when nullif(btrim(c.logo_url), '') is not null then btrim(c.logo_url)
      when s.logo_url like '%/storage/v1/object/public/company-logos/%' then null
      else s.logo_url
    end,
    summary = coalesce(nullif(btrim(regexp_replace(c.description_short, '\s+', ' ', 'g')), ''), s.summary),
    website_url = coalesce(public._demoday_app_url(c.website), s.website_url),
    instagram_url = coalesce(public._demoday_app_url(coalesce(nullif(btrim(c.instagram_url), ''), c.instagram_handle), true), s.instagram_url),
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

revoke all on function public._demoday_app_sync(uuid) from public, anon, authenticated;

-- Sai o "setor · estágio" que a sincronização tinha escrito.
update public.demoday_app_startups s set tagline = ''
from public.companies c
where c.id = s.portfolio_company_id
  and s.tagline = concat_ws(' · ', nullif(btrim(c.main_sector), ''), nullif(btrim(c.stage), ''));

select public._demoday_app_sync(null);
