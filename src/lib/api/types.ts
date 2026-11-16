export type InterestId = 'invest' | 'biz' | 'partner' | 'mentor' | 'news';

export const INTERESTS: { id: InterestId; label: string; wide?: boolean }[] = [
  { id: 'invest', label: 'Investir' },
  { id: 'biz', label: 'Fazer negócio' },
  { id: 'partner', label: 'Ser parceiro' },
  { id: 'mentor', label: 'Ser mentor' },
  { id: 'news', label: 'Ficar informado', wide: true },
];

export const interestLabel = (id: string) => INTERESTS.find((i) => i.id === id)?.label ?? id;

export interface EventSettings {
  name: string;
  tagline: string;
  voting_open: boolean;
}

export interface Category {
  id: string;
  name: string;
  position: number;
  slots: number;
}

export interface Founder {
  name: string;
  role: string;
  /** Foto vinda do portfolio (bucket público profile-photos), ou ausente. */
  photo_url?: string | null;
}

/** Empresa do portfolio que pode ser ligada a uma startup do Demo Day. */
export interface PortfolioCompany {
  id: string;
  name: string;
  has_logo: boolean;
  founders: number;
}

export interface Startup {
  id: string;
  category_id: string;
  position: number;
  name: string;
  tagline: string;
  summary: string;
  logo_url: string | null;
  founders: Founder[];
  /** Stand no mapa do Showcase (1–12), ou null. */
  stand: number | null;
  /** Empresa no portfolio de onde vêm logo, descrição e founders. */
  portfolio_company_id?: string | null;
}

export interface Juror {
  id: string;
  name: string;
  role: string;
  photo_url: string | null;
  position: number;
}

export interface PublicData {
  settings: EventSettings;
  categories: Category[];
  startups: Startup[];
  jurors: Juror[];
}

export interface AttendeeSession {
  token: string;
  email: string;
  name: string | null;
}

export interface MyRating {
  startup_id: string;
  score: number | null;
  interests: InterestId[];
  updated_at: string;
}

export interface Attendee {
  id: string;
  email: string;
  name: string | null;
  company: string | null;
  created_at: string;
  last_login_at: string | null;
}

export interface AttendeeInput {
  email: string;
  name?: string | null;
  company?: string | null;
}

export interface Rating {
  attendee_id: string;
  startup_id: string;
  score: number | null;
  interests: InterestId[];
  created_at: string;
  updated_at: string;
}

export interface AdminData extends PublicData {
  attendees: Attendee[];
  ratings: Rating[];
}

/** Erros de domínio que a UI traduz em mensagens. */
export type ApiErrorCode = 'not_registered' | 'invalid_session' | 'voting_closed' | 'not_admin' | 'slot_taken' | 'stand_taken' | 'unknown';

export class ApiError extends Error {
  constructor(public code: ApiErrorCode, message?: string) {
    super(message ?? code);
  }
}

export interface Api {
  mode: 'supabase' | 'demo';

  // Público
  getPublicData(): Promise<PublicData>;
  login(email: string): Promise<AttendeeSession>;
  myRatings(token: string): Promise<MyRating[]>;
  submitRating(token: string, startupId: string, score: number | null, interests: InterestId[]): Promise<void>;

  // Admin
  adminSignIn(email: string, password: string): Promise<void>;
  /** Login Google do portfolio; só existe com Supabase. Redireciona a página. */
  adminSignInWithGoogle?(): Promise<void>;
  /** Só com Supabase: empresas do portfolio, para ligar a uma startup. */
  listPortfolioCompanies?(): Promise<PortfolioCompany[]>;
  /** Só com Supabase: copia logo, descrição e founders do portfolio (uma startup ou todas as ligadas). */
  syncFromPortfolio?(startupId?: string): Promise<number>;
  adminSignOut(): Promise<void>;
  /** E-mail do admin logado, ou null. */
  adminCurrent(): Promise<string | null>;
  getAdminData(): Promise<AdminData>;
  upsertAttendees(rows: AttendeeInput[]): Promise<number>;
  deleteAttendees(ids: string[]): Promise<void>;
  /** Salva e devolve o id da startup. */
  saveStartup(s: Omit<Startup, 'id'> & { id?: string }): Promise<string>;
  deleteStartup(id: string): Promise<void>;
  saveJuror(j: Omit<Juror, 'id'> & { id?: string }): Promise<void>;
  deleteJuror(id: string): Promise<void>;
  saveCategory(c: Category): Promise<void>;
  deleteCategory(id: string): Promise<void>;
  saveSettings(s: EventSettings): Promise<void>;
}
