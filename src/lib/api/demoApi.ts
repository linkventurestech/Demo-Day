import { SEED_ATTENDEES, SEED_CATEGORIES, SEED_JURORS, SEED_SETTINGS, SEED_STARTUPS } from './seed';
import { ApiError, type AdminData, type Api, type Attendee, type Rating } from './types';

/**
 * Backend local (localStorage) com as mesmas regras do banco, para testar o
 * app sem Supabase configurado. Os dados ficam só neste navegador.
 */
// v2: blocos Investment Round e Showcase (a v1 tinha os 4 blocos do protótipo).
const KEY = 'dd-demo-db-v2';

interface Db extends AdminData {
  sessions: Record<string, string>; // token → attendee_id
  admin: string | null;
}

const uid = () => (crypto.randomUUID ? crypto.randomUUID() : Math.random().toString(36).slice(2) + Date.now().toString(36));
const now = () => new Date().toISOString();

function fresh(): Db {
  const created = now();
  return {
    settings: { ...SEED_SETTINGS },
    categories: SEED_CATEGORIES.map((c) => ({ ...c })),
    startups: SEED_STARTUPS.map((s) => ({ ...s, founders: [...s.founders] })),
    jurors: [...SEED_JURORS],
    attendees: SEED_ATTENDEES.map((email) => ({ id: uid(), email, name: null, company: null, created_at: created, last_login_at: null })),
    ratings: [],
    sessions: {},
    admin: null,
  };
}

function load(): Db {
  try {
    const raw = localStorage.getItem(KEY);
    if (raw) {
      // Quem já abriu uma versão anterior da prévia também recebe os e-mails liberados depois.
      const d = JSON.parse(raw) as Db;
      for (const s of d.startups) s.stand ??= null;
      for (const email of SEED_ATTENDEES)
        if (!d.attendees.some((a) => a.email === email))
          d.attendees.push({ id: uid(), email, name: null, company: null, created_at: now(), last_login_at: null });
      return d;
    }
  } catch {
    /* storage indisponível: segue em memória */
  }
  return fresh();
}

let mem: Db | null = null;
const db = () => (mem ??= load());
// Admin e público em abas diferentes: relê quando a outra aba grava.
if (typeof window !== 'undefined') window.addEventListener('storage', (e) => e.key === KEY && (mem = null));
function save() {
  try {
    localStorage.setItem(KEY, JSON.stringify(mem));
  } catch {
    /* ignora */
  }
}
const clone = <T,>(v: T): T => JSON.parse(JSON.stringify(v));
const pub = () => {
  const d = db();
  return clone({ settings: d.settings, categories: d.categories, startups: d.startups, jurors: d.jurors });
};
const attendeeFor = (token: string) => {
  const id = db().sessions[token];
  if (!id || !db().attendees.some((a) => a.id === id)) throw new ApiError('invalid_session');
  return id;
};
const delay = () => new Promise((r) => setTimeout(r, 120));

export function createDemoApi(): Api {
  return {
    mode: 'demo',
    async getPublicData() {
      await delay();
      return pub();
    },
    async login(email) {
      await delay();
      const a = db().attendees.find((x) => x.email === email.trim().toLowerCase());
      if (!a) throw new ApiError('not_registered');
      const token = uid();
      db().sessions[token] = a.id;
      a.last_login_at = now();
      save();
      return { token, email: a.email, name: a.name };
    },
    async myRatings(token) {
      await delay();
      const id = attendeeFor(token);
      return clone(db().ratings.filter((r) => r.attendee_id === id));
    },
    async submitRating(token, startupId, score, interests) {
      await delay();
      const id = attendeeFor(token);
      if (!db().settings.voting_open) throw new ApiError('voting_closed');
      const clean = [...new Set(interests)].sort();
      if (score == null && !clean.length) throw new ApiError('unknown', 'Avaliação vazia');
      const existing = db().ratings.find((r) => r.attendee_id === id && r.startup_id === startupId);
      if (existing) Object.assign(existing, { score, interests: clean, updated_at: now() });
      else db().ratings.push({ attendee_id: id, startup_id: startupId, score, interests: clean, created_at: now(), updated_at: now() });
      save();
    },

    async adminSignIn(email) {
      await delay();
      db().admin = email.trim().toLowerCase() || 'admin@demo';
      save();
    },
    async adminSignOut() {
      db().admin = null;
      save();
    },
    async adminCurrent() {
      return db().admin;
    },
    async getAdminData() {
      await delay();
      const d = db();
      return { ...pub(), attendees: clone(d.attendees), ratings: clone(d.ratings) };
    },
    async upsertAttendees(rows) {
      const d = db();
      for (const r of rows) {
        const email = r.email.trim().toLowerCase();
        const a = d.attendees.find((x) => x.email === email);
        if (a) {
          if (r.name) a.name = r.name;
          if (r.company) a.company = r.company;
        } else {
          const n: Attendee = { id: uid(), email, name: r.name ?? null, company: r.company ?? null, created_at: now(), last_login_at: null };
          d.attendees.push(n);
        }
      }
      save();
      return rows.length;
    },
    async deleteAttendees(ids) {
      const d = db();
      d.attendees = d.attendees.filter((a) => !ids.includes(a.id));
      d.ratings = d.ratings.filter((r: Rating) => !ids.includes(r.attendee_id));
      save();
    },
    async saveStartup(s) {
      const d = db();
      if (d.startups.some((x) => x.id !== s.id && x.category_id === s.category_id && x.position === s.position)) throw new ApiError('slot_taken');
      if (s.stand != null && d.startups.some((x) => x.id !== s.id && x.stand === s.stand)) throw new ApiError('stand_taken');
      if (s.id) Object.assign(d.startups.find((x) => x.id === s.id)!, s);
      else d.startups.push({ ...s, id: uid() });
      save();
    },
    async deleteStartup(id) {
      const d = db();
      d.startups = d.startups.filter((x) => x.id !== id);
      d.ratings = d.ratings.filter((r) => r.startup_id !== id);
      save();
    },
    async saveJuror(j) {
      const d = db();
      if (j.id) Object.assign(d.jurors.find((x) => x.id === j.id)!, j);
      else d.jurors.push({ ...j, id: uid() });
      save();
    },
    async deleteJuror(id) {
      db().jurors = db().jurors.filter((x) => x.id !== id);
      save();
    },
    async saveCategory(c) {
      const d = db();
      const i = d.categories.findIndex((x) => x.id === c.id);
      if (i >= 0) d.categories[i] = c;
      else d.categories.push(c);
      save();
    },
    async deleteCategory(id) {
      const d = db();
      if (d.startups.some((s) => s.category_id === id)) throw new ApiError('unknown', 'Bloco ainda tem startups');
      d.categories = d.categories.filter((c) => c.id !== id);
      save();
    },
    async saveSettings(s) {
      db().settings = { ...s };
      save();
    },
  };
}
