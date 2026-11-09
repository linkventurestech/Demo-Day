import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { api, ApiError, type AttendeeSession, type InterestId, type PublicData } from '../lib/api';
import { buildLineup } from '../lib/lineup';
import { errorMessage } from '../lib/errors';
import { loadSession, storeSession } from './session';
import { Login } from './Login';
import { Home } from './Home';
import { Detail } from './Detail';
import { Jury } from './Jury';
import { Stands } from './Stands';

export interface Draft {
  score: number;
  flags: InterestId[];
}

type Screen =
  | { name: 'home' }
  | { name: 'detail'; id: string; from?: 'map' }
  | { name: 'jury' }
  | { name: 'map'; focus: number | null };

export function PublicApp() {
  const [data, setData] = useState<PublicData | null>(null);
  const [loadError, setLoadError] = useState('');
  const [session, setSession] = useState<AttendeeSession | null>(loadSession);
  const [screen, setScreen] = useState<Screen>({ name: 'home' });
  const [drafts, setDrafts] = useState<Record<string, Draft>>({});
  const [sent, setSent] = useState<Record<string, boolean>>({});
  const [loginNotice, setLoginNotice] = useState('');
  const scrollPos = useRef(0);

  const logout = useCallback((notice = '') => {
    storeSession(null);
    setSession(null);
    setDrafts({});
    setSent({});
    setScreen({ name: 'home' });
    setLoginNotice(notice);
  }, []);

  const loadData = useCallback(() => {
    api.getPublicData().then(setData, (e) => setLoadError(errorMessage(e)));
  }, []);

  useEffect(loadData, [loadData]);

  // Recarrega o conteúdo ao voltar para o app (a organização pode ter mudado a ordem).
  useEffect(() => {
    const onVis = () => document.visibilityState === 'visible' && loadData();
    document.addEventListener('visibilitychange', onVis);
    return () => document.removeEventListener('visibilitychange', onVis);
  }, [loadData]);

  // Avaliações já enviadas por este e-mail (vale em qualquer aparelho).
  useEffect(() => {
    if (!session) return;
    api.myRatings(session.token).then(
      (rs) => {
        const d: Record<string, Draft> = {};
        const s: Record<string, boolean> = {};
        for (const r of rs) {
          d[r.startup_id] = { score: r.score ?? 0, flags: r.interests };
          s[r.startup_id] = true;
        }
        setDrafts(d);
        setSent(s);
      },
      (e) => {
        if (e instanceof ApiError && e.code === 'invalid_session') logout('Seu acesso foi encerrado. Entre novamente com o e-mail cadastrado.');
      },
    );
  }, [session, logout]);

  const blocks = useMemo(() => (data ? buildLineup(data.categories, data.startups) : []), [data]);

  if (!session) {
    return (
      <div className="pub">
        <Login
          settings={data?.settings}
          notice={loginNotice}
          onLogin={(s) => {
            storeSession(s);
            setLoginNotice('');
            setSession(s);
          }}
        />
      </div>
    );
  }

  if (!data) {
    return (
      <div className="pub">
        <div className="center-msg">{loadError || 'Carregando…'}</div>
      </div>
    );
  }

  const updateDraft = (id: string, next: Draft) => {
    setDrafts((d) => ({ ...d, [id]: next }));
    setSent((s) => ({ ...s, [id]: false }));
  };

  const submit = async (id: string) => {
    const d = drafts[id] ?? { score: 0, flags: [] };
    try {
      await api.submitRating(session.token, id, d.score || null, d.flags);
      setSent((s) => ({ ...s, [id]: true }));
    } catch (e) {
      if (e instanceof ApiError && e.code === 'invalid_session') logout('Seu acesso foi encerrado. Entre novamente com o e-mail cadastrado.');
      else if (e instanceof ApiError && e.code === 'voting_closed') loadData();
      throw e;
    }
  };

  const goHome = () => setScreen({ name: 'home' });
  const startup = screen.name === 'detail' ? data.startups.find((s) => s.id === screen.id) : undefined;

  return (
    <div className="pub">
      {screen.name === 'detail' && startup ? (
        <Detail
          startup={startup}
          blocks={blocks}
          draft={drafts[startup.id] ?? { score: 0, flags: [] }}
          sent={!!sent[startup.id]}
          votingOpen={data.settings.voting_open}
          onChange={(d) => updateDraft(startup.id, d)}
          onSubmit={() => submit(startup.id)}
          backLabel={screen.from === 'map' ? 'Mapa' : 'Ordem'}
          onBack={() => (screen.from === 'map' ? setScreen({ name: 'map', focus: startup.stand }) : goHome())}
          onMap={() => setScreen({ name: 'map', focus: startup.stand })}
        />
      ) : screen.name === 'map' ? (
        <Stands
          settings={data.settings}
          startups={data.startups}
          focus={screen.focus}
          sent={sent}
          onOpen={(id) => setScreen({ name: 'detail', id, from: 'map' })}
          onBack={goHome}
        />
      ) : screen.name === 'jury' ? (
        <Jury settings={data.settings} jurors={data.jurors} onBack={goHome} />
      ) : (
        <Home
          settings={data.settings}
          blocks={blocks}
          hasJury={data.jurors.length > 0}
          drafts={drafts}
          sent={sent}
          email={session.email}
          initialScroll={scrollPos.current}
          onScrollPos={(y) => (scrollPos.current = y)}
          onOpen={(id) => setScreen({ name: 'detail', id })}
          onJury={() => setScreen({ name: 'jury' })}
          onMap={() => setScreen({ name: 'map', focus: null })}
          onLogout={() => logout()}
        />
      )}
    </div>
  );
}
