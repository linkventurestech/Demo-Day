import type { Startup } from './api/types';

/** Stands do Showcase na planta em U. */
export const STAND_COUNT = 12;

export interface StandBox {
  n: number; // 1..STAND_COUNT
  x: number;
  y: number;
  w: number;
  h: number;
  side: 'left' | 'base' | 'right';
}

/** Medidas da planta, em unidades do viewBox do SVG. */
export const PLAN = { width: 340, height: 404, pad: 10, top: 46, gap: 6, arm: 84, standH: 58, baseH: 78 };

/**
 * Posição de cada stand no U, na ordem de quem caminha a partir da entrada:
 * desce o braço esquerdo (1–4), atravessa o fundo (5–8) e sobe o braço direito (9–12).
 */
export function standLayout(count = STAND_COUNT): StandBox[] {
  const { width, pad, top, gap, arm, standH, baseH } = PLAN;
  const perSide = Math.ceil(count / 3);
  const baseY = top + perSide * standH + (perSide - 1) * gap + gap;
  const baseW = (width - 2 * pad - (perSide - 1) * gap) / perSide;
  const boxes: StandBox[] = [];
  for (let i = 0; i < count; i++) {
    const side = i < perSide ? 'left' : i < perSide * 2 ? 'base' : 'right';
    const k = i % perSide;
    if (side === 'left') boxes.push({ n: i + 1, side, x: pad, y: top + k * (standH + gap), w: arm, h: standH });
    else if (side === 'base') boxes.push({ n: i + 1, side, x: pad + k * (baseW + gap), y: baseY, w: baseW, h: baseH });
    else boxes.push({ n: i + 1, side, x: width - pad - arm, y: top + (perSide - 1 - k) * (standH + gap), w: arm, h: standH });
  }
  return boxes;
}

/** Startup de cada stand ocupado. */
export function standOccupants(startups: Startup[]): Map<number, Startup> {
  const m = new Map<number, Startup>();
  for (const s of startups) if (s.stand != null) m.set(s.stand, s);
  return m;
}
