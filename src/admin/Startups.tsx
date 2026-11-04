import { useMemo, useState } from 'react';
import { api, type Founder, type Startup } from '../lib/api';
import { errorMessage } from '../lib/errors';
import { toSquareDataUrl } from '../lib/image';
import { buildLineup } from '../lib/lineup';
import { ConfirmButton, Logo } from '../ui';
import { PageHead, type PageProps } from './AdminApp';

type Form = Omit<Startup, 'id'> & { id?: string };

const blank = (category_id: string, position: number): Form => ({
  category_id,
  position,
  name: '',
  tagline: '',
  summary: '',
  logo_url: null,
  founders: [],
});

export function Startups({ data, reload }: PageProps) {
  const blocks = useMemo(() => buildLineup(data.categories, data.startups), [data]);
  const [form, setForm] = useState<Form | null>(null);
  const [busy, setBusy] = useState(false);
  const [err, setErr] = useState('');

  const set = <K extends keyof Form>(k: K, v: Form[K]) => setForm((f) => (f ? { ...f, [k]: v } : f));
  const setFounder = (i: number, patch: Partial<Founder>) => set('founders', form!.founders.map((p, j) => (j === i ? { ...p, ...patch } : p)));

  const open = (f: Form) => {
    setErr('');
    setForm({ ...f, founders: f.founders.map((p) => ({ ...p })) });
  };

  const save = async () => {
    if (!form) return;
    if (!form.name.trim()) return setErr('Dê um nome à startup.');
    setBusy(true);
    setErr('');
    try {
      await api.saveStartup({ ...form, name: form.name.trim(), founders: form.founders.filter((p) => p.name.trim()) });
      await reload();
      setForm(null);
    } catch (e) {
      setErr(errorMessage(e));
    } finally {
      setBusy(false);
    }
  };

  const remove = async () => {
    if (!form?.id) return;
    try {
      await api.deleteStartup(form.id);
      await reload();
      setForm(null);
    } catch (e) {
      setErr(errorMessage(e));
    }
  };

  const nRatings = form?.id ? data.ratings.filter((r) => r.startup_id === form.id).length : 0;
  const removeLabel = nRatings ? `Remover e apagar ${nRatings} avaliação(ões)?` : 'Confirmar remoção';

  const firstFree = () => {
    for (const b of blocks) for (const s of b.slots) if (!s.startup) return blank(b.category.id, s.position);
    const b = blocks[blocks.length - 1];
    return blank(b?.category.id ?? '', (b?.slots.length ?? 0) + 1);
  };

  return (
    <>
      <PageHead kicker="Ordem dos pitchs" title="Startups" sub="Clique numa posição para editar ou preencher. Os blocos e o número de posições ficam em Evento.">
        <button className="btn primary" disabled={!blocks.length} onClick={() => open(firstFree())}>
          + Nova startup
        </button>
      </PageHead>

      <div className={form ? 'split' : ''}>
        <div>
          {blocks.length === 0 && <div className="card empty">Crie um bloco em Evento antes de cadastrar startups.</div>}
          {blocks.map((b) => (
            <div key={b.category.id} className="card">
              <div className="card-head">
                <h3>{b.category.name}</h3>
                <span className="mono">{b.info}</span>
              </div>
              <table className="tbl">
                <tbody>
                  {b.slots.map((s) => (
                    <tr
                      key={s.num}
                      className={'click' + (form && (form.id ? form.id === s.startup?.id : form.category_id === b.category.id && form.position === s.position) ? ' sel' : '')}
                      onClick={() => open(s.startup ?? blank(b.category.id, s.position))}
                    >
                      <td style={{ width: 56 }}>
                        <span className="pitchno">{s.num}</span>
                      </td>
                      <td>
                        {s.startup ? (
                          <div className="cell-co">
                            <Logo name={s.startup.name} url={s.startup.logo_url} size={28} radius={6} />
                            {s.startup.name}
                          </div>
                        ) : (
                          <span className="muted">A definir</span>
                        )}
                      </td>
                      <td className="muted small">{s.startup?.tagline}</td>
                      <td className="muted small num nowrap">{s.startup ? `${s.startup.founders.length} founder(s)` : '+ preencher'}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          ))}
        </div>

        {form && (
          <div className="card panel">
            <div className="card-head">
              <h3>{form.id ? 'Editar startup' : 'Nova startup'}</h3>
              <button className="btn sm ghost" onClick={() => setForm(null)}>
                Fechar
              </button>
            </div>
            <div className="card-pad">
              <div className="logo-edit">
                <Logo name={form.name || '?'} url={form.logo_url} size={60} radius={12} />
                <div className="actions">
                  <label className="btn sm ghost" style={{ cursor: 'pointer' }}>
                    {form.logo_url ? 'Trocar logo' : 'Subir logo'}
                    <input
                      type="file"
                      accept="image/*"
                      hidden
                      onChange={async (e) => {
                        const f = e.target.files?.[0];
                        if (f) set('logo_url', await toSquareDataUrl(f));
                      }}
                    />
                  </label>
                  {form.logo_url && (
                    <button className="btn sm danger" onClick={() => set('logo_url', null)}>
                      Remover
                    </button>
                  )}
                </div>
              </div>
              <label className="field">
                <span>Nome</span>
                <input className="input" value={form.name} onChange={(e) => set('name', e.target.value)} autoFocus />
              </label>
              <div className="grid2">
                <label className="field">
                  <span>Bloco</span>
                  <select className="select" value={form.category_id} onChange={(e) => set('category_id', e.target.value)}>
                    {data.categories.map((c) => (
                      <option key={c.id} value={c.id}>
                        {c.name}
                      </option>
                    ))}
                  </select>
                </label>
                <label className="field">
                  <span>Posição no bloco</span>
                  <input className="input" type="number" min={1} value={form.position} onChange={(e) => set('position', Math.max(1, Number(e.target.value) || 1))} />
                </label>
              </div>
              <label className="field">
                <span>Linha de apoio</span>
                <input className="input" placeholder="Setor · Estágio" value={form.tagline} onChange={(e) => set('tagline', e.target.value)} />
              </label>
              <label className="field">
                <span>Resumo</span>
                <textarea className="textarea" value={form.summary} onChange={(e) => set('summary', e.target.value)} />
              </label>
              <div className="field">
                <span>Founders</span>
                {form.founders.map((p, i) => (
                  <div key={i} className="founder-row">
                    <input className="input" placeholder="Nome" value={p.name} onChange={(e) => setFounder(i, { name: e.target.value })} aria-label="Nome do founder" />
                    <input className="input" placeholder="Cargo" value={p.role} onChange={(e) => setFounder(i, { role: e.target.value })} aria-label="Cargo" />
                    <button className="iconbtn" aria-label="Remover founder" onClick={() => set('founders', form.founders.filter((_, j) => j !== i))}>
                      ×
                    </button>
                  </div>
                ))}
                <button className="btn sm ghost" style={{ alignSelf: 'flex-start' }} onClick={() => set('founders', [...form.founders, { name: '', role: '' }])}>
                  + Founder
                </button>
              </div>
              {err && <div className="notice err">{err}</div>}
              <div className="row-actions" style={{ justifyContent: 'space-between' }}>
                {form.id ? (
                  <ConfirmButton className="btn danger" confirmLabel={removeLabel} onConfirm={remove}>
                    Remover startup
                  </ConfirmButton>
                ) : (
                  <span />
                )}
                <button className="btn primary" onClick={save} disabled={busy}>
                  {busy ? 'Salvando…' : 'Salvar'}
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </>
  );
}
