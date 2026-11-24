-- Demo Day · sincronização das startups: logo removido no portfolio sai também do Demo Day.
-- Antes, se a empresa ficava sem logo no portfolio, o Demo Day mantinha o link antigo do
-- bucket company-logos, que passa a dar erro. Agora esse link é limpo; um logo enviado pelo
-- painel do Demo Day (data URL ou outro endereço) continua.

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

revoke all on function public._demoday_app_sync(uuid) from public, anon, authenticated;
