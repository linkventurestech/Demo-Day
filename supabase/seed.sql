-- Conteúdo inicial do Demo Day 2026.2. Rode depois das migrations.
-- As startups são ligadas às empresas do portfolio; a sincronização traz logo,
-- descrição, setor · estágio e founders (com foto) do sistema.

insert into public.demoday_app_blocks (id, name, position, slots) values
  ('ss', 'Investment Round', 1, 6),
  ('show', 'Showcase', 2, 6)
on conflict (id) do nothing;

insert into public.demoday_app_startups (block_id, position, name, portfolio_company_id) values
  ('ss',   1, 'Dressy',      'db088e2e-57d2-4b55-af97-d42203bd6633'),
  ('ss',   2, 'Eco Ice',     '216253af-2d37-45b9-8ecd-da451098b619'),
  ('ss',   3, 'Trena',       '784d3a25-22e2-4ac5-9001-ee07d0aa765c'),
  ('ss',   4, 'Sincra',      'd544eb5e-c2b6-4aed-99a1-6ab804be3dce'),
  ('ss',   5, 'Centra',      '79d43e7e-7541-4ab2-9a86-608f84afd2c0'),
  ('ss',   6, 'Rodo-S',      '91b3862a-7074-48cc-80fa-d96270452b73'),
  ('show', 1, 'NaoeumMapa',  '05cf6e6e-806d-4597-b04b-df33d73a3ff5'),
  ('show', 2, 'Drafted',     '4657404e-494b-45b0-b1eb-d9b946e668e5'),
  ('show', 3, 'Odan Studio', '7ce480c2-f013-4d92-afab-ebd7f6a868a6'),
  ('show', 4, 'Persint',     '26e00e5b-2cd0-440e-ac34-22e7493d9d9f'),
  ('show', 5, 'Tubushi',     'c663bbd1-0fae-40c5-831b-16d0bf41cc6a'),
  ('show', 6, 'Vitra Energy', 'a6a16aab-85c9-4149-a375-c73fc0b1bd75')
on conflict (block_id, position) do nothing;

select public._demoday_app_sync(null);
