-- Conteúdo inicial do Demo Day 2026.2. Rode depois das migrations.
-- As startups são ligadas às empresas do portfolio; a sincronização traz logo,
-- descrição, setor · estágio e founders (com foto) do sistema, e os jurados da edição.

insert into public.demoday_app_blocks (id, name, position, slots) values
  ('ss', 'Investment Round', 1, 8),
  ('show', 'Showcase', 2, 15)
on conflict (id) do nothing;

insert into public.demoday_app_startups (block_id, position, name, portfolio_company_id) values
  ('ss', 1, 'Centra', '79d43e7e-7541-4ab2-9a86-608f84afd2c0'),
  ('ss', 2, 'Dressy', 'db088e2e-57d2-4b55-af97-d42203bd6633'),
  ('ss', 3, 'Fupi', '216253af-2d37-45b9-8ecd-da451098b619'),
  ('ss', 4, 'NaoeumMapa', '05cf6e6e-806d-4597-b04b-df33d73a3ff5'),
  ('ss', 5, 'RODO-S', '91b3862a-7074-48cc-80fa-d96270452b73'),
  ('ss', 6, 'Sincra', 'd544eb5e-c2b6-4aed-99a1-6ab804be3dce'),
  ('ss', 7, 'Stac', 'feea1bfe-c0df-4521-8e90-e12508eafffc'),
  ('ss', 8, 'Trena', '784d3a25-22e2-4ac5-9001-ee07d0aa765c'),
  ('show', 1, 'Agrosaf Radar', '7cf4e3f8-1a0e-406e-ae21-faec27ab222b'),
  ('show', 2, 'Drafted', '4657404e-494b-45b0-b1eb-d9b946e668e5'),
  ('show', 3, 'GeniaMed', '7da189dc-0f0e-4ee7-a226-062c51ef9cdd'),
  ('show', 4, 'Groselia', '258f6fae-e0c6-455a-b528-9e38291d6ed4'),
  ('show', 5, 'Haller AI', '809846bb-203d-4cb7-9680-3e8ede5115b2'),
  ('show', 6, 'How', '35cac886-9e85-41be-924c-657df827ffb0'),
  ('show', 7, 'Isa Slime', '2f8ea99e-317a-4d61-b896-684fabd51a0b'),
  ('show', 8, 'LITS', 'a90d3670-1035-4d12-b391-ef68fa40075d'),
  ('show', 9, 'MEVO', 'e41aee03-ef75-41ad-952f-66d00c6e3321'),
  ('show', 10, 'MonttCO', 'cc57c956-210b-4b11-bca2-cd13c82aa383'),
  ('show', 11, 'Nero Skincare For Men', '9e0665de-4f24-4d0b-b80d-64ec6d48ac9b'),
  ('show', 12, 'Odan Studio', '7ce480c2-f013-4d92-afab-ebd7f6a868a6'),
  ('show', 13, 'Persint', '26e00e5b-2cd0-440e-ac34-22e7493d9d9f'),
  ('show', 14, 'Renda Médica', '011e6d4f-1e3b-496d-9093-323abb490a88'),
  ('show', 15, 'Vitra Energy', 'a6a16aab-85c9-4149-a375-c73fc0b1bd75')
on conflict (block_id, position) do nothing;

select public._demoday_app_sync(null);
select public._demoday_app_sync_jurors();
