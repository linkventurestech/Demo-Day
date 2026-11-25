import type { Category, EventSettings, InterestId, Juror, Startup } from './types';

/** Conteúdo inicial do modo demonstração (espelha supabase/seed.sql e o banco). */
export const SEED_SETTINGS: EventSettings = {
  name: 'Demo Day 2026.2',
  tagline: 'Acompanhe a ordem dos pitchs, avalie as startups e sinalize seu interesse.',
  voting_open: true,
};

export const SEED_CATEGORIES: Category[] = [
  { id: 'ss', name: 'Investment Round', position: 1, slots: 8 },
  { id: 'show', name: 'Showcase', position: 2, slots: 15 },
];

// Espelha o banco (dados puxados do portfolio). Fotos e logos ficam de fora: a prévia
// publicada recebe as imagens embutidas por window.__DD_DEMO_IMAGES__; sem elas, iniciais.
export const SEED_STARTUPS: Startup[] = [
  {
    id: 'centra', category_id: 'ss', position: 1, name: 'Centra', logo_url: null, stand: null,
    tagline: 'Tecnologia · Validação',
    summary: 'Melhoramos e mapeamos o nível de gestão emocional dos alunos.',
    founders: [
      { name: 'Felipe Calderan Gambarini', role: 'Co-founder' },
      { name: 'Pedro Pinheiros Costa', role: 'Co-founder' },
    ],
  },
  {
    id: 'dressy', category_id: 'ss', position: 2, name: 'Dressy', logo_url: null, stand: null,
    tagline: 'SaaS · Monetização Inicial',
    summary: 'IA para ecommerce de moda feminina. Que transforma a experiência de compra com: Provador Virtual, Descubra seu tamanho e Personal Shopper guiam a cliente do look ao tamanho certo.',
    founders: [
      { name: 'Gabriela Mascarenhas Robatine Vital', role: 'Founder' },
      { name: 'Izabela Varotti', role: 'Co-founder' },
    ],
  },
  {
    id: 'fupi', category_id: 'ss', position: 3, name: 'Fupi', logo_url: null, stand: null,
    tagline: 'Tecnologia · Monetização Inicial',
    summary: 'Nós somos a equipe de vendas de empresas que vendem produtos recorrentes',
    founders: [
      { name: 'Gustavo Henrique Dias Guidugli', role: 'Founder' },
      { name: 'Matheus de Sena Carneiro', role: 'Co-founder' },
    ],
  },
  {
    id: 'naoeummapa', category_id: 'ss', position: 4, name: 'NaoeumMapa', logo_url: null, stand: null,
    tagline: 'Tecnologia · Monetização Inicial',
    summary: 'Criamos mundos digitais que nascem da audiência e viram comunidades. Em 1 mês, +350 mil pessoas já constroem, disputam e interagem nos nossos jogos. Tudo feito por dois fundadores e agentes de IA.',
    founders: [
      { name: 'João Manoel Ammar de Carvalho', role: 'Founder' },
    ],
  },
  {
    id: 'rodo-s', category_id: 'ss', position: 5, name: 'RODO-S', logo_url: null, stand: null,
    tagline: 'Serviços · Monetização Inicial',
    summary: 'A RODO-S é uma plataforma de inteligência e controle de diesel para frotas de caminhões-cegonha. Ela centraliza dados de abastecimento e operação para identificar desvios de consumo.',
    founders: [
      { name: 'Davi Generoso', role: 'Founder' },
      { name: 'Luiz Eduardo Moura Ferraz', role: 'Co-founder' },
    ],
  },
  {
    id: 'sincra', category_id: 'ss', position: 6, name: 'Sincra', logo_url: null, stand: null,
    tagline: 'SaaS · Monetização Inicial',
    summary: 'A Sincra antecipa recebíveis de médicos por plantões já realizados, conectando profissionais e instituições em uma experiência simples, rápida e digital.',
    founders: [
      { name: 'Felipe Miranda Freitas Silva', role: 'Founder | Operations' },
      { name: 'João Pedro Pincerno Favaro Trindade de Miranda Lessa', role: 'Founder | Sales' },
      { name: 'Pedro Villagrande Veríssimo da Fonseca', role: 'Founder | Product' },
    ],
  },
  {
    id: 'stac', category_id: 'ss', position: 7, name: 'Stac', logo_url: null, stand: null,
    tagline: 'Tecnologia · Tração',
    summary: 'Plataforma de inferência para empresas que querem usar mais IA em produção sem o custo explodir, equilibrando qualidade, desempenho e custo.',
    founders: [
      { name: 'Diogo Chiapeta Garcia', role: 'Founder - CTO' },
      { name: 'Felipe Argolo Assis', role: 'Founder - CEO' },
    ],
  },
  {
    id: 'trena', category_id: 'ss', position: 8, name: 'Trena', logo_url: null, stand: null,
    tagline: 'Energia · Monetização Inicial',
    summary: 'Plataforma de IA que lê dados de múltiplas distribuidoras, detecta cobranças indevidas automaticamente e entrega visão em tempo real de todo o portfólio evitando trabalho manual e recuperando dinheiro',
    founders: [
      { name: 'Pedro Gouveia Santos', role: 'Founder' },
      { name: 'Victor Hanna Bertoncello Haddad', role: 'Sócio' },
      { name: 'João Pedro Ferraz Corrêa Riêra', role: 'Co-founder' },
    ],
  },
  {
    id: 'agrosaf-radar', category_id: 'show', position: 1, name: 'Agrosaf Radar', logo_url: null, stand: null,
    tagline: 'Agronegócio · Tração',
    summary: 'Vigilância por satélite para propriedades rurais: alertas de invasão, desmatamento e construção com prova documental, e análises de solo, crédito de carbono, conformidade ambiental e minérios.',
    founders: [
      { name: 'Valentino Arturo Crosara do Valle', role: 'Founder' },
    ],
  },
  {
    id: 'drafted', category_id: 'show', position: 2, name: 'Drafted', logo_url: null, stand: null,
    tagline: 'Tecnologia · Monetização Inicial',
    summary: 'A Drafted é PR para a era da IA. Medimos como sua marca é interpretada por pessoas e por máquinas, montamos a estratégia e executamos conteúdo, presença e creators pra corrigir o que está errado.',
    founders: [
      { name: 'Isabela Ortunho Sliesoraitis', role: 'Founder' },
      { name: 'Hugo Teruel Mendes', role: 'Co-founder' },
    ],
  },
  {
    id: 'geniamed', category_id: 'show', position: 3, name: 'GeniaMed', logo_url: null, stand: null,
    tagline: 'Healthtech · Monetização Inicial',
    summary: 'Startup criada para sero copiloto da jornada burocrática da cirurgia. Implementando automações e IA na realização de documentações da rotina médica e hospitalar',
    founders: [
      { name: 'Wilson Shiyoiti Morikawa Junior', role: 'Founder' },
      { name: 'Pedro Henrique Martins da Cunha', role: 'Founder' },
    ],
  },
  {
    id: 'groselia', category_id: 'show', position: 4, name: 'Groselia', logo_url: null, stand: null,
    tagline: 'SaaS · Monetização Inicial',
    summary: 'Groselia é o Lovable do marketing. Você descreve o que quer no chat, a plataforma planeja o calendário, cria os posts na identidade da sua marca e publica.',
    founders: [
      { name: 'Danilo Lopes Parmegiani', role: 'Founder' },
      { name: 'Pedro Critchi', role: 'Founder' },
    ],
  },
  {
    id: 'haller-ai', category_id: 'show', position: 5, name: 'Haller AI', logo_url: null, stand: null,
    tagline: 'Inteligência Artificial · Validação',
    summary: 'Haller é um sistema de gestão operacional com agentes de IA para escritórios de advocacia.',
    founders: [
      { name: 'Nicolas Alves Cunha', role: 'Founder e CEO' },
      { name: 'Mateus Fleck', role: 'CTO' },
    ],
  },
  {
    id: 'how', category_id: 'show', position: 6, name: 'How', logo_url: null, stand: null,
    tagline: 'Saúde e Bem-estar · Tração',
    summary: '',
    founders: [
      { name: 'João Lucas Coutinho Ramos', role: 'CEO' },
      { name: 'Leonardo Ferreira Ceron', role: 'CEO' },
    ],
  },
  {
    id: 'isa-slime', category_id: 'show', position: 7, name: 'Isa Slime', logo_url: null, stand: null,
    tagline: 'Entretenimento · Tração',
    summary: 'Isa Slime é uma marca de brinquedos faça você mesmo que estimula a criatividade, imaginação e independência das crianças por meio de experiências divertidas e sensoriais.',
    founders: [
      { name: 'Isadora Bertotti Gonçalves', role: 'Founder' },
    ],
  },
  {
    id: 'lits', category_id: 'show', position: 8, name: 'LITS', logo_url: null, stand: null,
    tagline: 'Marketplace · Tração',
    summary: 'LITS é o clube digital de tênis: conecta jogadores por nível, organiza partidas, ranking e torneios, e dá às academias um sistema para gerir aulas, quadras e pagamentos.',
    founders: [
      { name: 'Arthur Watanabe Imanishi', role: 'Founder' },
    ],
  },
  {
    id: 'mevo', category_id: 'show', position: 9, name: 'MEVO', logo_url: null, stand: null,
    tagline: 'Construção e Imobiliário · Validação',
    summary: 'Infraestrutura de IA que gera demanda e automatiza a operação de corretores de alto padrão',
    founders: [
      { name: 'Martim Barcki Rocha Antunes', role: 'Founder' },
      { name: 'Henrique Wrobel Maffia Rezende', role: 'Co-founder' },
    ],
  },
  {
    id: 'monttco', category_id: 'show', position: 10, name: 'MonttCO', logo_url: null, stand: null,
    tagline: 'Moda e Beleza · Tração',
    summary: 'A MONTT CO. é uma marca de lifestyle e streetwear que une autenticidade, estilo e inovação. Criamos peças exclusivas, com identidade própria, para quem busca viver o lifestyle de viver a vida.',
    founders: [
      { name: 'Natalie Amaral Ferreira', role: 'CEO' },
      { name: 'Guilherme Braga Bijos Pinto', role: 'CTO' },
      { name: 'Jhonny Gondim Corrêa', role: 'CMO' },
      { name: 'Matheus Melo Abdelnur', role: 'CFO' },
    ],
  },
  {
    id: 'nero-skincare-for-men', category_id: 'show', position: 11, name: 'Nero Skincare For Men', logo_url: null, stand: null,
    tagline: 'Moda e Beleza · Validação',
    summary: '',
    founders: [
      { name: 'Lorenzo de Oliveira Dias', role: 'CEO' },
      { name: 'Sofia Brito Caribé da Costa Pinto', role: 'CMO' },
    ],
  },
  {
    id: 'odan-studio', category_id: 'show', position: 12, name: 'Odan Studio', logo_url: null, stand: null,
    tagline: 'Entretenimento · Validação',
    summary: 'Estúdio de IP nativo de IA. Criamos e animamos personagens próprios para marcas: personagens que viram conteúdo, audiência e ativo. Em vez de alugar atenção, a marca constrói a dela.',
    founders: [
      { name: 'Letícia Guimarães de Oliveira Crnkovic', role: 'Founder' },
    ],
  },
  {
    id: 'persint', category_id: 'show', position: 13, name: 'Persint', logo_url: null, stand: null,
    tagline: 'SaaS · Monetização Inicial',
    summary: 'AI-Native Customer Experience. Experiência única em escala para seus clientes.',
    founders: [
      { name: 'Davi Moura Marson', role: 'Founder' },
      { name: 'Francisco Pigatto Monteiro', role: 'Founder' },
      { name: 'Italo Andrade', role: 'Founder/CTO' },
    ],
  },
  {
    id: 'renda-medica', category_id: 'show', position: 14, name: 'Renda Médica', logo_url: null, stand: null,
    tagline: 'Fintech · Monetização Inicial',
    summary: 'O Renda Médica é o sistema financeiro (SaaS) feito para médicos autônomos. Dos registros na agenda aos recebíveis. O médico produz e nós garantimos que ele receba.',
    founders: [
      { name: 'Michel Bado', role: 'Founder' },
      { name: 'Jeff Bado', role: 'Co-founder' },
    ],
  },
  {
    id: 'vitra-energy', category_id: 'show', position: 15, name: 'Vitra Energy', logo_url: null, stand: null,
    tagline: 'Saúde e Bem-estar · Validação',
    summary: 'A Vitra Energy é um energético natural e funcional para jovens que buscam energia, foco e vitalidade. Com cafeína natural e ingredientes funcionais, acompanha uma rotina ativa, saudável e dinâmica.',
    founders: [
      { name: 'Fernanda Knijnik', role: 'Founder' },
    ],
  },
];

// Banca do Investment Round, como no portfolio (demoday_juror, edição 2026.2). Fotos em public/demoday/2026-2/jurors.
const juror = (n: number, name: string, company: string, file: string, role = ''): Juror => ({
  id: 'juror-' + n,
  name,
  role,
  company,
  bio: '',
  photo_url: `/demoday/2026-2/jurors/${file}.jpg`,
  linkedin_url: null,
  position: n,
});

export const SEED_JURORS: Juror[] = [
  juror(1, 'Gabriela Lima', 'BTG boostlab', 'gabriela-lima'),
  juror(2, 'Marcelo Franco', 'Verve Capital', 'marcelo-franco'),
  juror(3, 'Pedro Teo', 'Norte Ventures', 'pedro-teo'),
  juror(4, 'Rodrigo Borges', 'domo.vc', 'rodrigo-borges'),
  juror(5, 'Vitória Bittar', 'Monashees', 'vitoria-bittar'),
  juror(6, 'Victoria Amato', 'Maya Capital', 'victoria-pacey-amato'),
];

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
  ['ana.lima@example.com', 'fupi', 3, [], 18],
  ['ana.lima@example.com', 'drafted', 4, ['news'], 31],
  ['bruno.reis@example.com', 'dressy', 4, ['invest'], 7],
  ['bruno.reis@example.com', 'drafted', 5, ['invest', 'biz'], 26],
  ['carla.mota@example.com', 'how', 5, ['biz', 'partner'], 9],
  ['carla.mota@example.com', 'dressy', 4, ['partner'], 22],
  ['diego.prado@example.com', 'trena', 4, ['mentor', 'partner'], 12],
  ['diego.prado@example.com', 'dressy', 3, ['news'], 35],
  ['elisa.nunes@example.com', 'sincra', 5, ['biz', 'partner'], 15],
  ['elisa.nunes@example.com', 'odan-studio', null, ['news'], 40],
  ['fabio.souza@example.com', 'persint', 4, ['biz'], 11],
  ['fabio.souza@example.com', 'centra', 2, [], 28],
  ['gabi.torres@example.com', 'dressy', 5, ['invest'], 3],
  ['gabi.torres@example.com', 'sincra', 4, ['invest', 'news'], 20],
  ['hugo.alves@example.com', 'dressy', 4, ['mentor'], 14],
  ['hugo.alves@example.com', 'naoeummapa', 3, ['mentor', 'news'], 33],
];
