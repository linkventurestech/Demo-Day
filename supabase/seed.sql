-- Conteúdo inicial do Demo Day 2026.2. Rode depois das migrations.
-- As startups são ligadas às empresas do portfolio; a sincronização traz logo,
-- descrição, setor · estágio e founders (com foto) do sistema.

insert into public.demoday_app_blocks (id, name, position, slots) values
  ('ss', 'Investment Round', 1, 4),
  ('show', 'Showcase', 2, 4)
on conflict (id) do nothing;

insert into public.demoday_app_startups (block_id, position, name, portfolio_company_id) values
  ('ss',   1, 'Dressy',      'db088e2e-57d2-4b55-af97-d42203bd6633'),
  ('ss',   2, 'Eco Ice',     '216253af-2d37-45b9-8ecd-da451098b619'),
  ('ss',   3, 'Trena',       '784d3a25-22e2-4ac5-9001-ee07d0aa765c'),
  ('ss',   4, 'Sincra',      'd544eb5e-c2b6-4aed-99a1-6ab804be3dce'),
  ('show', 1, 'NaoeumMapa',  '05cf6e6e-806d-4597-b04b-df33d73a3ff5'),
  ('show', 2, 'Drafted',     '4657404e-494b-45b0-b1eb-d9b946e668e5'),
  ('show', 3, 'Odan Studio', '7ce480c2-f013-4d92-afab-ebd7f6a868a6'),
  ('show', 4, 'Persint',     '26e00e5b-2cd0-440e-ac34-22e7493d9d9f')
on conflict (block_id, position) do nothing;

select public._demoday_app_sync(null);
