import type { EventSettings, Startup } from '../lib/api';
import { pad } from '../lib/lineup';
import { STAND_COUNT, standOccupants } from '../lib/stands';
import { Chevron, Logo } from '../ui';
import { StandMap } from './StandMap';

interface Props {
  settings: EventSettings;
  startups: Startup[];
  focus: number | null;
  sent: Record<string, boolean>;
  onOpen: (id: string) => void;
  onBack: () => void;
}

export function Stands({ settings, startups, focus, sent, onOpen, onBack }: Props) {
  const who = standOccupants(startups);
  const taken = [...who.entries()].sort((a, b) => a[0] - b[0]);

  return (
    <div className="screen">
      <div className="topbar">
        <button type="button" className="backbtn" onClick={onBack}>
          <Chevron dir="left" size={20} />
          Ordem
        </button>
      </div>
      <div className="stands">
        <p className="mono">{settings.name}</p>
        <h1 className="title">Mapa dos stands</h1>
        <p className="lead">
          {who.size ? `${who.size} de ${STAND_COUNT} stands do Showcase ocupados. Toque num stand para ver a startup e avaliar.` : 'Os stands do Showcase ainda não foram distribuídos.'}
        </p>

        <StandMap startups={startups} focus={focus} onPick={(s) => onOpen(s.id)} />

        {taken.length > 0 && (
          <ul className="stand-list">
            {taken.map(([n, s]) => (
              <li key={n}>
                <button type="button" className={'slot-card' + (focus === n ? ' focus' : '')} onClick={() => onOpen(s.id)}>
                  <span className="stand-tag">{pad(n)}</span>
                  <Logo name={s.name} url={s.logo_url} size={34} />
                  <span className="nm">{s.name}</span>
                  {sent[s.id] && <span className="ok">✓ Enviado</span>}
                  <Chevron color="#546484" />
                </button>
              </li>
            ))}
          </ul>
        )}
      </div>
    </div>
  );
}
