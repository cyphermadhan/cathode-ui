import type { ReactNode } from 'react';
import { motion } from 'framer-motion';
import { useCathode } from '../CathodeProvider';
import { haptic } from '../feedback/haptic';
import { sound } from '../feedback/sound';
import type { CathodeAIProvider } from '../ai/provider';

/**
 * General-purpose Cathode button.
 *
 * Variants:
 *   - `default`  — panel fill, border text (the conservative option)
 *   - `primary`  — ok-green fill, inverted text (go, submit)
 *   - `danger`   — tx-red fill, inverted text (destructive)
 *
 * AI action: pass `ai={{ action: 'explain-the-chart' }}` and a
 * provider via `<CathodeProvider ai={...}>` and the button will route
 * the click through `provider.act(action, context)` and pass the
 * resolved string to `onActionResult`. Useful for "Explain this"
 * buttons or "Ask AI to summarize" patterns.
 *
 * Haptic/sound defaults: `confirm` pattern for primary, `click` for
 * default/danger — the subtle semantic cue that something committed.
 */
export interface ButtonAIConfig {
  /** Intent string passed to the provider's `act` method. */
  action: string;
  /** Arbitrary context payload accompanying the intent. */
  context?: unknown;
  /** Override the provider supplied via CathodeProvider. */
  provider?: CathodeAIProvider;
}

export interface ButtonProps {
  children: ReactNode;
  variant?: 'default' | 'primary' | 'danger';
  icon?: ReactNode;
  disabled?: boolean;
  onClick?: () => void;
  /** Configure an AI action. When present, `onClick` fires first, then the provider. */
  ai?: ButtonAIConfig;
  /** Called with the provider's returned string after `ai.action` resolves. */
  onActionResult?: (result: string) => void;
  className?: string;
  'aria-label'?: string;
}

export function Button({
  children,
  variant = 'default',
  icon,
  disabled = false,
  onClick,
  ai,
  onActionResult,
  className,
  'aria-label': ariaLabel,
}: ButtonProps) {
  const { motion: motionIntensity, haptic: hapticOn, sound: soundOn, ai: globalAI } = useCathode();

  const whileTap = motionIntensity === 'none' ? {} : {
    scale: motionIntensity === 'subtle' ? 0.99 : 0.97,
  };

  const handleClick = async () => {
    if (disabled) return;
    const pattern = variant === 'primary' ? 'confirm' : 'click';
    if (hapticOn) haptic(pattern === 'confirm' ? 'confirm' : 'tap');
    if (soundOn) sound(pattern, { enabled: true });
    onClick?.();
    // AI action path — swallows provider errors so a single failure
    // doesn't throw out of the click handler and into React's error boundary.
    if (ai) {
      const provider = ai.provider ?? globalAI;
      if (!provider) return;
      try {
        const result = await provider.act(ai.action, ai.context);
        onActionResult?.(result);
      } catch {
        // App surfaces errors via its own toast/log; we stay quiet here.
      }
    }
  };

  return (
    <motion.button
      type="button"
      className={['cathode-button', className].filter(Boolean).join(' ')}
      data-variant={variant}
      disabled={disabled}
      onClick={handleClick}
      whileTap={whileTap}
      aria-label={ariaLabel}
    >
      {icon}
      {children}
    </motion.button>
  );
}
