import { jurorTitle, type EventSettings, type Juror } from '../lib/api';
import { initials, shortName } from '../lib/lineup';
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
        <h1 className="title">Conheça os jurados</h1>
        <p className="lead">Quem avalia os pitchs do dia.</p>
        <ul>
          {jurors.map((j) => (
            <li key={j.id} className="juror">
              {j.photo_url ? (
                <img className="ph" src={j.photo_url} alt={'Foto de ' + j.name} loading="lazy" />
              ) : (
                <span aria-hidden="true" className="ph initials">
                  {initials(shortName(j.name))}
                </span>
              )}
              <div className="who">
                <b>{j.name}</b>
                {jurorTitle(j) && <span className="title-line">{jurorTitle(j)}</span>}
                {j.bio && <p className="bio">{j.bio}</p>}
                {j.linkedin_url && (
                  <a className="li" href={j.linkedin_url} target="_blank" rel="noreferrer">
                    LinkedIn ↗
                  </a>
                )}
              </div>
            </li>
          ))}
        </ul>
      </div>
    </div>
  );
}
