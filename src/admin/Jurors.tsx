import { useState } from 'react';
import { api, jurorTitle, type Juror } from '../lib/api';
import { errorMessage } from '../lib/errors';
import { toSquareDataUrl } from '../lib/image';
import { ConfirmButton } from '../ui';
import { PageHead, type PageProps } from './AdminApp';

type Form = Omit<Juror, 'id'> & { id?: string };

export function Jurors({ data, reload }: PageProps) {
  const [form, setForm] = useState<Form | null>(null);
  const [busy, setBusy] = useState(false);
  const [err, setErr] = useState('');
  const [note, setNote] = useState('');
  const [syncing, setSyncing] = useState(false);
  const set = <K extends keyof Form>(k: K, v: Form[K]) => setForm((f) => (f ? { ...f, [k]: v } : f));

  const save = async () => {
    if (!form?.name.trim()) return setErr('Informe o nome.');
    setBusy(true);
    setErr('');
    try {
      await api.saveJuror({ ...form, name: form.name.trim() });
      await reload();
      setForm(null);
    } catch (e) {
      setErr(errorMessage(e));
    } finally {
      setBusy(false);
    }
  };

  const remove = async (j: Juror) => {
    await api.deleteJuror(j.id);
    await reload();
    if (form?.id === j.id) setForm(null);
  };

  const syncAll = async () => {
    setSyncing(true);
    setNote('');
    try {
      const n = await api.syncJurorsFromPortfolio!();
      await reload();
      setNote(`${n} jurado(s) atualizado(s) com nome, empresa, foto e o que houver de cargo e descrição no sistema.`);
    } catch (e) {
      setNote(errorMessage(e));
    } finally {
      setSyncing(false);
    }
  };

  const nextPos = Math.max(0, ...data.jurors.map((j) => j.position)) + 1;

  return (
    <>
      <PageHead kicker="Tela “Conheça os jurados”" title="Jurados" sub="Sem jurados cadastrados, o botão some do app do público.">
        {api.syncJurorsFromPortfolio && (
          <button className="btn ghost" onClick={syncAll} disabled={syncing}>
            {syncing ? 'Atualizando…' : 'Atualizar do sistema'}
          </button>
        )}
        <button
          className="btn primary"
          onClick={() => {
            setErr('');
            setForm({ name: '', role: '', company: '', bio: '', photo_url: null, linkedin_url: null, position: nextPos });
          }}
        >
          + Novo jurado
        </button>
      </PageHead>
      {note && <div className="notice info" style={{ marginBottom: 16 }}>{note}</div>}
      <div className={form ? 'split' : ''}>
        <div className="card">
          {data.jurors.length === 0 ? (
            <div className="empty">Nenhum jurado cadastrado.</div>
          ) : (
            <table className="tbl">
              <thead>
                <tr>
                  <th style={{ width: 60 }}>Ordem</th>
                  <th>Jurado</th>
                  <th />
                </tr>
              </thead>
              <tbody>
                {data.jurors.map((j) => (
                  <tr key={j.id} className={'click' + (form?.id === j.id ? ' sel' : '')} onClick={() => setForm({ ...j })}>
                    <td className="pitchno">{j.position}</td>
                    <td>
                      <div className="cell-co">
                        {j.photo_url ? <img src={j.photo_url} alt="" width={36} height={36} style={{ borderRadius: 9999, objectFit: 'cover' }} /> : <span className="avatar" style={{ width: 36, height: 36 }} />}
                        <span>
                          {j.name}
                          <div className="muted small" style={{ fontWeight: 400 }}>
                            {jurorTitle(j)}
                            {j.portfolio_juror_id ? ' · do sistema' : ''}
                          </div>
                          {!j.bio && (
                            <div className="small" style={{ fontWeight: 400, color: 'var(--red)' }}>
                              Sem descrição
                            </div>
                          )}
                        </span>
                      </div>
                    </td>
                    <td className="num">
                      <ConfirmButton confirmLabel="Confirmar remoção" onConfirm={() => remove(j)}>
                        Remover
                      </ConfirmButton>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </div>
        {form && (
          <div className="card panel">
            <div className="card-head">
              <h3>{form.id ? 'Editar jurado' : 'Novo jurado'}</h3>
              <button className="btn sm ghost" onClick={() => setForm(null)}>
                Fechar
              </button>
            </div>
            <div className="card-pad">
              <div className="logo-edit">
                {form.photo_url ? <img src={form.photo_url} alt="" width={60} height={60} style={{ borderRadius: 9999, objectFit: 'cover' }} /> : <span className="avatar" style={{ width: 60, height: 60 }} />}
                <label className="btn sm ghost" style={{ cursor: 'pointer' }}>
                  {form.photo_url ? 'Trocar foto' : 'Subir foto'}
                  <input
                    type="file"
                    accept="image/*"
                    hidden
                    onChange={async (e) => {
                      const f = e.target.files?.[0];
                      if (f) set('photo_url', await toSquareDataUrl(f, 200));
                    }}
                  />
                </label>
                {form.photo_url && (
                  <button className="btn sm danger" onClick={() => set('photo_url', null)}>
                    Remover
                  </button>
                )}
              </div>
              <label className="field">
                <span>Nome</span>
                <input className="input" value={form.name} onChange={(e) => set('name', e.target.value)} autoFocus />
              </label>
              <div className="grid2">
                <label className="field">
                  <span>Cargo</span>
                  <input className="input" placeholder="Partner" value={form.role} onChange={(e) => set('role', e.target.value)} />
                </label>
                <label className="field">
                  <span>Empresa</span>
                  <input className="input" value={form.company} onChange={(e) => set('company', e.target.value)} />
                </label>
              </div>
              <label className="field">
                <span>Descrição</span>
                <textarea
                  className="textarea"
                  placeholder="Duas ou três frases sobre a trajetória e a tese de investimento."
                  value={form.bio}
                  onChange={(e) => set('bio', e.target.value)}
                />
              </label>
              <label className="field">
                <span>LinkedIn</span>
                <input className="input" placeholder="https://www.linkedin.com/in/…" value={form.linkedin_url ?? ''} onChange={(e) => set('linkedin_url', e.target.value.trim() || null)} />
              </label>
              {form.portfolio_juror_id && (
                <small className="muted small">
                  Este jurado vem do sistema. Nome, empresa e foto são atualizados de lá; cargo e descrição escritos aqui ficam enquanto o sistema não tiver os seus.
                </small>
              )}
              <label className="field">
                <span>Ordem</span>
                <input className="input" type="number" value={form.position} onChange={(e) => set('position', Number(e.target.value) || 0)} />
              </label>
              {err && <div className="notice err">{err}</div>}
              <div className="row-actions">
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
