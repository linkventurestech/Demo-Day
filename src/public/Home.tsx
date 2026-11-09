import { useEffect, useRef, useState } from 'react';
import type { EventSettings } from '../lib/api';
import type { Block } from '../lib/lineup';
import { Chevron, Logo } from '../ui';
import type { Draft } from './PublicApp';

interface Props {
  settings: EventSettings;
  blocks: Block[];
  hasJury: boolean;
  drafts: Record<string, Draft>;
  sent: Record<string, boolean>;
  email: string;
  initialScroll: number;
  onScrollPos: (y: number) => void;
  onOpen: (id: string) => void;
  onJury: () => void;
  onMap: () => void;
  onLogout: () => void;
}

export function Home({ settings, blocks, hasJury, drafts, sent, email, initialScroll, onScrollPos, onOpen, onJury, onMap, onLogout }: Props) {
  const scroller = useRef<HTMLDivElement>(null);
  const nav = useRef<HTMLElement>(null);
  const [active, setActive] = useState(blocks[0]?.category.id ?? '');

  useEffect(() => {
    if (scroller.current) scroller.current.scrollTop = initialScroll;
    // só na montagem: volta para onde a pessoa estava na ordem
  }, []);

  const onScroll = () => {
    const sc = scroller.current;
    if (!sc) return;
    onScrollPos(sc.scrollTop);
    const navH = nav.current?.offsetHeight ?? 0;
    const secs = sc.querySelectorAll<HTMLElement>('[data-blk]');
    let cur = secs[0]?.dataset.blk ?? '';
    secs.forEach((s) => {
      if (s.offsetTop - sc.scrollTop <= navH + 24) cur = s.dataset.blk!;
    });
    if (sc.scrollTop + sc.clientHeight >= sc.scrollHeight - 2 && secs.length) cur = secs[secs.length - 1].dataset.blk!;
    if (cur !== active) setActive(cur);
  };

  const jump = (id: string) => {
    const sc = scroller.current;
    const target = sc?.querySelector<HTMLElement>(`[data-blk="${id}"]`);
    if (sc && target) sc.scrollTo({ top: target.offsetTop - (nav.current?.offsetHeight ?? 0), behavior: 'smooth' });
    setActive(id);
  };

  return (
    <div className="scroller" ref={scroller} onScroll={onScroll}>
      <header className="pub-header">
        <div className="row">
          <p className="mono">Link Ventures</p>
          <button type="button" className="linkbtn" onClick={onLogout} title={email}>
            Sair
          </button>
        </div>
        <h1 className="title">{settings.name}</h1>
        <div className="pill-row">
          <button type="button" className="pill-outline" onClick={onMap}>
            Mapa dos stands
            <Chevron />
          </button>
          {hasJury && (
            <button type="button" className="pill-outline" onClick={onJury}>
              Conheça os jurados
              <Chevron />
            </button>
          )}
        </div>
      </header>

      {blocks.length > 0 && (
        <nav className="tabs-nav" ref={nav} aria-label="Ir para o bloco">
          <div className="tabs" style={{ gridTemplateColumns: `repeat(${blocks.length}, minmax(0, 1fr))` }}>
            {blocks.map((b) => (
              <button key={b.category.id} type="button" className="tab" aria-current={b.category.id === active} onClick={() => jump(b.category.id)}>
                {b.category.name}
              </button>
            ))}
          </div>
        </nav>
      )}

      <main className="lineup">
        {blocks.map((b) => (
          <section key={b.category.id} data-blk={b.category.id} className="block">
            <div className="block-head">
              <h2>{b.category.name}</h2>
              <span>{b.info}</span>
            </div>
            <ol className="slots">
              {b.slots.map((slot, i) => {
                const s = slot.startup;
                const d = s ? drafts[s.id] : undefined;
                return (
                  <li key={slot.num} className="slot">
                    <div className="rail">
                      <span aria-hidden="true" className={'ln' + (i > 0 ? ' on' : '')} />
                      <span className={'node' + (s ? ' filled' : '')}>{slot.num}</span>
                      <span aria-hidden="true" className={'ln' + (i < b.slots.length - 1 ? ' on' : '')} />
                    </div>
                    <div className="slot-body">
                      {s ? (
                        <button type="button" className="slot-card" onClick={() => onOpen(s.id)}>
                          <Logo name={s.name} url={s.logo_url} size={34} />
                          <span className="nm">{s.name}</span>
                          {sent[s.id] && <span className="ok">✓ {d?.score ? d.score + '/5' : 'Enviado'}</span>}
                          <Chevron color="#546484" />
                        </button>
                      ) : (
                        <span className="slot-empty">A definir</span>
                      )}
                    </div>
                  </li>
                );
              })}
            </ol>
          </section>
        ))}
      </main>
    </div>
  );
}
