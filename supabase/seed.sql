-- Dados do protótipo (Demo Day 2026.2). Rode depois da migration.
-- Troque pelo admin à vontade; os logos sobem pela tela de Startups.

insert into public.categories (id, name, position, slots) values
  ('insp', 'Inspiration', 1, 3),
  ('ss', 'Startup School', 2, 5),
  ('open', 'Open Round', 3, 3),
  ('show', 'Showcase', 4, 10)
on conflict (id) do nothing;

insert into public.startups (category_id, position, name, tagline, summary, founders) values
  ('insp', 1, 'Gaio', 'Marketing e Publicidade · Tração',
   'Transforma seguidores em clientes no Instagram: ranqueia os seguidores mais engajados, organiza as conversas numa inbox inteligente e automatiza vendas pelo direct. Seed de R$ 5,5M liderada pelo G4.',
   '[{"name":"Bernardo Rodela","role":"CEO"},{"name":"Tiago Salles","role":"COO"},{"name":"Marcos Varotti","role":"CMO"}]'),
  ('ss', 1, 'Dressy', 'SaaS · Monetização inicial',
   'Donas de marcas de moda feminina autoral, médio-premium, com ticket médio a partir de R$ 200, têm dificuldade em converter clientes que chegam até o catálogo mas travam na dúvida de caimento e tamanho antes do checkout.',
   '[{"name":"Izabela Varotti","role":"Co-founder"},{"name":"Gabriela Vital","role":"Founder"}]'),
  ('open', 1, 'Centra', 'Tecnologia · Validação',
   'Melhoramos e mapeamos o nível de gestão emocional dos alunos.',
   '[{"name":"Felipe Gambarini","role":"Co-founder"},{"name":"Pedro Costa","role":"Co-founder"},{"name":"Pedro Negri","role":"CTO"}]'),
  ('show', 1, 'Tubushi', 'Varejo · Escala',
   'A Tubushi criou o primeiro sushi no tubo de São Paulo, com a proposta de trazer um sushi fresco e de qualidade para momentos que não se permitem comer um sushi de forma tradicional.',
   '[{"name":"Lucas Requena","role":"Founder"}]')
on conflict (category_id, position) do nothing;
