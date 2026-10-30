import type { Category, Startup } from './api/types';

export interface Slot {
  num: string; // "01"
  position: number;
  startup: Startup | null;
}

export interface Block {
  category: Category;
  slots: Slot[];
  info: string; // "Pitchs 01–03"
}

export const pad = (n: number) => (n < 10 ? '0' + n : String(n));

/**
 * Monta a ordem dos pitchs: blocos na ordem de `position`, cada um com `slots`
 * posições (vazias = "A definir"). A numeração é contínua entre os blocos.
 * Uma startup numa posição acima de `slots` alonga o bloco, para nunca sumir.
 */
export function buildLineup(categories: Category[], startups: Startup[]): Block[] {
  let counter = 0;
  return [...categories]
    .sort((a, b) => a.position - b.position)
    .map((category) => {
      const own = startups.filter((s) => s.category_id === category.id);
      const size = Math.max(category.slots, ...own.map((s) => s.position), 0);
      const first = counter + 1;
      const slots: Slot[] = [];
      for (let p = 1; p <= size; p++) {
        counter += 1;
        slots.push({ num: pad(counter), position: p, startup: own.find((s) => s.position === p) ?? null });
      }
      const info = size ? (size === 1 ? 'Pitch ' + pad(first) : 'Pitchs ' + pad(first) + '–' + pad(counter)) : '';
      return { category, slots, info };
    });
}

/** Número do pitch e nome do bloco de cada startup. */
export function pitchIndex(blocks: Block[]) {
  const map: Record<string, { num: string; cat: string }> = {};
  for (const b of blocks) for (const s of b.slots) if (s.startup) map[s.startup.id] = { num: s.num, cat: b.category.name };
  return map;
}

export const initials = (name: string) =>
  name
    .split(/\s+/)
    .filter(Boolean)
    .slice(0, 2)
    .map((w) => w[0]!.toUpperCase())
    .join('');
