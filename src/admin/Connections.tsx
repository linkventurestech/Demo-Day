import { useMemo, useState } from 'react';
import { INTERESTS, interestLabel, type InterestId } from '../lib/api';
import { download, toCsv } from '../lib/csv';
import { buildLineup, pitchIndex } from '../lib/lineup';
import { fmtDate } from '../lib/format';
import { connectionRows } from '../lib/results';
import { Logo } from '../ui';
import { PageHead, type PageProps } from './AdminApp';

export function Connections({ data, reload }: PageProps) {
  const [startup, setStartup] = useState('');
  const [interest, setInterest] = useState<InterestId | ''>('');
  const [q, setQ] = useState('');

  const idx = useMemo(() => pitchIndex(buildLineup(data.categories, data.startups)), [data]);
  const all = useMemo(() => connectionRows(data.ratings, data.attendees, data.startups), [data]);
  const rows = all.filter((r) => {
    if (startup && r.rating.startup_id !== startup) return false;
    if (interest && !r.rating.interests.includes(interest)) return false;
    if (q) {
      const t = q.toLowerCase();
      const a = r.attendee;
      if (![a?.email, a?.name, a?.company, r.startup?.name].some((v) => v?.toLowerCase().includes(t))) return false;
    }
    return true;
  });

  const startupsSorted = [...data.startups].sort((a, b) => (idx[a.id]?.num ?? '').localeCompare(idx[b.id]?.num ?? ''));

  const exportCsv = () =>
    download(
      'demo-day-conexoes.csv',
      toCsv(
        ['startup', 'pitch', 'email', 'nome', 'empresa', 'interesses', 'nota', 'enviado_em'],
        rows.map((r) => [
          r.startup?.name ?? '',
          idx[r.rating.startup_id]?.num ?? '',
          r.attendee?.email ?? '',
          r.attendee?.name ?? '',
          r.attendee?.company ?? '',
          r.rating.interests.map(interestLabel).join(', '),
          r.rating.score ?? '',
          new Date(r.rating.updated_at).toLocaleString('pt-BR'),
        ]),
      ),
    );

  return (
    <>
      <PageHead kicker="Quem quer falar com quem" title="Conexões" sub="Cada linha é uma pessoa que sinalizou interesse numa startup.">
        <button className="btn ghost" onClick={reload}>
          Atualizar
        </button>
        <button className="btn dark" onClick={exportCsv} disabled={!rows.length}>
          Exportar {rows.length !== all.length ? 'filtro' : 'tudo'} (CSV)
        </button>
      </PageHead>

      <div className="toolbar">
        <input className="input search" placeholder="Buscar pessoa, empresa ou startup" value={q} onChange={(e) => setQ(e.target.value)} />
        <select className="select" style={{ width: 220 }} value={startup} onChange={(e) => setStartup(e.target.value)} aria-label="Startup">
          <option value="">Todas as startups</option>
          {startupsSorted.map((s) => (
            <option key={s.id} value={s.id}>
              {idx[s.id]?.num} · {s.name}
            </option>
          ))}
        </select>
        <div className="chips" role="group" aria-label="Interesse">
          <button className={'chip filter-chip' + (interest === '' ? ' on' : '')} onClick={() => setInterest('')}>
            Todos · {all.length}
          </button>
          {INTERESTS.map((i) => (
            <button key={i.id} className={'chip filter-chip' + (interest === i.id ? ' on' : '')} onClick={() => setInterest(interest === i.id ? '' : i.id)}>
              {i.label} · {all.filter((r) => r.rating.interests.includes(i.id)).length}
            </button>
          ))}
        </div>
      </div>

      <div className="card">
        {rows.length === 0 ? (
          <div className="empty">{all.length ? 'Nenhum pedido com esses filtros.' : 'Nenhum pedido de conexão ainda.'}</div>
        ) : (
          <table className="tbl">
            <thead>
              <tr>
                <th>Pessoa</th>
                <th>Empresa</th>
                <th>Startup</th>
                <th>Interesses</th>
                <th className="num">Nota</th>
                <th>Quando</th>
              </tr>
            </thead>
            <tbody>
              {rows.map((r) => (
                <tr key={r.rating.attendee_id + r.rating.startup_id}>
                  <td>
                    <div style={{ fontWeight: 600 }}>{r.attendee?.name || '—'}</div>
                    <a className="small" href={'mailto:' + r.attendee?.email}>
                      {r.attendee?.email}
                    </a>
                  </td>
                  <td className="muted">{r.attendee?.company || '—'}</td>
                  <td>
                    {r.startup && (
                      <div className="cell-co">
                        <Logo name={r.startup.name} url={r.startup.logo_url} size={24} radius={6} />
                        {r.startup.name}
                      </div>
                    )}
                  </td>
                  <td>
                    <div className="chips">
                      {r.rating.interests.map((i) => (
                        <span key={i} className={'chip' + (i === 'invest' ? ' invest' : '')}>
                          {interestLabel(i)}
                        </span>
                      ))}
                    </div>
                  </td>
                  <td className="num">{r.rating.score ?? '—'}</td>
                  <td className="muted small nowrap">{fmtDate(r.rating.updated_at)}</td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>
    </>
  );
}
