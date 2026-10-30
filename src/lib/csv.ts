import type { AttendeeInput } from './api/types';

const EMAIL = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

export interface ParsedAttendees {
  rows: AttendeeInput[];
  invalid: string[]; // linhas sem e-mail válido
  duplicates: number;
}

function splitLine(line: string, sep: string): string[] {
  const out: string[] = [];
  let cur = '';
  let q = false;
  for (let i = 0; i < line.length; i++) {
    const ch = line[i];
    if (q) {
      if (ch === '"' && line[i + 1] === '"') {
        cur += '"';
        i++;
      } else if (ch === '"') q = false;
      else cur += ch;
    } else if (ch === '"') q = true;
    else if (ch === sep) {
      out.push(cur);
      cur = '';
    } else cur += ch;
  }
  out.push(cur);
  return out.map((c) => c.trim());
}

/**
 * Lê uma lista de inscritos colada ou exportada (CSV/TSV/planilha).
 * Aceita cabeçalho com "email", "nome"/"name" e "empresa"/"company" em qualquer
 * ordem; sem cabeçalho, usa a coluna que tiver e-mail e as seguintes como nome e empresa.
 */
export function parseAttendees(text: string): ParsedAttendees {
  const lines = text.replace(/^﻿/, '').split(/\r?\n/).filter((l) => l.trim());
  if (!lines.length) return { rows: [], invalid: [], duplicates: 0 };
  const sep = ['\t', ';', ','].find((s) => lines[0].includes(s)) ?? ',';
  const head = splitLine(lines[0], sep).map((h) => h.toLowerCase().normalize('NFD').replace(/[^a-z0-9@.]/g, ''));
  const col = (...names: string[]) => head.findIndex((h) => names.some((n) => h === n || h.includes(n)));
  const hasHeader = !head.some((h) => EMAIL.test(h)) && col('email') >= 0;
  const iEmail = hasHeader ? col('email') : -1;
  const iName = hasHeader ? col('nome', 'name') : -1;
  const iCompany = hasHeader ? col('empresa', 'company', 'organizacao', 'organization') : -1;

  const seen = new Set<string>();
  const rows: AttendeeInput[] = [];
  const invalid: string[] = [];
  let duplicates = 0;
  for (const line of hasHeader ? lines.slice(1) : lines) {
    const cells = splitLine(line, sep);
    const ei = iEmail >= 0 ? iEmail : cells.findIndex((c) => EMAIL.test(c.toLowerCase()));
    const email = (cells[ei] ?? '').toLowerCase().replace(/^mailto:/, '').trim();
    if (ei < 0 || !EMAIL.test(email)) {
      invalid.push(line);
      continue;
    }
    if (seen.has(email)) {
      duplicates++;
      continue;
    }
    seen.add(email);
    const pick = (i: number) => (i >= 0 && i !== ei ? cells[i] || null : null);
    rows.push(
      hasHeader
        ? { email, name: pick(iName), company: pick(iCompany) }
        : { email, name: pick(ei + 1), company: pick(ei + 2) },
    );
  }
  return { rows, invalid, duplicates };
}

const cell = (v: unknown) => {
  const s = v == null ? '' : String(v);
  return /[";\n\r]/.test(s) ? '"' + s.replace(/"/g, '""') + '"' : s;
};

/** CSV com ";" e BOM, que o Excel em pt-BR abre direto. */
export function toCsv(header: string[], rows: unknown[][]): string {
  return '﻿' + [header, ...rows].map((r) => r.map(cell).join(';')).join('\r\n');
}

export function download(filename: string, content: string, type = 'text/csv;charset=utf-8') {
  const url = URL.createObjectURL(new Blob([content], { type }));
  const a = document.createElement('a');
  a.href = url;
  a.download = filename;
  a.click();
  setTimeout(() => URL.revokeObjectURL(url), 1000);
}
