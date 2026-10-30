import { useState } from 'react';
import { api } from '../lib/api';
import { errorMessage } from '../lib/errors';

export function AdminLogin({ onLogin }: { onLogin: (email: string) => void }) {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [busy, setBusy] = useState(false);

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    setBusy(true);
    setError('');
    try {
      await api.adminSignIn(email, password);
      onLogin((await api.adminCurrent()) ?? email);
    } catch (err) {
      setError(errorMessage(err));
    } finally {
      setBusy(false);
    }
  };

  return (
    <div className="adm-login">
      <div className="orb" aria-hidden="true" />
      <div className="box">
        <p className="mono">Link Ventures · Admin</p>
        <h1>Demo Day</h1>
        <form onSubmit={submit}>
          <label className="mono" htmlFor="adm-email">
            E-mail
          </label>
          <input id="adm-email" type="email" autoComplete="username" value={email} onChange={(e) => setEmail(e.target.value)} required />
          <label className="mono" htmlFor="adm-pass" style={{ marginTop: 8 }}>
            Senha
          </label>
          <input id="adm-pass" type="password" autoComplete="current-password" value={password} onChange={(e) => setPassword(e.target.value)} required={api.mode !== 'demo'} />
          {error && (
            <p role="alert" className="alert">
              {error}
            </p>
          )}
          <button type="submit" className="btn-gold" disabled={busy}>
            {busy ? 'Entrando…' : 'Entrar no painel'}
          </button>
          <p className="hint">
            {api.mode === 'demo'
              ? 'Modo demonstração: qualquer e-mail entra. Os dados ficam só neste navegador.'
              : 'Acesso restrito à equipe da Link. Contas são criadas no Supabase e liberadas na tabela de admins.'}
          </p>
        </form>
      </div>
    </div>
  );
}
