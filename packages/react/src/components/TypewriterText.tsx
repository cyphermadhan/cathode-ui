import { useEffect, useState } from 'react';
import { useCathode } from '../CathodeProvider';

/**
 * TypewriterText — reveals text one character at a time for the
 * terminal boot-up / dramatic-reveal feel. Respects reduced-motion
 * by rendering the full text immediately.
 *
 * The cursor stays visible while typing and optionally after
 * completion. Useful for readout labels, dialog openers, or
 * "incoming message…" moments.
 */
export interface TypewriterTextProps {
  text: string;
  /** ms per character. Default 40. */
  speed?: number;
  /** Blink the cursor after typing completes. Default true. */
  cursorAfter?: boolean;
  /** Delay before typing starts, ms. Default 0. */
  delay?: number;
  /** CSS color for the typed text. Default `currentColor`. */
  color?: string;
  /** CSS color for the blinking cursor. Default = info token. */
  cursorColor?: string;
  className?: string;
  /** Called once the last character is in. */
  onDone?: () => void;
}

export function TypewriterText({
  text,
  speed = 40,
  cursorAfter = true,
  delay = 0,
  color,
  cursorColor,
  className,
  onDone,
}: TypewriterTextProps) {
  const { motion: motionIntensity } = useCathode();
  const reduced = motionIntensity === 'none';
  const [shown, setShown] = useState(reduced ? text : '');

  useEffect(() => {
    if (reduced) { setShown(text); onDone?.(); return; }
    setShown('');
    let i = 0;
    const t = setTimeout(() => {
      const tick = () => {
        i += 1;
        setShown(text.slice(0, i));
        if (i < text.length) {
          timer = setTimeout(tick, speed);
        } else {
          onDone?.();
        }
      };
      let timer = setTimeout(tick, speed);
      // cleanup inside the outer effect closure
      return () => clearTimeout(timer);
    }, delay);
    return () => clearTimeout(t);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [text, speed, delay, reduced]);

  const done = shown.length === text.length;

  return (
    <span
      className={['cathode-typewriter', className].filter(Boolean).join(' ')}
      style={color ? { color } : undefined}
    >
      {/* Visually-hidden full text — SR reads it once, immediately,
       * without being thrashed by the typewriter animation. The
       * visible <span> is aria-hidden so the animation doesn't reach
       * assistive tech. */}
      <span className="cathode-typewriter-sr">{text}</span>
      <span aria-hidden>{shown}</span>
      {(!done || cursorAfter) && !reduced ? (
        <span
          className="cathode-typewriter-cursor"
          style={cursorColor ? { color: cursorColor } : undefined}
          aria-hidden
        >▊</span>
      ) : null}
    </span>
  );
}
