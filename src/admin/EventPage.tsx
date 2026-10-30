import { useEffect, useState } from 'react';
import { api, type Category, type EventSettings } from '../lib/api';
import { errorMessage } from '../lib/errors';
import { PageHead, type PageProps } from './AdminApp';

const slug = (s: string) =>
  s
    .toLowerCase()
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-|-$/g, '') || 'bloco';

export function EventPage({ data, reload }: PageProps) {
  const [settings, setSettings] = useState<EventSettings>(data.settings);
  const [cats, setCats] = useState<Category[]>(data.categories);
  const [msg, setMsg] = useState<{ kind: 'ok' | 'err'; text: string } | null>(null);
  const [busy, setBusy] = useState(false);

  // Mantém o formulário em dia com o polling enquanto não houver edição pendente.
  const dirty = JSON.stringify(settings) !== JSON.stringify(data.settings) || JSON.stringify(cats) !== JSON.stringify(data.categories);
  useEffect(() => {
    if (!dirty) {
      setSettings(data.settings);
      setCats(data.categories);
    }
  }, [data]);

  const setCat = (i: number, patch: Partial<Category>) => setCats(cats.map((c, j) => (j === i ? { ...c, ...patch } : c)));

  const save = async () => {
    setBusy(true);
    setMsg(null);
    try {
      await api.saveSettings(settings);
      for (const c of cats) {
        const before = data.categories.find((x) => x.id === c.id);
        if (JSON.stringify(before) !== JSON.stringify(c)) await api.saveCategory(c);
      }
      await reload();
      setMsg({ kind: 'ok', text: 'Salvo. O app do público já mostra as mudanças.' });
    } catch (e) {
      setMsg({ kind: 'err', text: errorMessage(e) });
    } finally {
      setBusy(false);
    }
  };

  const toggleVoting = async (open: boolean) => {
    setSettings({ ...settings, voting_open: open });
    try {
      await api.saveSettings({ ...data.settings, voting_open: open });
      await reload();
    } catch (e) {
      setMsg({ kind: 'err', text: errorMessage(e) });
    }
  };

  const addCat = () => {
    const name = prompt('Nome do novo bloco');
    if (!name?.trim()) return;
    let id = slug(name);
    while (cats.some((c) => c.id === id)) id += '-2';
    setCats([...cats, { id, name: name.trim(), position: Math.max(0, ...cats.map((c) => c.position)) + 1, slots: 3 }]);
  };

  const removeCat = async (c: Category) => {
    if (data.startups.some((s) => s.category_id === c.id)) return setMsg({ kind: 'err', text: `Mova ou remova as startups de “${c.name}” antes de apagar o bloco.` });
    if (!data.categories.some((x) => x.id === c.id)) return setCats(cats.filter((x) => x.id !== c.id));
    if (!confirm(`Apagar o bloco “${c.name}”?`)) return;
    try {
      await api.deleteCategory(c.id);
      setCats(cats.filter((x) => x.id !== c.id));
      await reload();
    } catch (e) {
      setMsg({ kind: 'err', text: errorMessage(e) });
    }
  };

  return (
    <>
      <PageHead kicker="Configuração" title="Evento" sub="Nome, texto de entrada, votação e blocos da ordem dos pitchs.">
        <button className="btn primary" onClick={save} disabled={!dirty || busy}>
          {busy ? 'Salvando…' : 'Salvar alterações'}
        </button>
      </PageHead>

      {msg && <div className={'notice ' + msg.kind} style={{ marginBottom: 16 }}>{msg.text}</div>}

      <div className="card">
        <div className="card-head">
          <h3>Votação</h3>
          <label className="switch">
            <input type="checkbox" checked={data.settings.voting_open} onChange={(e) => toggleVoting(e.target.checked)} />
            {data.settings.voting_open ? 'Aberta' : 'Encerrada'}
          </label>
        </div>
        <div className="card-pad muted small">Com a votação encerrada o público ainda vê a ordem e as startups, mas não consegue enviar nem mudar avaliações. Vale na hora.</div>
      </div>

      <div className="card">
        <div className="card-head">
          <h3>Textos</h3>
        </div>
        <div className="card-pad" style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
          <label className="field">
            <span>Nome do evento</span>
            <input className="input" value={settings.name} onChange={(e) => setSettings({ ...settings, name: e.target.value })} />
          </label>
          <label className="field">
            <span>Texto da tela de entrada</span>
            <input className="input" value={settings.tagline} onChange={(e) => setSettings({ ...settings, tagline: e.target.value })} />
          </label>
        </div>
      </div>

      <div className="card">
        <div className="card-head">
          <h3>Blocos</h3>
          <button className="btn sm ghost" onClick={addCat}>
            + Bloco
          </button>
        </div>
        <table className="tbl">
          <thead>
            <tr>
              <th style={{ width: 100 }}>Ordem</th>
              <th>Nome</th>
              <th style={{ width: 160 }}>Posições</th>
              <th style={{ width: 120 }} className="num">
                Startups
              </th>
              <th style={{ width: 110 }} />
            </tr>
          </thead>
          <tbody>
            {[...cats]
              .map((c, i) => ({ c, i }))
              .sort((a, b) => a.c.position - b.c.position)
              .map(({ c, i }) => (
                <tr key={c.id}>
                  <td>
                    <input className="input" type="number" value={c.position} onChange={(e) => setCat(i, { position: Number(e.target.value) || 0 })} aria-label="Ordem" />
                  </td>
                  <td>
                    <input className="input" value={c.name} onChange={(e) => setCat(i, { name: e.target.value })} aria-label="Nome do bloco" />
                  </td>
                  <td>
                    <input className="input" type="number" min={0} max={50} value={c.slots} onChange={(e) => setCat(i, { slots: Math.min(50, Math.max(0, Number(e.target.value) || 0)) })} aria-label="Posições" />
                  </td>
                  <td className="num">{data.startups.filter((s) => s.category_id === c.id).length}</td>
                  <td className="num">
                    <button className="btn sm danger" onClick={() => removeCat(c)}>
                      Apagar
                    </button>
                  </td>
                </tr>
              ))}
          </tbody>
        </table>
      </div>
    </>
  );
}
