import { INTERESTS, type Attendee, type InterestId, type Rating, type Startup } from './api/types';

export interface StartupResult {
  startup: Startup;
  responses: number;
  votes: number;
  avg: number | null;
  dist: [number, number, number, number, number]; // notas 1..5
  interests: Record<InterestId, number>;
  connections: number; // pessoas com ao menos um interesse
}

const emptyInterests = () => Object.fromEntries(INTERESTS.map((i) => [i.id, 0])) as Record<InterestId, number>;

export function aggregate(startups: Startup[], ratings: Rating[]): StartupResult[] {
  return startups.map((startup) => {
    const rs = ratings.filter((r) => r.startup_id === startup.id);
    const dist: StartupResult['dist'] = [0, 0, 0, 0, 0];
    const interests = emptyInterests();
    let sum = 0;
    let votes = 0;
    let connections = 0;
    for (const r of rs) {
      if (r.score) {
        dist[r.score - 1] += 1;
        sum += r.score;
        votes += 1;
      }
      for (const i of r.interests) interests[i] = (interests[i] ?? 0) + 1;
      if (r.interests.length) connections += 1;
    }
    return { startup, responses: rs.length, votes, avg: votes ? sum / votes : null, dist, interests, connections };
  });
}

export interface ConnectionRow {
  attendee: Attendee | undefined;
  startup: Startup | undefined;
  rating: Rating;
}

export function connectionRows(ratings: Rating[], attendees: Attendee[], startups: Startup[]): ConnectionRow[] {
  const byA = new Map(attendees.map((a) => [a.id, a]));
  const byS = new Map(startups.map((s) => [s.id, s]));
  return ratings
    .filter((r) => r.interests.length)
    .map((rating) => ({ rating, attendee: byA.get(rating.attendee_id), startup: byS.get(rating.startup_id) }))
    .sort((a, b) => b.rating.updated_at.localeCompare(a.rating.updated_at));
}

export const fmtAvg = (n: number | null) => (n == null ? '—' : n.toFixed(1).replace('.', ','));
