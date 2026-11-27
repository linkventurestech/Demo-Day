import { useEffect, useState } from 'react';
import { initials } from './lib/lineup';

/** Botão de ação destrutiva: o primeiro clique arma, o segundo confirma. Volta sozinho em 4s. */
export function ConfirmButton({ children, confirmLabel, onConfirm, className = 'btn sm danger' }: { children: React.ReactNode; confirmLabel: string; onConfirm: () => void; className?: string }) {
  const [armed, setArmed] = useState(false);
  useEffect(() => {
    if (!armed) return;
    const t = setTimeout(() => setArmed(false), 4000);
    return () => clearTimeout(t);
  }, [armed]);
  return (
    <button
      type="button"
      className={className + (armed ? ' armed' : '')}
      onClick={(e) => {
        e.stopPropagation();
        if (armed) {
          setArmed(false);
          onConfirm();
        } else setArmed(true);
      }}
    >
      {armed ? confirmLabel : children}
    </button>
  );
}

export const Chevron = ({ dir = 'right', size = 18, color = '#10284E' }: { dir?: 'left' | 'right'; size?: number; color?: string }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true" style={{ flexShrink: 0 }}>
    <path d={dir === 'right' ? 'M9 6l6 6-6 6' : 'M15 6l-6 6 6 6'} />
  </svg>
);

export const Globe = () => (
  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true" style={{ flexShrink: 0 }}>
    <circle cx="12" cy="12" r="9" />
    <path d="M3 12h18M12 3c2.5 2.7 3.8 5.7 3.8 9s-1.3 6.3-3.8 9c-2.5-2.7-3.8-5.7-3.8-9s1.3-6.3 3.8-9z" />
  </svg>
);

export const InstagramIcon = () => (
  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true" style={{ flexShrink: 0 }}>
    <rect x="3.5" y="3.5" width="17" height="17" rx="5" />
    <circle cx="12" cy="12" r="4" />
    <circle cx="17.2" cy="6.8" r="0.8" fill="currentColor" stroke="none" />
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
