-- Conteúdo inicial do Demo Day 2026.2. Rode depois das migrations.
-- As startups são ligadas às empresas do portfolio; a sincronização traz logo,
-- descrição, setor · estágio e founders (com foto) do sistema, e os jurados da edição.

insert into public.demoday_app_blocks (id, name, position, slots) values
  ('ss', 'Investment Round', 1, 8),
  ('show', 'Showcase', 2, 11)
on conflict (id) do nothing;

insert into public.demoday_app_startups (block_id, position, name, portfolio_company_id) values
  ('ss', 1, 'Centra', '79d43e7e-7541-4ab2-9a86-608f84afd2c0'),
  ('ss', 2, 'Dressy', 'db088e2e-57d2-4b55-af97-d42203bd6633'),
  ('ss', 3, 'Trena', '784d3a25-22e2-4ac5-9001-ee07d0aa765c'),
  ('ss', 4, 'Stac', 'feea1bfe-c0df-4521-8e90-e12508eafffc'),
  ('ss', 5, 'Drafted', '4657404e-494b-45b0-b1eb-d9b946e668e5'),
  ('ss', 6, 'NaoeumMapa', '05cf6e6e-806d-4597-b04b-df33d73a3ff5'),
  ('ss', 7, 'RODO-S', '91b3862a-7074-48cc-80fa-d96270452b73'),
  ('ss', 8, 'LITS', 'a90d3670-1035-4d12-b391-ef68fa40075d'),
  ('show', 1, 'Agrosaf Radar', '7cf4e3f8-1a0e-406e-ae21-faec27ab222b'),
  ('show', 2, 'Groselia', '258f6fae-e0c6-455a-b528-9e38291d6ed4'),
  ('show', 3, 'Persint', '26e00e5b-2cd0-440e-ac34-22e7493d9d9f'),
  ('show', 4, 'MonttCO', 'cc57c956-210b-4b11-bca2-cd13c82aa383'),
  ('show', 5, 'Nero Skincare For Men', '9e0665de-4f24-4d0b-b80d-64ec6d48ac9b'),
  ('show', 6, 'MEVO', 'e41aee03-ef75-41ad-952f-66d00c6e3321'),
  ('show', 7, 'Brinquedoteka', null),
  ('show', 8, 'Odan Studio', '7ce480c2-f013-4d92-afab-ebd7f6a868a6'),
  ('show', 9, 'How', '35cac886-9e85-41be-924c-657df827ffb0'),
  ('show', 10, 'Vitra Energy', 'a6a16aab-85c9-4149-a375-c73fc0b1bd75'),
  ('show', 11, 'Auro Finanças', '33752987-78e1-4059-892b-bbeea8c5f85a')
on conflict (block_id, position) do nothing;

select public._demoday_app_sync(null);
select public._demoday_app_sync_jurors();
