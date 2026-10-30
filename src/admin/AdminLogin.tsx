import { useState } from 'react';
import { api } from '../lib/api';
import { errorMessage } from '../lib/errors';

export function AdminLogin({ initialError = '', onLogin }: { initialError?: string; onLogin: (email: string) => void }) {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState(initialError);
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
        {api.adminSignInWithGoogle && (
          <>
            <button
              type="button"
              className="btn-gold"
              style={{ marginTop: 32 }}
              onClick={() => api.adminSignInWithGoogle!().catch((e) => setError(errorMessage(e)))}
            >
              Entrar com Google
            </button>
            <p className="hint" style={{ marginTop: 12 }}>
              Mesma conta do portfolio da Link. Ou entre com e-mail e senha:
            </p>
          </>
        )}
        <form onSubmit={submit} style={api.adminSignInWithGoogle ? { marginTop: 16 } : undefined}>
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
          <button type="submit" className={api.adminSignInWithGoogle ? 'btn-gold outline' : 'btn-gold'} disabled={busy}>
            {busy ? 'Entrando…' : 'Entrar no painel'}
          </button>
          <p className="hint">
            {api.mode === 'demo'
              ? 'Modo demonstração: qualquer e-mail entra. Os dados ficam só neste navegador.'
              : 'Acesso para quem é admin ou link_staff no portfolio da Link.'}
          </p>
        </form>
      </div>
    </div>
  );
}
