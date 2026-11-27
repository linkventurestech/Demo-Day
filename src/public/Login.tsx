import { useEffect, useRef, useState } from 'react';
import { api, ApiError, type AttendeeSession, type EventSettings } from '../lib/api';
import { errorMessage } from '../lib/errors';

const EMAIL = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
const RESEND_AFTER = 30; // segundos, igual ao limite do banco

export function Login({ settings, notice, onLogin }: { settings?: EventSettings; notice: string; onLogin: (s: AttendeeSession) => void }) {
  const [step, setStep] = useState<'email' | 'code'>('email');
  const [email, setEmail] = useState('');
  const [code, setCode] = useState('');
  const [demoCode, setDemoCode] = useState('');
  const [error, setError] = useState('');
  const [info, setInfo] = useState('');
  const [busy, setBusy] = useState(false);
  const [wait, setWait] = useState(0);
  const codeInput = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (wait <= 0) return;
    const t = setTimeout(() => setWait((w) => w - 1), 1000);
    return () => clearTimeout(t);
  }, [wait]);

  const sendCode = async () => {
    const v = email.trim().toLowerCase();
    if (!EMAIL.test(v)) return setError('E-mail inválido.');
    setBusy(true);
    setError('');
    setInfo('');
    try {
      const r = await api.requestCode(v);
      setEmail(v);
      setDemoCode(r.demoCode ?? '');
      setCode('');
      setStep('code');
      setWait(RESEND_AFTER);
      setTimeout(() => codeInput.current?.focus(), 0);
    } catch (err) {
      // Já pediu um código há pouco: segue para a tela do código, que continua valendo.
      if (err instanceof ApiError && err.code === 'rate_limited' && step === 'email') {
        setEmail(v);
        setStep('code');
        setInfo('Já enviamos um código há pouco. Use o último que chegou.');
      } else setError(errorMessage(err));
    } finally {
      setBusy(false);
    }
  };

  const verify = async () => {
    const c = code.replace(/\D/g, '');
    if (c.length !== 6) return setError('O código tem 6 dígitos.');
    setBusy(true);
    setError('');
    try {
      onLogin(await api.verifyCode(email, c));
    } catch (err) {
      setError(errorMessage(err));
      if (err instanceof ApiError && (err.code === 'too_many_attempts' || err.code === 'code_expired')) setCode('');
    } finally {
      setBusy(false);
    }
  };

  const shown = error || (step === 'email' ? notice : '');
  return (
    <div className="login">
      <div className="orb" aria-hidden="true" />
      <p className="mono">Link Ventures</p>
      <h1>{settings?.name ?? 'Demo Day'}</h1>
      <p className="lead">{settings?.tagline ?? 'Acompanhe a ordem dos pitchs, avalie as startups e sinalize seu interesse.'}</p>

      {step === 'email' ? (
        <form
          onSubmit={(e) => {
            e.preventDefault();
            sendCode();
          }}
          noValidate
        >
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
          <p className="hint">Apenas pessoas inscritas no Demo Day têm acesso. Vamos enviar um código para confirmar que é você.</p>
          <button type="submit" className="btn-gold" disabled={busy}>
            {busy ? 'Enviando…' : 'Enviar código'}
          </button>
        </form>
      ) : (
        <form
          onSubmit={(e) => {
            e.preventDefault();
            verify();
          }}
          noValidate
        >
          <label htmlFor="login-code" className="mono">
            Código enviado para {email}
          </label>
          <input
            id="login-code"
            ref={codeInput}
            className={'code-input' + (error ? ' err' : '')}
            type="text"
            inputMode="numeric"
            autoComplete="one-time-code"
            pattern="[0-9]*"
            maxLength={6}
            placeholder="000000"
            value={code}
            aria-invalid={!!error}
            onChange={(e) => {
              const v = e.target.value.replace(/\D/g, '').slice(0, 6);
              setCode(v);
              setError('');
            }}
          />
          {demoCode && <p className="hint demo-code">Modo demonstração: o código é {demoCode}</p>}
          {info && !error && <p className="hint">{info}</p>}
          {error && (
            <p role="alert" className="alert">
              {error}
            </p>
          )}
          <p className="hint">Vale por 10 minutos. Não chegou? Confira o spam ou peça outro.</p>
          <button type="submit" className="btn-gold" disabled={busy || code.length !== 6}>
            {busy ? 'Conferindo…' : 'Entrar'}
          </button>
          <div className="login-links">
            <button type="button" className="linkbtn light" disabled={busy || wait > 0} onClick={sendCode}>
              {wait > 0 ? `Reenviar código em ${wait}s` : 'Reenviar código'}
            </button>
            <button
              type="button"
              className="linkbtn light"
              onClick={() => {
                setStep('email');
                setCode('');
                setError('');
                setInfo('');
              }}
            >
              Trocar e-mail
            </button>
          </div>
        </form>
      )}
      {api.mode === 'demo' && (
        <p className="demo-badge">
          Modo demonstração · teste com demo@lsb.edu.br · <a href="#admin">Abrir painel admin</a>
        </p>
      )}
    </div>
  );
}
