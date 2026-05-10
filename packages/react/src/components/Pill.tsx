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
export type PillAccent =
  | 'info'
  | 'ok'
  | 'warn'
  | 'tx'
  | 'sys'
  | 'navTalk'
  | 'navChat'
  | 'navListen'
  | 'navSettings';

const ACCENT_VAR: Record<PillAccent, string> = {
  info:         'var(--cathode-color-info)',
  ok:           'var(--cathode-color-ok)',
  warn:         'var(--cathode-color-warn)',
  tx:           'var(--cathode-color-tx)',
  sys:          'var(--cathode-color-sys)',
  navTalk:      'var(--cathode-color-nav-talk)',
  navChat:      'var(--cathode-color-nav-chat)',
  navListen:    'var(--cathode-color-nav-listen)',
  navSettings:  'var(--cathode-color-nav-settings)',
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
