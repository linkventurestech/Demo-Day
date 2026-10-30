import { useCallback, useEffect, useState } from 'react';
import { api, type AdminData } from '../lib/api';
import { errorMessage } from '../lib/errors';
import { AdminLogin } from './AdminLogin';
import { Results } from './Results';
import { Connections } from './Connections';
import { Attendees } from './Attendees';
import { Startups } from './Startups';
import { Jurors } from './Jurors';
import { EventPage } from './EventPage';

const PAGES = [
  { id: 'results', label: 'Resultados' },
  { id: 'connections', label: 'Conexões' },
  { id: 'attendees', label: 'Inscritos' },
  { id: 'startups', label: 'Startups' },
  { id: 'jurors', label: 'Jurados' },
  { id: 'event', label: 'Evento' },
] as const;
type PageId = (typeof PAGES)[number]['id'];

export interface PageProps {
  data: AdminData;
  reload: () => Promise<void>;
}

const pageFromHash = (): PageId => {
  const h = location.hash.slice(1);
  return (PAGES.find((p) => p.id === h)?.id ?? 'results') as PageId;
};

export function AdminApp() {
  const [admin, setAdmin] = useState<string | null | undefined>(undefined);
  const [data, setData] = useState<AdminData | null>(null);
  const [error, setError] = useState('');
  const [page, setPage] = useState<PageId>(pageFromHash);
  const [authError, setAuthError] = useState('');

  useEffect(() => {
    api.adminCurrent().then(setAdmin, (e) => {
      setAuthError(errorMessage(e));
      setAdmin(null);
    });
    const onHash = () => setPage(pageFromHash());
    window.addEventListener('hashchange', onHash);
    return () => window.removeEventListener('hashchange', onHash);
  }, []);

  const reload = useCallback(async () => {
    try {
      setData(await api.getAdminData());
      setError('');
    } catch (e) {
      setError(errorMessage(e));
    }
  }, []);

  useEffect(() => {
    if (!admin) return;
    reload();
    // Resultados chegam ao vivo durante o evento.
    const t = setInterval(() => document.visibilityState === 'visible' && reload(), 15000);
    return () => clearInterval(t);
  }, [admin, reload]);

  if (admin === undefined) return null;
  if (!admin) return <AdminLogin initialError={authError} onLogin={setAdmin} />;

  const counts: Partial<Record<PageId, number>> = data
    ? {
        connections: data.ratings.filter((r) => r.interests.length).length,
        attendees: data.attendees.length,
        startups: data.startups.length,
        jurors: data.jurors.length,
      }
    : {};

  const props = data ? { data, reload } : null;

  return (
    <div className="adm">
      <aside className="adm-side">
        <div className="orb" aria-hidden="true" />
        <p className="mono">Link Ventures · Admin</p>
        <h1>{data?.settings.name ?? 'Demo Day'}</h1>
        <nav className="adm-nav" aria-label="Seções">
          {PAGES.map((p) => (
            <button
              key={p.id}
              type="button"
              aria-current={page === p.id ? 'page' : undefined}
              onClick={() => {
                location.hash = p.id;
                setPage(p.id);
              }}
            >
              {p.label}
              {counts[p.id] != null && <span className="count">{counts[p.id]}</span>}
            </button>
          ))}
        </nav>
        <div className="adm-foot">
          {api.mode === 'demo' && <span className="demo">Modo demonstração</span>}
          <span className="who" title={admin}>
            {admin}
          </span>
          <a className="linkbtn" href="/" target="_blank" rel="noreferrer">
            Abrir app do público ↗
          </a>
          <button
            type="button"
            className="linkbtn"
            onClick={async () => {
              await api.adminSignOut();
              setAdmin(null);
              setData(null);
            }}
          >
            Sair
          </button>
        </div>
      </aside>
      <main className="adm-main">
        {error && <div className="notice err" style={{ marginBottom: 16 }}>{error}</div>}
        {!props ? (
          <div className="empty">Carregando…</div>
        ) : page === 'results' ? (
          <Results {...props} />
        ) : page === 'connections' ? (
          <Connections {...props} />
        ) : page === 'attendees' ? (
          <Attendees {...props} />
        ) : page === 'startups' ? (
          <Startups {...props} />
        ) : page === 'jurors' ? (
          <Jurors {...props} />
        ) : (
          <EventPage {...props} />
        )}
      </main>
    </div>
  );
}

export function PageHead({ kicker, title, sub, children }: { kicker: string; title: string; sub?: string; children?: React.ReactNode }) {
  return (
    <header className="adm-head">
      <div>
        <p className="mono">{kicker}</p>
        <h2 className="title">{title}</h2>
        {sub && <p className="sub">{sub}</p>}
      </div>
      {children && <div className="actions">{children}</div>}
    </header>
  );
}
