-- Demo Day · nome de exibição de founders
-- O app mostra o founder pelo nome do portfolio (primeiro nome + último sobrenome). Quando o time
-- quer outro nome só no Demo Day, ele fica aqui e a sincronização usa este no lugar do do portfolio.
-- Aditivo: o cadastro da pessoa no portfolio não muda.

create table public.demoday_app_founder_names (
  person_id uuid primary key references public.people(id) on delete cascade,
  display_name text not null check (btrim(display_name) <> ''),
  updated_at timestamptz not null default now()
);
alter table public.demoday_app_founder_names enable row level security;
create policy "demoday_app staff all" on public.demoday_app_founder_names for all to authenticated
  using (public.demoday_app_is_admin()) with check (public.demoday_app_is_admin());
comment on table public.demoday_app_founder_names is
  'Demo Day app: nome com que o founder aparece no app, no lugar do nome do portfolio.';

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
               'name', coalesce(btrim(o.display_name), btrim(p.full_name)),
               'role', coalesce(nullif(btrim(cp.role_title), ''), nullif(btrim(cp.role_type), ''), 'Founder'),
               'photo_url', nullif(btrim(p.photo_url), ''))
             order by (cp.role_type = 'Founder') desc, cp.is_founder desc, p.full_name)
      from public.company_people cp
      join public.people p on p.id = cp.person_id
      left join public.demoday_app_founder_names o on o.person_id = p.id
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

-- Dressy: Gabriela aparece como "Gabriela Robatine" (no portfolio: Gabriela Mascarenhas Robatine Vital).
insert into public.demoday_app_founder_names (person_id, display_name)
values ('2f49e40f-f761-4c4a-8d53-ac7ceaa10ebc', 'Gabriela Robatine')
on conflict (person_id) do update set display_name = excluded.display_name, updated_at = now();

select public._demoday_app_sync(s.id) from public.demoday_app_startups s
where s.portfolio_company_id = 'db088e2e-57d2-4b55-af97-d42203bd6633';
