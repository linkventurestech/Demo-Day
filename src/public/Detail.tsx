import { useState } from 'react';
import { INTERESTS, type Startup } from '../lib/api';
import { errorMessage } from '../lib/errors';
import { initials, pitchIndex, type Block } from '../lib/lineup';
import { Check, Chevron, Logo } from '../ui';
import type { Draft } from './PublicApp';

const LABELS = ['Toque para avaliar', 'Fraco', 'Regular', 'Bom', 'Muito bom', 'Excelente'];

interface Props {
  startup: Startup;
  blocks: Block[];
  draft: Draft;
  sent: boolean;
  votingOpen: boolean;
  onChange: (d: Draft) => void;
  onSubmit: () => Promise<void>;
  onBack: () => void;
}

export function Detail({ startup: co, blocks, draft, sent, votingOpen, onChange, onSubmit, onBack }: Props) {
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState('');
  const meta = pitchIndex(blocks)[co.id];
  const canSend = votingOpen && (draft.score > 0 || draft.flags.length > 0);

  const change = (d: Draft) => {
    setError('');
    onChange(d);
  };

  const send = async () => {
    if (!canSend || busy) return;
    setBusy(true);
    setError('');
    try {
      await onSubmit();
    } catch (e) {
      setError(errorMessage(e));
    } finally {
      setBusy(false);
    }
  };

  return (
    <div className="screen">
      <div className="topbar">
        <button type="button" className="backbtn" onClick={onBack}>
          <Chevron dir="left" size={20} />
          Ordem
        </button>
        {meta && (
          <span className="mono">
            Pitch {meta.num} · {meta.cat}
          </span>
        )}
      </div>

      <div className="detail-body">
        <div className="detail-head">
          <Logo name={co.name} url={co.logo_url} size={60} radius={12} alt={'Logo da ' + co.name} />
          <div style={{ minWidth: 0 }}>
            <h1>{co.name}</h1>
            {co.tagline && <p>{co.tagline}</p>}
          </div>
        </div>

        {co.summary && <p className="summary">{co.summary}</p>}

        {co.founders.length > 0 && (
          <section>
            <p className="mono sec-label">Founders</p>
            <div className="founders">
              {co.founders.map((p, i) => (
                <div key={i} className="founder">
                  <span aria-hidden="true" className="avatar">
                    {initials(p.name)}
                  </span>
                  <span className="n">{p.name}</span>
                  <span className="r">{p.role}</span>
                </div>
              ))}
            </div>
          </section>
        )}

        <section>
          <div className="score-head">
            <p className="mono">Sua nota</p>
            <span>{LABELS[draft.score]}</span>
          </div>
          <div role="group" aria-label="Nota de 1 a 5" className="scores">
            {[1, 2, 3, 4, 5].map((n) => {
              const on = draft.score === n;
              return (
                <button key={n} type="button" className="score" aria-pressed={on} disabled={!votingOpen} onClick={() => change({ ...draft, score: on ? 0 : n })}>
                  {n}
                </button>
              );
            })}
          </div>
        </section>

        <section>
          <p className="mono sec-label">Tenho interesse em</p>
          <div className="flags">
            {INTERESTS.map((f) => {
              const on = draft.flags.includes(f.id);
              return (
                <button
                  key={f.id}
                  type="button"
                  className={'flag' + (f.wide ? ' wide' : '')}
                  aria-pressed={on}
                  disabled={!votingOpen}
                  onClick={() => change({ ...draft, flags: on ? draft.flags.filter((x) => x !== f.id) : [...draft.flags, f.id] })}
                >
                  {on && <Check />}
                  {f.label}
                </button>
              );
            })}
          </div>
        </section>
      </div>

      <div className="cta-wrap">
        {error && (
          <p role="alert" className="inline-error">
            {error}
          </p>
        )}
        {sent ? (
          <button type="button" className="cta sent" onClick={onBack}>
            <Check size={18} color="#1E7A4D" />
            Enviada · voltar para a ordem
          </button>
        ) : (
          <button type="button" className="cta" disabled={!canSend || busy} onClick={send}>
            {!votingOpen ? 'Votação encerrada' : busy ? 'Enviando…' : 'Enviar avaliação'}
          </button>
        )}
      </div>
    </div>
  );
}
