import type { ReactNode } from 'react';
import { motion } from 'framer-motion';
import { useCathode } from '../CathodeProvider';
import { haptic } from '../feedback/haptic';
import { sound } from '../feedback/sound';
import type { PillAccent } from './Pill';

/**
 * MPC-style status tile: centered icon, bold label, tiny subtitle.
 * Lifted from Klick's StatusTile (Sources/UI/TerminalPrimitives.swift:121).
 *
 * When `onClick` is provided, the whole tile becomes a press target
 * with motion + haptic + sound feedback. Otherwise it's a pure
 * display component.
 */
const ACCENT_VAR: Record<PillAccent, string> = {
  info:        'var(--cathode-color-info)',
  ok:          'var(--cathode-color-ok)',
  warn:        'var(--cathode-color-warn)',
  tx:          'var(--cathode-color-tx)',
  sys:         'var(--cathode-color-sys)',
  navTalk:     'var(--cathode-color-nav-talk)',
  navChat:     'var(--cathode-color-nav-chat)',
  navListen:   'var(--cathode-color-nav-listen)',
  navSettings: 'var(--cathode-color-nav-settings)',
};

export interface StatusTileProps {
  title: string;
  subtitle: string;
  icon: ReactNode;
  accent?: PillAccent;
  active?: boolean;
  onClick?: () => void;
  className?: string;
}

export function StatusTile({
  title,
  subtitle,
  icon,
  accent = 'info',
  active = false,
  onClick,
  className,
}: StatusTileProps) {
  const { motion: motionIntensity, haptic: hapticOn, sound: soundOn } = useCathode();
  const Root: typeof motion.button = onClick ? motion.button : (motion.div as typeof motion.button);

  const whileTap = onClick && motionIntensity !== 'none'
    ? { scale: motionIntensity === 'subtle' ? 0.99 : 0.97 }
    : undefined;

  const handleClick = onClick ? () => {
    if (hapticOn) haptic('tap');
    if (soundOn) sound('click', { enabled: true });
    onClick();
  } : undefined;

  const baseClasses = ['cathode-tile'];
  if (onClick) baseClasses.push('cathode-tile-button');
  if (className) baseClasses.push(className);

  return (
    <Root
      type={onClick ? 'button' : undefined}
      className={baseClasses.join(' ')}
      data-active={active ? 'true' : 'false'}
      onClick={handleClick}
      whileTap={whileTap}
      style={{ ['--cathode-tile-accent' as string]: ACCENT_VAR[accent] }}
    >
      <div className="cathode-tile-icon">{icon}</div>
      <div className="cathode-tile-title">{title}</div>
      <div className="cathode-tile-subtitle">{subtitle}</div>
    </Root>
  );
}
