import type { Startup } from '../lib/api';
import { pad } from '../lib/lineup';
import { PLAN, STAND_COUNT, standLayout, standOccupants } from '../lib/stands';

const fit = (name: string, max: number) => (name.length > max ? name.slice(0, max - 1) + '…' : name);

interface Props {
  startups: Startup[];
  /** Stand destacado (ex.: veio de "Ver no mapa"). */
  focus?: number | null;
  onPick?: (s: Startup) => void;
}

/** Planta baixa em U com os stands do Showcase. */
export function StandMap({ startups, focus, onPick }: Props) {
  const boxes = standLayout(STAND_COUNT);
  const who = standOccupants(startups);
  const { width, height, pad: p, top, arm } = PLAN;
  const inner = { x: p + arm, y: top, w: width - 2 * (p + arm) };
  const baseY = boxes.find((b) => b.side === 'base')!.y;

  return (
    <svg className="plan" viewBox={`0 0 ${width} ${height}`} role="img" aria-label={`Planta do Showcase em U com ${STAND_COUNT} stands`}>
      {/* contorno do salão */}
      <rect x={1} y={1} width={width - 2} height={height - 2} rx={14} className="plan-hall" />
      {/* entrada no lado aberto do U */}
      <line x1={inner.x + 18} y1={1} x2={inner.x + inner.w - 18} y2={1} className="plan-door" />
      <text x={width / 2} y={24} className="plan-label" textAnchor="middle">
        ↓ Entrada
      </text>
      {/* área de circulação no meio do U */}
      <rect x={inner.x + 8} y={inner.y} width={inner.w - 16} height={baseY - inner.y - 8} rx={10} className="plan-floor" />
      <text x={width / 2} y={(inner.y + baseY) / 2} className="plan-label" textAnchor="middle">
        Circulação
      </text>

      {boxes.map((b) => {
        const s = who.get(b.n);
        const on = focus === b.n;
        const cls = 'stand' + (s ? ' taken' : '') + (on ? ' focus' : '') + (s && onPick ? ' clickable' : '');
        const label = s ? `Stand ${pad(b.n)}: ${s.name}` : `Stand ${pad(b.n)}: livre`;
        return (
          <g
            key={b.n}
            className={cls}
            role={s && onPick ? 'button' : undefined}
            tabIndex={s && onPick ? 0 : undefined}
            aria-label={label}
            onClick={() => s && onPick?.(s)}
            onKeyDown={(e) => {
              if (s && onPick && (e.key === 'Enter' || e.key === ' ')) {
                e.preventDefault();
                onPick(s);
              }
            }}
          >
            <title>{label}</title>
            <rect x={b.x} y={b.y} width={b.w} height={b.h} rx={8} />
            <text x={b.x + 8} y={b.y + 16} className="stand-n">
              {pad(b.n)}
            </text>
            <text x={b.x + b.w / 2} y={b.y + b.h / 2 + (b.side === 'base' ? 10 : 8)} className="stand-name" textAnchor="middle">
              {s ? fit(s.name, b.side === 'base' ? 10 : 11) : 'Livre'}
            </text>
          </g>
        );
      })}
    </svg>
  );
}
