import type { Category, EventSettings, InterestId, Juror, Startup } from './types';

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

/**
 * Respostas de exemplo do modo demonstração, para o painel não abrir vazio.
 * Pessoas e empresas fictícias (domínio example.com), marcadas como "Exemplo".
 */
export const SEED_EXAMPLE_PEOPLE: { email: string; name: string; company: string }[] = [
  { email: 'ana.lima@example.com', name: 'Ana Lima (exemplo)', company: 'Fundo Exemplo Capital' },
  { email: 'bruno.reis@example.com', name: 'Bruno Reis (exemplo)', company: 'Anjo independente' },
  { email: 'carla.mota@example.com', name: 'Carla Mota (exemplo)', company: 'Varejo Exemplo S.A.' },
  { email: 'diego.prado@example.com', name: 'Diego Prado (exemplo)', company: 'Aceleradora Exemplo' },
  { email: 'elisa.nunes@example.com', name: 'Elisa Nunes (exemplo)', company: 'Escola Exemplo' },
  { email: 'fabio.souza@example.com', name: 'Fábio Souza (exemplo)', company: 'Corporate Exemplo' },
  { email: 'gabi.torres@example.com', name: 'Gabi Torres (exemplo)', company: 'Fundo Exemplo Capital' },
  { email: 'hugo.alves@example.com', name: 'Hugo Alves (exemplo)', company: 'Mentor independente' },
];

/** [e-mail, startup, nota, interesses, minutos atrás] */
export const SEED_EXAMPLE_RATINGS: [string, string, number | null, InterestId[], number][] = [
  ['ana.lima@example.com', 'dressy', 5, ['invest', 'mentor'], 4],
  ['ana.lima@example.com', 'centra', 3, [], 18],
  ['ana.lima@example.com', 'tubushi', 4, ['news'], 31],
  ['bruno.reis@example.com', 'dressy', 4, ['invest'], 7],
  ['bruno.reis@example.com', 'tubushi', 5, ['invest', 'biz'], 26],
  ['carla.mota@example.com', 'tubushi', 5, ['biz', 'partner'], 9],
  ['carla.mota@example.com', 'dressy', 4, ['partner'], 22],
  ['diego.prado@example.com', 'centra', 4, ['mentor', 'partner'], 12],
  ['diego.prado@example.com', 'dressy', 3, ['news'], 35],
  ['elisa.nunes@example.com', 'centra', 5, ['biz', 'partner'], 15],
  ['elisa.nunes@example.com', 'tubushi', null, ['news'], 40],
  ['fabio.souza@example.com', 'tubushi', 4, ['biz'], 11],
  ['fabio.souza@example.com', 'centra', 2, [], 28],
  ['gabi.torres@example.com', 'dressy', 5, ['invest'], 3],
  ['gabi.torres@example.com', 'centra', 4, ['invest', 'news'], 20],
  ['hugo.alves@example.com', 'dressy', 4, ['mentor'], 14],
  ['hugo.alves@example.com', 'tubushi', 3, ['mentor', 'news'], 33],
];
