import { createClient, type PostgrestError } from '@supabase/supabase-js';
import { ApiError, type Api, type ApiErrorCode, type AttendeeSession, type MyRating, type PublicData } from './types';

const KNOWN: ApiErrorCode[] = ['not_registered', 'invalid_session', 'voting_closed'];

function fail(error: PostgrestError | Error | null): never {
  const msg = error?.message ?? 'unknown';
  const code = KNOWN.find((k) => msg.includes(k));
  if (code) throw new ApiError(code, msg);
  if ('code' in (error ?? {}) && (error as PostgrestError).code === '23505') throw new ApiError('slot_taken', msg);
  throw new ApiError('unknown', msg);
}

function ok<T>({ data, error }: { data: T | null; error: PostgrestError | null }): T {
  if (error) fail(error);
  return data as T;
}

export function createSupabaseApi(url: string, key: string): Api {
  const db = createClient(url, key, { auth: { persistSession: true, storageKey: 'dd-admin-auth' } });

  const getPublicData = async (): Promise<PublicData> => {
    const [settings, categories, startups, jurors] = await Promise.all([
      db.from('event_settings').select('name, tagline, voting_open').eq('id', 1).single(),
      db.from('categories').select('*').order('position'),
      db.from('startups').select('id, category_id, position, name, tagline, summary, logo_url, founders').order('position'),
      db.from('jurors').select('*').order('position'),
    ]);
    return { settings: ok(settings), categories: ok(categories), startups: ok(startups), jurors: ok(jurors) };
  };

  return {
    mode: 'supabase',
    getPublicData,

    async login(email) {
      return ok(await db.rpc('attendee_login', { p_email: email })) as AttendeeSession;
    },
    async myRatings(token) {
      return ok(await db.rpc('attendee_my_ratings', { p_token: token })) as MyRating[];
    },
    async submitRating(token, startupId, score, interests) {
      ok(await db.rpc('attendee_submit_rating', { p_token: token, p_startup_id: startupId, p_score: score, p_interests: interests }));
    },

    async adminSignIn(email, password) {
      const { error } = await db.auth.signInWithPassword({ email: email.trim(), password });
      if (error) fail(error);
      if (!ok(await db.rpc('is_admin'))) {
        await db.auth.signOut();
        throw new ApiError('not_admin');
      }
    },
    async adminSignOut() {
      await db.auth.signOut();
    },
    async adminCurrent() {
      const { data } = await db.auth.getSession();
      if (!data.session) return null;
      const isAdmin = await db.rpc('is_admin');
      return isAdmin.data ? data.session.user.email ?? null : null;
    },
    async getAdminData() {
      const [pub, attendees, ratings] = await Promise.all([
        getPublicData(),
        db.from('attendees').select('*').order('email').range(0, 9999),
        db.from('ratings').select('*').order('updated_at', { ascending: false }).range(0, 49999),
      ]);
      return { ...pub, attendees: ok(attendees), ratings: ok(ratings) };
    },
    async upsertAttendees(rows) {
      if (!rows.length) return 0;
      // Não apaga nome/empresa já cadastrados quando a nova planilha vem só com e-mails.
      const withInfo = rows.filter((r) => r.name || r.company);
      const bare = rows.filter((r) => !r.name && !r.company);
      if (withInfo.length) ok(await db.from('attendees').upsert(withInfo, { onConflict: 'email' }));
      if (bare.length) ok(await db.from('attendees').upsert(bare.map((r) => ({ email: r.email })), { onConflict: 'email', ignoreDuplicates: true }));
      return rows.length;
    },
    async deleteAttendees(ids) {
      ok(await db.from('attendees').delete().in('id', ids));
    },
    async saveStartup({ id, ...s }) {
      ok(id ? await db.from('startups').update(s).eq('id', id) : await db.from('startups').insert(s));
    },
    async deleteStartup(id) {
      ok(await db.from('startups').delete().eq('id', id));
    },
    async saveJuror({ id, ...j }) {
      ok(id ? await db.from('jurors').update(j).eq('id', id) : await db.from('jurors').insert(j));
    },
    async deleteJuror(id) {
      ok(await db.from('jurors').delete().eq('id', id));
    },
    async saveCategory(c) {
      ok(await db.from('categories').upsert(c));
    },
    async deleteCategory(id) {
      ok(await db.from('categories').delete().eq('id', id));
    },
    async saveSettings(s) {
      ok(await db.from('event_settings').update({ ...s, updated_at: new Date().toISOString() }).eq('id', 1));
    },
  };
}
