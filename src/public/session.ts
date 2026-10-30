import type { AttendeeSession } from '../lib/api';

const KEY = 'dd-session';

export function loadSession(): AttendeeSession | null {
  try {
    const raw = localStorage.getItem(KEY);
    return raw ? (JSON.parse(raw) as AttendeeSession) : null;
  } catch {
    return null;
  }
}

export function storeSession(s: AttendeeSession | null) {
  try {
    if (s) localStorage.setItem(KEY, JSON.stringify(s));
    else localStorage.removeItem(KEY);
  } catch {
    /* sem storage: sessão vale só nesta aba */
  }
}
