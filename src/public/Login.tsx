import { useState } from 'react';
import { api, type AttendeeSession, type EventSettings } from '../lib/api';
import { errorMessage } from '../lib/errors';

const EMAIL = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

export function Login({ settings, notice, onLogin }: { settings?: EventSettings; notice: string; onLogin: (s: AttendeeSession) => void }) {
  const [email, setEmail] = useState('');
  const [error, setError] = useState('');
  const [busy, setBusy] = useState(false);

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    const v = email.trim().toLowerCase();
    if (!EMAIL.test(v)) return setError('E-mail inválido.');
    setBusy(true);
    try {
      onLogin(await api.login(v));
    } catch (err) {
      setError(errorMessage(err));
    } finally {
      setBusy(false);
    }
  };

  const shown = error || notice;
  return (
    <div className="login">
      <div className="orb" aria-hidden="true" />
      <p className="mono">Link Ventures</p>
      <h1>{settings?.name ?? 'Demo Day'}</h1>
      <p className="lead">{settings?.tagline ?? 'Acompanhe a ordem dos pitchs, avalie as startups e sinalize seu interesse.'}</p>
      <form onSubmit={submit} noValidate>
        <label htmlFor="login-email" className="mono">
          E-mail cadastrado no evento
        </label>
        <input
          id="login-email"
          type="email"
          autoComplete="email"
          inputMode="email"
          placeholder="voce@empresa.com"
          value={email}
          className={error ? 'err' : ''}
          aria-invalid={!!error}
          onChange={(e) => {
            setEmail(e.target.value);
            setError('');
          }}
        />
        {shown && (
          <p role="alert" className="alert">
            {shown}
          </p>
        )}
        <p className="hint">Apenas pessoas inscritas no Demo Day têm acesso.</p>
        <button type="submit" className="btn-gold" disabled={busy}>
          {busy ? 'Entrando…' : 'Entrar'}
        </button>
      </form>
      {api.mode === 'demo' && (
        <p className="demo-badge">
          Modo demonstração · teste com demo@lsb.edu.br · <a href="#admin">Abrir painel admin</a>
        </p>
      )}
    </div>
  );
}
