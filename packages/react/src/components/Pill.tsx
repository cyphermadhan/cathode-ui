import type { ReactNode } from 'react';
import { motion } from 'framer-motion';
import { useCathode } from '../CathodeProvider';
import { haptic } from '../feedback/haptic';
import { sound } from '../feedback/sound';

/**
 * Icon + text navigation / action button. Consolidated from Klick's
 * two variants (navPill in ContentView + headerPill in ChatView).
 *
 * State model:
 *   - `idle`   — default
 *   - `hover`  — cursor-over (desktop)
 *   - `press`  — actively being pressed (touch / click-down)
 *   - `active` — marks the *current* screen (tab selection indicator)
 *
 * `active` is visual only — the pill remains clickable by default
 * (pass `disabled` if it shouldn't accept input while active).
 *
 * Motion profile: 2-3% scale recoil on press via `motion/scale/press`.
 * Global `motion="none"` skips the animation. `prefers-reduced-motion`
 * is respected by framer-motion's built-in handling.
 *
 * Feedback: `tap` haptic + `click` sound fire on interaction unless
 * `feedback={false}` is passed or globally disabled.
 */
/**
 * Pill accents split into two families:
 *
 *   Semantic    — `info | success | warning | danger | accent`
 *   Palette     — `amber | pink | purple | teal | grey`
 *
 * Semantics are for meaning-carrying state (e.g. "error button" →
 * `danger`). Palette names are for differentiating multiple pills
 * where the color doesn't encode a specific semantic — e.g. a
 * navigation row where each tab is just a different color.
 */
export type PillAccent =
  | 'info'
  | 'success'
  | 'warning'
  | 'danger'
  | 'accent'
  | 'amber'
  | 'pink'
  | 'purple'
  | 'teal'
  | 'grey';

const ACCENT_VAR: Record<PillAccent, string> = {
  info:    'var(--cathode-color-info)',
  success: 'var(--cathode-color-success)',
  warning: 'var(--cathode-color-warning)',
  danger:  'var(--cathode-color-danger)',
  accent:  'var(--cathode-color-accent)',
  amber:   'var(--cathode-color-amber)',
  pink:    'var(--cathode-color-pink)',
  purple:  'var(--cathode-color-purple)',
  teal:    'var(--cathode-color-teal)',
  grey:    'var(--cathode-color-grey)',
};

export interface PillProps {
  title: string;
  icon?: ReactNode;
  accent?: PillAccent;
  active?: boolean;
  disabled?: boolean;
  /** Disable local haptic + sound feedback for this pill. Global toggles still respected above this. */
  feedback?: boolean;
  onClick?: () => void;
  className?: string;
  'aria-label'?: string;
}

export function Pill({
  title,
  icon,
  accent = 'info',
  active = false,
  disabled = false,
  feedback = true,
  onClick,
  className,
  'aria-label': ariaLabel,
}: PillProps) {
  const { motion: motionIntensity, haptic: hapticOn, sound: soundOn } = useCathode();

  const whileTap = motionIntensity === 'none' ? {} : {
    scale: motionIntensity === 'subtle' ? 0.99 : 0.97,
  };

  const handleClick = () => {
    if (disabled || active) return;
    if (feedback && hapticOn) haptic('tap');
    if (feedback && soundOn) sound('click', { enabled: true });
    onClick?.();
  };

  return (
    <motion.button
      type="button"
      className={['cathode-pill', className].filter(Boolean).join(' ')}
      data-active={active ? 'true' : 'false'}
      disabled={disabled || active}
      onClick={handleClick}
      whileTap={whileTap}
      aria-label={ariaLabel ?? title}
      aria-current={active ? 'page' : undefined}
      style={{ ['--cathode-pill-accent' as string]: ACCENT_VAR[accent] }}
    >
      {icon}
      <span>{title}</span>
    </motion.button>
  );
}
