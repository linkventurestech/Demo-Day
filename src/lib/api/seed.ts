import type { Category, EventSettings, Juror, Startup } from './types';

/** Conteúdo inicial do modo demonstração (espelha supabase/seed.sql e o banco em 2026-11). */
export const SEED_SETTINGS: EventSettings = {
  name: 'Demo Day 2026.2',
  tagline: 'Acompanhe a ordem dos pitchs, avalie as startups e sinalize seu interesse.',
  voting_open: true,
};

export const SEED_CATEGORIES: Category[] = [
  { id: 'ss', name: 'Investment Round', position: 1, slots: 8 },
  { id: 'show', name: 'Showcase', position: 2, slots: 10 },
];

export const SEED_STARTUPS: Startup[] = [
  {
    id: 'dressy', category_id: 'ss', position: 1, name: 'Dressy', logo_url: null, stand: null,
    tagline: 'SaaS · Monetização inicial',
    summary: 'Donas de marcas de moda feminina autoral, médio-premium, com ticket médio a partir de R$ 200, têm dificuldade em converter clientes que chegam até o catálogo mas travam na dúvida de caimento e tamanho antes do checkout.',
    founders: [
      { name: 'Izabela Varotti', role: 'Co-founder' },
      { name: 'Gabriela Vital', role: 'Founder' },
    ],
  },
  {
    id: 'centra', category_id: 'ss', position: 2, name: 'Centra', logo_url: null, stand: null,
    tagline: 'Tecnologia · Validação',
    summary: 'Melhoramos e mapeamos o nível de gestão emocional dos alunos.',
    founders: [
      { name: 'Felipe Gambarini', role: 'Co-founder' },
      { name: 'Pedro Costa', role: 'Co-founder' },
      { name: 'Pedro Negri', role: 'CTO' },
    ],
  },
  {
    id: 'tubushi', category_id: 'show', position: 1, name: 'Tubushi', logo_url: null, stand: 1,
    tagline: 'Varejo · Escala',
    summary: 'A Tubushi criou o primeiro sushi no tubo de São Paulo, com a proposta de trazer um sushi fresco e de qualidade para momentos que não se permitem comer um sushi de forma tradicional.',
    founders: [{ name: 'Lucas Requena', role: 'Founder' }],
  },
];

export const SEED_JURORS: Juror[] = [];

// VITE_DEMO_ATTENDEES (e-mails separados por vírgula) libera mais gente numa prévia, sem pôr e-mails no código.
const extra = ((import.meta.env.VITE_DEMO_ATTENDEES as string | undefined) ?? '')
  .split(',')
  .map((e) => e.trim().toLowerCase())
  .filter(Boolean);

export const SEED_ATTENDEES = [...new Set(['demo@lsb.edu.br', 'convidado@demoday.com', ...extra])];
