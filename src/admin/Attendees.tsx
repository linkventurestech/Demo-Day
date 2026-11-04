import { useMemo, useState } from 'react';
import { api } from '../lib/api';
import { download, parseAttendees, toCsv } from '../lib/csv';
import { errorMessage } from '../lib/errors';
import { fmtDate } from '../lib/format';
import { ConfirmButton } from '../ui';
import { PageHead, type PageProps } from './AdminApp';

export function Attendees({ data, reload }: PageProps) {
  const [text, setText] = useState('');
  const [over, setOver] = useState(false);
  const [busy, setBusy] = useState(false);
  const [msg, setMsg] = useState<{ kind: 'ok' | 'err'; text: string } | null>(null);
  const [q, setQ] = useState('');

  const parsed = useMemo(() => parseAttendees(text), [text]);
  const existing = useMemo(() => new Set(data.attendees.map((a) => a.email)), [data.attendees]);
  const newCount = parsed.rows.filter((r) => !existing.has(r.email)).length;
  const ratingsBy = useMemo(() => {
    const m = new Map<string, number>();
    for (const r of data.ratings) m.set(r.attendee_id, (m.get(r.attendee_id) ?? 0) + 1);
    return m;
  }, [data.ratings]);

  const readFile = async (f: File | undefined) => {
    if (!f) return;
    if (/\.xlsx?$/i.test(f.name)) {
      setMsg({ kind: 'err', text: 'Salve a planilha como CSV (Arquivo → Salvar como → CSV) e envie de novo.' });
      return;
    }
    setText(await f.text());
    setMsg(null);
  };

  const importRows = async () => {
    setBusy(true);
    setMsg(null);
    try {
      await api.upsertAttendees(parsed.rows);
      await reload();
      setMsg({ kind: 'ok', text: `${newCount} e-mail(s) novo(s) liberado(s)${parsed.rows.length - newCount ? `, ${parsed.rows.length - newCount} já existiam (dados atualizados)` : ''}.` });
      setText('');
    } catch (e) {
      setMsg({ kind: 'err', text: errorMessage(e) });
    } finally {
      setBusy(false);
    }
  };

  const remove = async (id: string) => {
    try {
      await api.deleteAttendees([id]);
      await reload();
    } catch (e) {
      setMsg({ kind: 'err', text: errorMessage(e) });
    }
  };

  const list = data.attendees.filter((a) => !q || [a.email, a.name, a.company].some((v) => v?.toLowerCase().includes(q.toLowerCase())));

  return (
    <>
      <PageHead kicker="Lista de acesso" title="Inscritos" sub="Só quem estiver nesta lista consegue entrar no app com o próprio e-mail.">
        <button
          className="btn dark"
          disabled={!data.attendees.length}
          onClick={() =>
            download(
              'demo-day-inscritos.csv',
              toCsv(
                ['email', 'nome', 'empresa', 'acessou_em', 'avaliacoes'],
                data.attendees.map((a) => [a.email, a.name ?? '', a.company ?? '', a.last_login_at ? new Date(a.last_login_at).toLocaleString('pt-BR') : '', ratingsBy.get(a.id) ?? 0]),
              ),
            )
          }
        >
          Exportar lista (CSV)
        </button>
      </PageHead>

      <div className="card" style={{ marginBottom: 24 }}>
        <div className="card-head">
          <h3>Subir e-mails cadastrados</h3>
          <span className="muted small">CSV, TSV ou colado da planilha · colunas: email, nome, empresa</span>
        </div>
        <div className="card-pad" style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
          <div
            className={'drop' + (over ? ' over' : '')}
            onDragOver={(e) => {
              e.preventDefault();
              setOver(true);
            }}
            onDragLeave={() => setOver(false)}
            onDrop={(e) => {
              e.preventDefault();
              setOver(false);
              readFile(e.dataTransfer.files[0]);
            }}
          >
            <textarea
              className="textarea code"
              placeholder={'email,nome,empresa\nana@fundo.com,Ana Lima,Fundo X\nbruno@empresa.com.br'}
              value={text}
              onChange={(e) => {
                setText(e.target.value);
                setMsg(null);
              }}
              aria-label="Lista de e-mails"
            />
            <div className="actions" style={{ justifyContent: 'space-between' }}>
              <label className="btn ghost sm" style={{ cursor: 'pointer' }}>
                Escolher arquivo…
                <input type="file" accept=".csv,.tsv,.txt,text/csv,text/plain" hidden onChange={(e) => readFile(e.target.files?.[0])} />
              </label>
              <span className="muted small">ou arraste o arquivo para cá</span>
            </div>
          </div>

          {text.trim() && (
            <div className="notice info">
              <b>{parsed.rows.length}</b> e-mail(s) válido(s) · <b>{newCount}</b> novo(s)
              {parsed.duplicates > 0 && <> · {parsed.duplicates} repetido(s) ignorado(s)</>}
              {parsed.invalid.length > 0 && (
                <>
                  {' '}
                  · <span style={{ color: 'var(--red)' }}>{parsed.invalid.length} linha(s) sem e-mail válido</span>
                  <div className="small" style={{ marginTop: 6, fontFamily: 'var(--mono)' }}>
                    {parsed.invalid.slice(0, 3).join(' | ')}
                    {parsed.invalid.length > 3 ? ' …' : ''}
                  </div>
                </>
              )}
            </div>
          )}
          {msg && <div className={'notice ' + msg.kind}>{msg.text}</div>}
          <div className="row-actions">
            <button className="btn ghost" onClick={() => setText('')} disabled={!text}>
              Limpar
            </button>
            <button className="btn primary" onClick={importRows} disabled={!parsed.rows.length || busy}>
              {busy ? 'Salvando…' : `Liberar ${parsed.rows.length || ''} e-mail(s)`}
            </button>
          </div>
        </div>
      </div>

      <div className="toolbar">
        <input className="input search" placeholder="Buscar e-mail, nome ou empresa" value={q} onChange={(e) => setQ(e.target.value)} />
        <span className="muted small">
          {list.length} de {data.attendees.length} · {data.attendees.filter((a) => a.last_login_at).length} já acessaram
        </span>
      </div>
      <div className="card">
        {list.length === 0 ? (
          <div className="empty">{data.attendees.length ? 'Ninguém encontrado.' : 'Nenhum e-mail liberado ainda. Suba a lista acima.'}</div>
        ) : (
          <table className="tbl">
            <thead>
              <tr>
                <th>E-mail</th>
                <th>Nome</th>
                <th>Empresa</th>
                <th>Último acesso</th>
                <th className="num">Avaliações</th>
                <th />
              </tr>
            </thead>
            <tbody>
              {list.map((a) => (
                <tr key={a.id}>
                  <td style={{ fontWeight: 600 }}>{a.email}</td>
                  <td>{a.name || <span className="zero">—</span>}</td>
                  <td>{a.company || <span className="zero">—</span>}</td>
                  <td className="muted small nowrap">{a.last_login_at ? fmtDate(a.last_login_at) : 'Nunca'}</td>
                  <td className="num">{ratingsBy.get(a.id) ?? 0}</td>
                  <td className="num">
                    <ConfirmButton
                      confirmLabel={ratingsBy.get(a.id) ? `Remover e apagar ${ratingsBy.get(a.id)} avaliação(ões)?` : 'Confirmar remoção'}
                      onConfirm={() => remove(a.id)}
                    >
                      Remover
                    </ConfirmButton>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>
    </>
  );
}
