import { useMemo, useState } from 'react';
import { INTERESTS, interestLabel } from '../lib/api';
import { download, toCsv } from '../lib/csv';
import { buildLineup, pitchIndex } from '../lib/lineup';
import { fmtDate } from '../lib/format';
import { aggregate, fmtAvg } from '../lib/results';
import { Logo } from '../ui';
import { PageHead, type PageProps } from './AdminApp';

type Sort = 'pitch' | 'avg' | 'votes' | 'connections';

export function Results({ data, reload }: PageProps) {
  const [sort, setSort] = useState<Sort>('pitch');
  const [sel, setSel] = useState<string | null>(null);

  const idx = useMemo(() => pitchIndex(buildLineup(data.categories, data.startups)), [data]);
  const rows = useMemo(() => {
    const r = aggregate(data.startups, data.ratings);
    const num = (id: string) => idx[id]?.num ?? '99';
    return r.sort((a, b) => {
      if (sort === 'avg') return (b.avg ?? -1) - (a.avg ?? -1) || b.votes - a.votes;
      if (sort === 'votes') return b.votes - a.votes;
      if (sort === 'connections') return b.connections - a.connections;
      return num(a.startup.id).localeCompare(num(b.startup.id));
    });
  }, [data, idx, sort]);

  const attendeesById = useMemo(() => new Map(data.attendees.map((a) => [a.id, a])), [data.attendees]);
  const raters = new Set(data.ratings.map((r) => r.attendee_id)).size;
  const loggedIn = data.attendees.filter((a) => a.last_login_at).length;
  const connections = data.ratings.filter((r) => r.interests.length).length;
  const selected = rows.find((r) => r.startup.id === sel);
  const selRatings = sel ? data.ratings.filter((r) => r.startup_id === sel) : [];

  const exportAll = () => {
    const byS = new Map(data.startups.map((s) => [s.id, s]));
    download(
      'demo-day-respostas.csv',
      toCsv(
        ['pitch', 'bloco', 'startup', 'email', 'nome', 'empresa', 'nota', ...INTERESTS.map((i) => i.label), 'enviado_em'],
        data.ratings.map((r) => {
          const a = attendeesById.get(r.attendee_id);
          const s = byS.get(r.startup_id);
          return [
            idx[r.startup_id]?.num ?? '',
            idx[r.startup_id]?.cat ?? '',
            s?.name ?? '',
            a?.email ?? '',
            a?.name ?? '',
            a?.company ?? '',
            r.score ?? '',
            ...INTERESTS.map((i) => (r.interests.includes(i.id) ? 'sim' : '')),
            new Date(r.updated_at).toLocaleString('pt-BR'),
          ];
        }),
      ),
    );
  };

  const th = (key: Sort, label: string, num = true) => (
    <th className={(num ? 'num ' : '') + 'sortable'} onClick={() => setSort(key)} aria-sort={sort === key ? 'descending' : undefined}>
      {label}
      {sort === key ? ' ↓' : ''}
    </th>
  );

  return (
    <>
      <PageHead kicker="Ao vivo · atualiza a cada 15s" title="Resultados" sub="Notas e interesses por startup. Clique numa linha para ver quem avaliou.">
        <button className="btn ghost" onClick={reload}>
          Atualizar
        </button>
        <button className="btn dark" onClick={exportAll} disabled={!data.ratings.length}>
          Exportar respostas (CSV)
        </button>
      </PageHead>

      <div className="kpis">
        <div className="kpi">
          <p className="mono">Inscritos</p>
          <b>{data.attendees.length}</b>
          <small>e-mails com acesso</small>
        </div>
        <div className="kpi">
          <p className="mono">Acessaram</p>
          <b>{loggedIn}</b>
          <small>{data.attendees.length ? Math.round((loggedIn / data.attendees.length) * 100) : 0}% dos inscritos</small>
        </div>
        <div className="kpi">
          <p className="mono">Avaliadores</p>
          <b>{raters}</b>
          <small>enviaram ao menos uma</small>
        </div>
        <div className="kpi">
          <p className="mono">Avaliações</p>
          <b>{data.ratings.length}</b>
          <small>{data.ratings.filter((r) => r.score).length} com nota</small>
        </div>
        <div className="kpi">
          <p className="mono">Pedidos de conexão</p>
          <b>{connections}</b>
          <small>{data.ratings.filter((r) => r.interests.includes('invest')).length} querem investir</small>
        </div>
      </div>

      <div className={selected ? 'split' : ''}>
        <div className="card">
          {rows.length === 0 ? (
            <div className="empty">Nenhuma startup cadastrada ainda.</div>
          ) : (
            <table className="tbl">
              <thead>
                <tr>
                  {th('pitch', 'Pitch', false)}
                  <th>Startup</th>
                  {th('avg', 'Média')}
                  {th('votes', 'Notas')}
                  <th>Distribuição 1–5</th>
                  {!selected && INTERESTS.map((i) => <th key={i.id} className="num">{i.label}</th>)}
                  {th('connections', 'Conexões')}
                </tr>
              </thead>
              <tbody>
                {rows.map((r) => {
                  const max = Math.max(...r.dist, 1);
                  return (
                    <tr key={r.startup.id} className={'click' + (sel === r.startup.id ? ' sel' : '')} onClick={() => setSel(sel === r.startup.id ? null : r.startup.id)}>
                      <td>
                        <span className="pitchno">{idx[r.startup.id]?.num ?? '—'}</span>
                      </td>
                      <td>
                        <div className="cell-co">
                          <Logo name={r.startup.name} url={r.startup.logo_url} size={28} radius={6} />
                          <span>
                            {r.startup.name}
                            <div className="muted small" style={{ fontWeight: 400 }}>
                              {idx[r.startup.id]?.cat}
                            </div>
                          </span>
                        </div>
                      </td>
                      <td className="num avg">{fmtAvg(r.avg)}</td>
                      <td className="num">{r.votes}</td>
                      <td>
                        <div className="dist" title={r.dist.map((n, i) => `${i + 1}: ${n}`).join(' · ')}>
                          {r.dist.map((n, i) => (
                            <span key={i} className={n ? '' : 'z'} style={{ height: `${Math.max((n / max) * 100, 8)}%` }} />
                          ))}
                        </div>
                      </td>
                      {!selected &&
                        INTERESTS.map((i) => (
                          <td key={i.id} className={'num' + (r.interests[i.id] ? '' : ' zero')}>
                            {r.interests[i.id]}
                          </td>
                        ))}
                      <td className="num" style={{ fontWeight: 700 }}>
                        {r.connections}
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          )}
        </div>

        {selected && (
          <div className="card panel">
            <div className="card-head">
              <div className="cell-co">
                <Logo name={selected.startup.name} url={selected.startup.logo_url} size={32} radius={6} />
                <div>
                  <h3>{selected.startup.name}</h3>
                  <span className="muted small" style={{ fontWeight: 400 }}>
                    Pitch {idx[selected.startup.id]?.num} · média {fmtAvg(selected.avg)} · {selected.responses} respostas
                  </span>
                </div>
              </div>
              <button className="btn sm ghost" onClick={() => setSel(null)}>
                Fechar
              </button>
            </div>
            <div className="card-pad" style={{ gap: 8 }}>
              <div className="chips">
                {INTERESTS.map((i) => (
                  <span key={i.id} className="chip">
                    {i.label} · {selected.interests[i.id]}
                  </span>
                ))}
              </div>
            </div>
            {selRatings.length === 0 ? (
              <div className="empty">Ninguém avaliou ainda.</div>
            ) : (
              <table className="tbl">
                <thead>
                  <tr>
                    <th>Pessoa</th>
                    <th className="num">Nota</th>
                    <th>Interesses</th>
                  </tr>
                </thead>
                <tbody>
                  {selRatings.map((r) => {
                    const a = attendeesById.get(r.attendee_id);
                    return (
                      <tr key={r.attendee_id}>
                        <td>
                          <div style={{ fontWeight: 600 }}>{a?.name || a?.email}</div>
                          <div className="muted small">{a?.name ? a.email : a?.company}</div>
                          <div className="muted small">{fmtDate(r.updated_at)}</div>
                        </td>
                        <td className="num avg">{r.score ?? '—'}</td>
                        <td>
                          <div className="chips">
                            {r.interests.map((i) => (
                              <span key={i} className={'chip' + (i === 'invest' ? ' invest' : '')}>
                                {interestLabel(i)}
                              </span>
                            ))}
                          </div>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            )}
          </div>
        )}
      </div>
    </>
  );
}
