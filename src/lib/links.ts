/** "https://www.dressy.app.br/x" → "dressy.app.br". */
export function siteLabel(url: string) {
  try {
    return new URL(url).hostname.replace(/^www\./, '');
  } catch {
    return url;
  }
}

/** "https://www.instagram.com/try.dressy/?igsh=…" → "@try.dressy". */
export function instagramLabel(url: string) {
  try {
    const handle = new URL(url).pathname.split('/').filter(Boolean)[0];
    return handle ? '@' + handle : 'Instagram';
  } catch {
    return 'Instagram';
  }
}

/** Aceita "dominio.com" ou "@perfil" digitados no painel e devolve o endereço completo. */
export function normalizeUrl(v: string, instagram = false) {
  const s = v.trim();
  if (!s) return null;
  if (/^https?:\/\//i.test(s)) return s;
  if (instagram && !/instagram\.com/i.test(s)) return `https://www.instagram.com/${s.replace(/^@/, '')}/`;
  return 'https://' + s.replace(/^\/+/, '');
}
