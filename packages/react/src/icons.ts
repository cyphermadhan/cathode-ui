/**
 * Curated Cathode icon set — a subset of Phosphor Icons re-exported
 * under names that match the app-layer vocabulary (Walkie-style).
 * Apps that want the full 9k Phosphor catalog can import directly
 * from `@phosphor-icons/react` — Cathode's curation is a sensible
 * default for common retro-terminal affordances.
 *
 * All icons are re-exported at their `bold` weight by default (via
 * the `weight="bold"` prop on the source components) — that's the
 * weight that reads best next to the terminal-mono type. Consumers
 * override via the `weight` prop if they want different.
 */
export {
  // Signals + comms
  // (Phosphor has no dedicated "Antenna" glyph — Broadcast covers the
  // same semantic and reads correctly in a terminal context.)
  Broadcast as IconAntenna,
  Broadcast as IconBroadcast,
  CellSignalHigh as IconSignal,
  WifiHigh as IconWifi,
  Bluetooth as IconBluetooth,

  // Presence / status
  Dot as IconDot,
  Circle as IconCircle,
  Square as IconSquare,
  CheckCircle as IconCheck,
  XCircle as IconFailure,
  Warning as IconWarn,

  // Input
  Microphone as IconMic,
  Camera as IconCamera,
  Ear as IconEar,
  SpeakerHigh as IconSpeaker,

  // Nav / chrome
  ChatCircle as IconChat,
  Chats as IconConversation,
  Gear as IconSettings,
  Sliders as IconSliders,
  List as IconList,
  MagnifyingGlass as IconSearch,

  // Data / meters
  ChartBar as IconChart,
  Gauge as IconGauge,
  Waveform as IconWaveform,

  // Editing
  Plus as IconPlus,
  Minus as IconMinus,
  CaretUpDown as IconCaretUpDown,
  X as IconClose,

  // AI
  Sparkle as IconSparkle,
  Brain as IconBrain,
  Robot as IconRobot,
} from '@phosphor-icons/react';
