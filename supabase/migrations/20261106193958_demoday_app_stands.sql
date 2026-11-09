-- Demo Day · mapa dos stands
-- Cada startup pode ocupar um stand da planta em U (o app desenha 12).
-- Aditivo: só uma coluna nova e um índice; nada do portfolio muda.

alter table public.demoday_app_startups
  add column stand smallint check (stand between 1 and 50);

create unique index demoday_app_startups_stand_key
  on public.demoday_app_startups (stand) where stand is not null;

comment on column public.demoday_app_startups.stand is
  'Demo Day app: número do stand no mapa (planta em U). Único; nulo = sem stand.';
