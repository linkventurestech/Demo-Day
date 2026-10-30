import type { Category, EventSettings, Juror, Startup } from './types';

/** Conteúdo do protótipo, usado no modo demonstração (espelha supabase/seed.sql). */
export const SEED_SETTINGS: EventSettings = {
  name: 'Demo Day 2026.2',
  tagline: 'Acompanhe a ordem dos pitchs, avalie as startups e sinalize seu interesse.',
  voting_open: true,
};

export const SEED_CATEGORIES: Category[] = [
  { id: 'insp', name: 'Inspiration', position: 1, slots: 3 },
  { id: 'ss', name: 'Startup School', position: 2, slots: 5 },
  { id: 'open', name: 'Open Round', position: 3, slots: 3 },
  { id: 'show', name: 'Showcase', position: 4, slots: 10 },
];

export const SEED_STARTUPS: Startup[] = [
  {
    id: 'gaio', category_id: 'insp', position: 1, name: 'Gaio', logo_url: null,
    tagline: 'Marketing e Publicidade · Tração',
    summary: 'Transforma seguidores em clientes no Instagram: ranqueia os seguidores mais engajados, organiza as conversas numa inbox inteligente e automatiza vendas pelo direct. Seed de R$ 5,5M liderada pelo G4.',
    founders: [
      { name: 'Bernardo Rodela', role: 'CEO' },
      { name: 'Tiago Salles', role: 'COO' },
      { name: 'Marcos Varotti', role: 'CMO' },
    ],
  },
  {
    id: 'dressy', category_id: 'ss', position: 1, name: 'Dressy', logo_url: null,
    tagline: 'SaaS · Monetização inicial',
    summary: 'Donas de marcas de moda feminina autoral, médio-premium, com ticket médio a partir de R$ 200, têm dificuldade em converter clientes que chegam até o catálogo mas travam na dúvida de caimento e tamanho antes do checkout.',
    founders: [
      { name: 'Izabela Varotti', role: 'Co-founder' },
      { name: 'Gabriela Vital', role: 'Founder' },
    ],
  },
  {
    id: 'centra', category_id: 'open', position: 1, name: 'Centra', logo_url: null,
    tagline: 'Tecnologia · Validação',
    summary: 'Melhoramos e mapeamos o nível de gestão emocional dos alunos.',
    founders: [
      { name: 'Felipe Gambarini', role: 'Co-founder' },
      { name: 'Pedro Costa', role: 'Co-founder' },
      { name: 'Pedro Negri', role: 'CTO' },
    ],
  },
  {
    id: 'tubushi', category_id: 'show', position: 1, name: 'Tubushi', logo_url: null,
    tagline: 'Varejo · Escala',
    summary: 'A Tubushi criou o primeiro sushi no tubo de São Paulo, com a proposta de trazer um sushi fresco e de qualidade para momentos que não se permitem comer um sushi de forma tradicional.',
    founders: [{ name: 'Lucas Requena', role: 'Founder' }],
  },
];

export const SEED_JURORS: Juror[] = [];

export const SEED_ATTENDEES = ['demo@lsb.edu.br', 'convidado@demoday.com'];
