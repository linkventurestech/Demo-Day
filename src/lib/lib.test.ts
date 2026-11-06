import { describe, expect, it } from 'vitest';
import { parseAttendees, toCsv } from './csv';
import { buildLineup, pitchIndex } from './lineup';
import { aggregate, connectionRows } from './results';
import { SEED_CATEGORIES, SEED_STARTUPS } from './api/seed';
import type { Rating } from './api/types';

describe('parseAttendees', () => {
  it('lê CSV com cabeçalho em qualquer ordem', () => {
    const r = parseAttendees('Nome;E-mail;Empresa\nAna Lima;ANA@Fundo.com ;Fundo X\n"Silva, Bruno";bruno@x.com.br;');
    expect(r.rows).toEqual([
      { email: 'ana@fundo.com', name: 'Ana Lima', company: 'Fundo X' },
      { email: 'bruno@x.com.br', name: 'Silva, Bruno', company: null },
    ]);
  });

  it('aceita lista crua de e-mails, ignora repetidos e aponta inválidos', () => {
    const r = parseAttendees('a@x.com\nb@y.com\nA@x.com\nnão é email\n\n');
    expect(r.rows.map((x) => x.email)).toEqual(['a@x.com', 'b@y.com']);
    expect(r.duplicates).toBe(1);
    expect(r.invalid).toEqual(['não é email']);
  });

  it('lê colagem do Excel (TAB) sem cabeçalho', () => {
    const r = parseAttendees('c@z.com\tCarla\tZ Corp');
    expect(r.rows).toEqual([{ email: 'c@z.com', name: 'Carla', company: 'Z Corp' }]);
  });
});

describe('buildLineup', () => {
  it('numera os pitchs em sequência entre blocos', () => {
    const blocks = buildLineup(SEED_CATEGORIES, SEED_STARTUPS);
    expect(blocks.map((b) => b.category.name)).toEqual(['Investment Round', 'Showcase']);
    expect(blocks.map((b) => b.info)).toEqual(['Pitchs 01–08', 'Pitchs 09–18']);
    expect(pitchIndex(blocks)).toMatchObject({ dressy: { num: '01' }, centra: { num: '02' }, tubushi: { num: '09' } });
    expect(blocks[0].slots[2].startup).toBeNull();
  });

  it('alonga o bloco quando uma startup passa do número de posições', () => {
    const blocks = buildLineup([{ id: 'a', name: 'A', position: 1, slots: 1 }], [{ ...SEED_STARTUPS[0], category_id: 'a', position: 3 }]);
    expect(blocks[0].slots).toHaveLength(3);
  });
});

describe('aggregate', () => {
  const r = (attendee_id: string, startup_id: string, score: number | null, interests: Rating['interests'] = []): Rating => ({
    attendee_id, startup_id, score, interests, created_at: '2026-10-30T10:00:00Z', updated_at: '2026-10-30T10:0' + attendee_id.length + ':00Z',
  });
  const ratings = [r('a', 'dressy', 5, ['invest']), r('bb', 'dressy', 4), r('ccc', 'dressy', null, ['news', 'invest'])];

  it('calcula média só com quem deu nota e conta interesses', () => {
    const g = aggregate(SEED_STARTUPS, ratings).find((x) => x.startup.id === 'dressy')!;
    expect(g.avg).toBe(4.5);
    expect(g.votes).toBe(2);
    expect(g.responses).toBe(3);
    expect(g.dist).toEqual([0, 0, 0, 1, 1]);
    expect(g.interests.invest).toBe(2);
    expect(g.connections).toBe(2);
  });

  it('lista conexões só de quem marcou interesse, mais recentes primeiro', () => {
    const rows = connectionRows(ratings, [], SEED_STARTUPS);
    expect(rows.map((x) => x.rating.attendee_id)).toEqual(['ccc', 'a']);
  });
});

it('toCsv escapa separador e aspas', () => {
  expect(toCsv(['a', 'b'], [['x;y', 'diz "oi"']])).toBe('﻿a;b\r\n"x;y";"diz ""oi"""');
});
