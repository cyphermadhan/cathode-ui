/**
 * @cathode-ui/react — public entry point.
 *
 * Consumer setup:
 *   import '@cathode-ui/react/tokens.css';
 *   import '@cathode-ui/react/fonts.css';    // optional — remote JetBrains Mono
 *   import { CathodeProvider, Pill, TerminalFrame } from '@cathode-ui/react';
 *
 * Icons live at `@cathode-ui/react/icons` (Phosphor re-exports).
 */

// Provider + hooks
export { CathodeProvider, useCathode } from './CathodeProvider';
export type { CathodeSettings, CathodeProviderProps } from './CathodeProvider';

// Feedback controllers (advanced usage — most apps don't touch these directly)
export { haptic, hapticAvailable } from './feedback/haptic';
export type { HapticPattern } from './feedback/haptic';
export { sound, soundAvailable } from './feedback/sound';
export type { SoundPattern } from './feedback/sound';

// AI surface
export type { CathodeAIProvider, ChatMessage } from './ai/provider';
export { useAiSuggest, useAiChat, useAiAction } from './ai/hooks';

// Components
import './components/base.css';

export { TerminalFrame } from './components/TerminalFrame';
export type { TerminalFrameProps } from './components/TerminalFrame';

export { PixelBar } from './components/PixelBar';
export type { PixelBarProps } from './components/PixelBar';

export { PulsingDot } from './components/PulsingDot';
export type { PulsingDotProps } from './components/PulsingDot';

export { DotLeader } from './components/DotLeader';
export type { DotLeaderProps } from './components/DotLeader';

export { Pill } from './components/Pill';
export type { PillProps, PillAccent } from './components/Pill';

export { Button } from './components/Button';
export type { ButtonProps, ButtonAIConfig } from './components/Button';

export { TextField } from './components/TextField';
export type { TextFieldProps, TextFieldAIConfig } from './components/TextField';

export { StatusTile } from './components/StatusTile';
export type { StatusTileProps } from './components/StatusTile';

export { Toast } from './components/Toast';
export type { ToastProps } from './components/Toast';
