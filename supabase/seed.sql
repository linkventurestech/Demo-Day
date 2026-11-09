-- Conteúdo inicial do Demo Day 2026.2 (blocos Investment Round e Showcase). Rode depois da migration.
-- Troque pelo admin à vontade; os logos sobem pela tela de Startups.

insert into public.demoday_app_blocks (id, name, position, slots) values
  ('ss', 'Investment Round', 1, 8),
  ('show', 'Showcase', 2, 10)
on conflict (id) do nothing;

insert into public.demoday_app_startups (block_id, position, name, tagline, summary, founders) values
  ('ss', 1, 'Dressy', 'SaaS · Monetização inicial',
   'Donas de marcas de moda feminina autoral, médio-premium, com ticket médio a partir de R$ 200, têm dificuldade em converter clientes que chegam até o catálogo mas travam na dúvida de caimento e tamanho antes do checkout.',
   '[{"name":"Izabela Varotti","role":"Co-founder"},{"name":"Gabriela Vital","role":"Founder"}]'),
  ('ss', 2, 'Centra', 'Tecnologia · Validação',
   'Melhoramos e mapeamos o nível de gestão emocional dos alunos.',
   '[{"name":"Felipe Gambarini","role":"Co-founder"},{"name":"Pedro Costa","role":"Co-founder"},{"name":"Pedro Negri","role":"CTO"}]'),
  ('show', 1, 'Tubushi', 'Varejo · Escala',
   'A Tubushi criou o primeiro sushi no tubo de São Paulo, com a proposta de trazer um sushi fresco e de qualidade para momentos que não se permitem comer um sushi de forma tradicional.',
   '[{"name":"Lucas Requena","role":"Founder"}]')
on conflict (block_id, position) do nothing;
