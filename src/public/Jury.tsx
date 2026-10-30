import type { EventSettings, Juror } from '../lib/api';
import { Chevron } from '../ui';

export function Jury({ settings, jurors, onBack }: { settings: EventSettings; jurors: Juror[]; onBack: () => void }) {
  return (
    <div className="screen">
      <div className="topbar">
        <button type="button" className="backbtn" onClick={onBack}>
          <Chevron dir="left" size={20} />
          Ordem
        </button>
      </div>
      <div className="jury">
        <p className="mono">{settings.name}</p>
        <h1 className="title">Jurados</h1>
        <p className="lead">Quem avalia os pitchs do dia.</p>
        <ul>
          {jurors.map((j) => (
            <li key={j.id}>
              {j.photo_url ? <img className="ph" src={j.photo_url} alt="" /> : <span aria-hidden="true" className="ph" />}
              <span className="who">
                <b>{j.name}</b>
                <span>{j.role}</span>
              </span>
            </li>
          ))}
        </ul>
      </div>
    </div>
  );
}
