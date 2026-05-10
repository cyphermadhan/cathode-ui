import type { ReactNode } from 'react';

/**
 * Avatar — square (never round, per Cathode aesthetic) identity
 * marker. Renders an image when `src` is provided, otherwise falls
 * back to the first letters of `name` rendered in the Cathode
 * monospace uppercase style. Optional presence dot positioned in the
 * bottom-right corner.
 *
 * If neither `src` nor `name` is provided, renders the supplied
 * `children` (useful for custom icon avatars).
 */
export type AvatarStatus = 'online' | 'away' | 'busy' | 'offline';
export type AvatarAccent =
  | 'neutral' | 'info' | 'success' | 'warning' | 'danger'
  | 'amber' | 'pink' | 'purple' | 'teal' | 'grey';

export interface AvatarProps {
  name?: string;
  src?: string;
  alt?: string;
  size?: 'sm' | 'md' | 'lg';
  status?: AvatarStatus;
  /** Background color for the initials fallback. Default 'info'. */
  accent?: AvatarAccent;
  /** Custom content (icon, emoji). Falls back to initials when absent. */
  children?: ReactNode;
  className?: string;
}

export function Avatar({
  name,
  src,
  alt,
  size = 'md',
  status,
  accent = 'info',
  children,
  className,
}: AvatarProps) {
  const initials = name ? deriveInitials(name) : null;

  return (
    <span
      className={['cathode-avatar', className].filter(Boolean).join(' ')}
      data-size={size}
    >
      {src ? (
        <img className="cathode-avatar-image" src={src} alt={alt ?? name ?? ''} />
      ) : (
        <span
          className="cathode-avatar-fallback"
          data-accent={accent}
          aria-label={name ? undefined : alt}
        >
          {children ?? initials ?? '?'}
        </span>
      )}
      {status ? (
        <span
          className="cathode-avatar-status"
          data-status={status}
          role="img"
          aria-label={`Status: ${status}`}
        />
      ) : null}
    </span>
  );
}

function deriveInitials(name: string): string {
  // Take first chars of first two whitespace-separated tokens.
  const parts = name.trim().split(/\s+/).slice(0, 2);
  return parts.map((p) => p[0] ?? '').join('').toUpperCase() || '?';
}
