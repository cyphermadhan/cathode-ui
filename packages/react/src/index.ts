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

export { Card } from './components/Card';
export type { CardProps } from './components/Card';

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

export { ActivityBar } from './components/ActivityBar';
export type { ActivityBarProps } from './components/ActivityBar';

export { HazardStripes } from './components/HazardStripes';
export type { HazardStripesProps } from './components/HazardStripes';

export { Toggle } from './components/Toggle';
export type { ToggleProps } from './components/Toggle';

export { Counter } from './components/Counter';
export type { CounterProps } from './components/Counter';

export { Chips } from './components/Chips';
export type { ChipsProps, Chip } from './components/Chips';

export { SearchBar } from './components/SearchBar';
export type { SearchBarProps, SearchBarAIConfig, SearchItem } from './components/SearchBar';

export { Dialog } from './components/Dialog';
export type { DialogProps } from './components/Dialog';

export { Chat } from './components/Chat';
export type { ChatProps } from './components/Chat';

export { Checkbox } from './components/Checkbox';
export type { CheckboxProps } from './components/Checkbox';

export { RadioGroup } from './components/RadioGroup';
export type { RadioGroupProps, RadioOption } from './components/RadioGroup';

export { Select } from './components/Select';
export type { SelectProps, SelectOption } from './components/Select';

export { TextArea } from './components/TextArea';
export type { TextAreaProps } from './components/TextArea';

export { FormField } from './components/FormField';
export type { FormFieldProps } from './components/FormField';

export { Badge } from './components/Badge';
export type { BadgeProps } from './components/Badge';

export { Tag } from './components/Tag';
export type { TagProps, TagAccent } from './components/Tag';

export { Avatar } from './components/Avatar';
export type { AvatarProps, AvatarStatus, AvatarAccent } from './components/Avatar';

export { Kbd } from './components/Kbd';
export type { KbdProps } from './components/Kbd';

export { CodeBlock } from './components/CodeBlock';
export type { CodeBlockProps } from './components/CodeBlock';

export { Table } from './components/Table';
export type { TableProps, TableColumn } from './components/Table';
