import { initials } from './lib/lineup';

export const Chevron = ({ dir = 'right', size = 18, color = '#10284E' }: { dir?: 'left' | 'right'; size?: number; color?: string }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true" style={{ flexShrink: 0 }}>
    <path d={dir === 'right' ? 'M9 6l6 6-6 6' : 'M15 6l-6 6 6 6'} />
  </svg>
);

export const Check = ({ size = 16, color = '#FFFFFF' }: { size?: number; color?: string }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true" style={{ flexShrink: 0 }}>
    <path d="M5 12l5 5 9-10" />
  </svg>
);

/** Logo da startup, ou a inicial sobre azul quando não há imagem. */
export function Logo({ name, url, size, radius = 8, alt = '' }: { name: string; url: string | null; size: number; radius?: number; alt?: string }) {
  const style = { width: size, height: size, borderRadius: radius };
  if (url) return <img className="logo" src={url} alt={alt} style={style} />;
  return (
    <span className="logo fallback" aria-hidden={alt ? undefined : true} aria-label={alt || undefined} style={{ ...style, fontSize: Math.round(size * 0.42) }}>
      {initials(name).slice(0, 1)}
    </span>
  );
}
