-- Demo Day · confirmação por código no e-mail
-- Entrar no app do público passa a exigir um código de 6 dígitos enviado ao e-mail cadastrado,
-- em cada aparelho novo (a sessão continua salva no aparelho depois de confirmada).
--   1. Edge function demoday-app-send-code chama _demoday_app_issue_code (service_role) e envia
--      o código pelo Resend. O banco guarda só o hash (bcrypt) do código.
--   2. O app chama demoday_app_verify_code(email, código) e recebe o token de sessão.
-- O login só com e-mail (demoday_app_login) deixa de ser chamável pelo público.
-- Aditivo: nada do portfolio muda.

alter table public.demoday_app_attendees add column email_verified_at timestamptz;
comment on column public.demoday_app_attendees.email_verified_at is
  'Demo Day app: primeira vez que a pessoa confirmou um código enviado ao e-mail.';

create table public.demoday_app_login_codes (
  id uuid primary key default gen_random_uuid(),
  attendee_id uuid not null references public.demoday_app_attendees(id) on delete cascade,
  code_hash text not null,
  expires_at timestamptz not null,
  attempts smallint not null default 0,
  used_at timestamptz,
  created_at timestamptz not null default now()
);
create index demoday_app_login_codes_attendee_idx on public.demoday_app_login_codes (attendee_id, created_at desc);
alter table public.demoday_app_login_codes enable row level security;
comment on table public.demoday_app_login_codes is
  'Demo Day app: códigos de confirmação por e-mail (só o hash). Sem policies: acesso só pelas funções.';

-- Gera e guarda um código novo e devolve o código em claro para a edge function enviar.
-- Limites: 1 código a cada 30 s e 5 a cada 15 min por pessoa. Invalida os códigos anteriores.
create function public._demoday_app_issue_code(p_email text)
returns table (code text, attendee_name text, event_name text)
language plpgsql volatile security definer set search_path = public, extensions as $$
declare
  a public.demoday_app_attendees;
  v_code text;
  v_last timestamptz;
  v_recent int;
begin
  select * into a from public.demoday_app_attendees where email = lower(btrim(coalesce(p_email, '')));
  if not found then
    raise exception 'not_registered' using errcode = 'P0001';
  end if;

  select max(created_at), count(*) filter (where created_at > now() - interval '15 minutes')
    into v_last, v_recent
  from public.demoday_app_login_codes where attendee_id = a.id;
  if v_last > now() - interval '30 seconds' or v_recent >= 5 then
    raise exception 'rate_limited' using errcode = 'P0001';
  end if;

  update public.demoday_app_login_codes set used_at = now()
  where attendee_id = a.id and used_at is null;

  v_code := lpad(((('x' || encode(gen_random_bytes(4), 'hex'))::bit(32)::bigint) % 1000000)::text, 6, '0');
  insert into public.demoday_app_login_codes (attendee_id, code_hash, expires_at)
  values (a.id, crypt(v_code, gen_salt('bf', 8)), now() + interval '10 minutes');

  return query select v_code, a.name, (select s.name from public.demoday_app_settings s where s.id = 1);
end $$;

-- Confere o código e abre a sessão. Até 5 tentativas por código; vale por 10 minutos.
create function public.demoday_app_verify_code(p_email text, p_code text) returns json
language plpgsql volatile security definer set search_path = public, extensions as $$
declare
  a public.demoday_app_attendees;
  c public.demoday_app_login_codes;
  t uuid;
begin
  select * into a from public.demoday_app_attendees where email = lower(btrim(coalesce(p_email, '')));
  if not found then
    raise exception 'not_registered' using errcode = 'P0001';
  end if;

  select * into c from public.demoday_app_login_codes
  where attendee_id = a.id and used_at is null
  order by created_at desc limit 1
  for update;
  if not found or c.expires_at < now() then
    raise exception 'code_expired' using errcode = 'P0001';
  end if;
  if c.attempts >= 5 then
    raise exception 'too_many_attempts' using errcode = 'P0001';
  end if;

  if c.code_hash <> crypt(regexp_replace(coalesce(p_code, ''), '\D', '', 'g'), c.code_hash) then
    update public.demoday_app_login_codes set attempts = attempts + 1 where id = c.id;
    -- O raise desfaria o update; devolve o erro como resultado para a tentativa contar.
    return json_build_object('error', case when c.attempts + 1 >= 5 then 'too_many_attempts' else 'invalid_code' end);
  end if;

  update public.demoday_app_login_codes set used_at = now() where id = c.id;
  insert into public.demoday_app_sessions (attendee_id) values (a.id) returning token into t;
  update public.demoday_app_attendees
     set last_login_at = now(), email_verified_at = coalesce(email_verified_at, now())
   where id = a.id;
  return json_build_object('token', t, 'email', a.email, 'name', a.name);
end $$;

revoke all on function public._demoday_app_issue_code(text) from public, anon, authenticated;
grant execute on function public._demoday_app_issue_code(text) to service_role;
revoke all on function public.demoday_app_verify_code(text, text) from public;
grant execute on function public.demoday_app_verify_code(text, text) to anon, authenticated;

-- Sem código não se entra mais: o login só com e-mail sai do alcance do público.
revoke execute on function public.demoday_app_login(text) from anon, authenticated;
