// demoday-app-send-code — envia o código de 6 dígitos para entrar no app do público do Demo Day.
//
// Público (sem JWT): recebe só o e-mail. Quem gera, guarda (só o hash) e limita os códigos é
// _demoday_app_issue_code, chamada com a service role; o código em claro só passa por aqui para
// ir no e-mail. Responde sempre 200 com { ok } ou { error } para o app mostrar a mensagem certa.
// Sem PII em logs. Sem RESEND_API_KEY → error 'email_unavailable'.

import { corsHeaders } from 'npm:@supabase/supabase-js@2/cors';
import { createClient } from 'npm:@supabase/supabase-js@2';
import { z } from 'npm:zod@3.23.8';

const BodySchema = z.object({ email: z.string().trim().toLowerCase().email().max(254) });
const KNOWN = ['not_registered', 'rate_limited'];

function json(body: unknown, status = 200) {
  return new Response(JSON.stringify(body), { status, headers: { ...corsHeaders, 'Content-Type': 'application/json' } });
}

const esc = (s: string) => s.replace(/[&<>"']/g, (c) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' })[c]!);

function codeEmail(code: string, name: string | null, eventName: string) {
  const hello = name ? `Olá, ${esc(name.split(' ')[0])}!` : 'Olá!';
  const subject = `${code} é o seu código para o ${eventName}`;
  const html = `<!doctype html><html lang="pt-BR"><body style="margin:0;background:#f7f9fa;font-family:Helvetica,Arial,sans-serif;color:#10284e">
  <table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="padding:32px 16px"><tr><td align="center">
    <table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="max-width:440px;background:#ffffff;border:1px solid #e1e5ed;border-radius:12px">
      <tr><td style="background:#10284e;border-radius:12px 12px 0 0;padding:24px">
        <p style="margin:0;font-family:Menlo,monospace;font-size:11px;letter-spacing:.08em;text-transform:uppercase;color:#a7b1c6">Link Ventures</p>
        <p style="margin:8px 0 0;font-size:24px;font-weight:700;letter-spacing:-.02em;text-transform:uppercase;color:#ffffff">${esc(eventName)}</p>
      </td></tr>
      <tr><td style="padding:24px">
        <p style="margin:0 0 12px;font-size:16px">${hello}</p>
        <p style="margin:0 0 20px;font-size:15px;line-height:1.5;color:#546484">Use este código para entrar no app do evento. Ele vale por 10 minutos.</p>
        <p style="margin:0 0 20px;font-family:Menlo,monospace;font-size:34px;font-weight:700;letter-spacing:.3em;text-align:center;background:#f7f9fa;border:1px solid #e1e5ed;border-radius:10px;padding:16px 0">${code}</p>
        <p style="margin:0;font-size:13px;line-height:1.5;color:#546484">Se não foi você que pediu, pode ignorar este e-mail.</p>
      </td></tr>
    </table>
  </td></tr></table></body></html>`;
  return { subject, html };
}

Deno.serve(async (req) => {
  if (req.method === 'OPTIONS') return new Response('ok', { headers: corsHeaders });
  if (req.method !== 'POST') return json({ error: 'method_not_allowed' }, 405);
  try {
    const parsed = BodySchema.safeParse(await req.json().catch(() => null));
    if (!parsed.success) return json({ error: 'invalid_email' });

    const resendKey = Deno.env.get('RESEND_API_KEY');
    if (!resendKey) {
      console.log(JSON.stringify({ fn: 'demoday-app-send-code', decision: 'no_resend_key' }));
      return json({ error: 'email_unavailable' });
    }

    const admin = createClient(Deno.env.get('SUPABASE_URL')!, Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!);
    const { data, error } = await admin.rpc('_demoday_app_issue_code', { p_email: parsed.data.email });
    if (error) {
      const known = KNOWN.find((k) => error.message.includes(k));
      console.log(JSON.stringify({ fn: 'demoday-app-send-code', decision: known ?? 'rpc_error' }));
      return json({ error: known ?? 'internal' });
    }
    const row = (data as { code: string; attendee_name: string | null; event_name: string | null }[])[0];
    const { subject, html } = codeEmail(row.code, row.attendee_name, row.event_name ?? 'Demo Day');
    const from = Deno.env.get('NOTIFICATION_EMAIL_FROM') ?? 'Link Ventures <notificacoes@linkventures.com.br>';

    const resp = await fetch('https://api.resend.com/emails', {
      method: 'POST',
      headers: { Authorization: `Bearer ${resendKey}`, 'Content-Type': 'application/json' },
      body: JSON.stringify({ from, to: [parsed.data.email], subject, html }),
    }).catch(() => null);
    const ok = !!resp && resp.ok;
    const detail = resp && !resp.ok ? `${resp.status}: ${(await resp.text().catch(() => '')).slice(0, 200)}` : resp ? null : 'network_error';
    console.log(JSON.stringify({ fn: 'demoday-app-send-code', decision: ok ? 'sent' : 'send_failed', ...(detail ? { resend: detail } : {}) }));
    return json(ok ? { ok: true } : { error: 'email_unavailable' });
  } catch (e) {
    console.log(JSON.stringify({ fn: 'demoday-app-send-code', decision: 'error', error: String(e).slice(0, 200) }));
    return json({ error: 'internal' });
  }
});
