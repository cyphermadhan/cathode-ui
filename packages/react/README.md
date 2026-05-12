# @cathode-ui/react

Retro-future React design system. 45 primitives with pure-black / paper-white
base, monospace typography, pixel shapes, tight saturated accents, motion +
haptics + sound baked in, AI-native surfaces on four primitives.

By [Madhan Raj](https://www.linkedin.com/in/cyphermadhan/).

**[Docs →](https://cyphermadhan.github.io/cathode-ui/)**

---

> ## For AI coding agents
>
> This package ships two files designed for you — load them before
> composing UI:
>
> - **`node_modules/@cathode-ui/react/CATHODE.md`** — long-form
>   onboarding: install, setup, theming, motion/haptic/sound model,
>   AI-hook surface, cluster overview.
> - **`node_modules/@cathode-ui/react/cathode.manifest.json`** —
>   structured registry of every component with `props`, `whenToUse`,
>   `vs` disambiguation, `examples`, `a11y`, `feedback`, and
>   framework-specific `adapters`.
>
> Read those and you have full Cathode context — no scraping source,
> no doc-hunting. For interactive discovery
> (`suggest_component(intent)`), also see
> [`@cathode-ui/mcp`](https://www.npmjs.com/package/@cathode-ui/mcp)
> — configure once, every MCP-aware tool (Claude Code, Cursor,
> Windsurf, Codex, VS Code) gets tool access to the manifest.

---

## Install

```bash
npm install @cathode-ui/react
```

Peer deps: `react >= 18`, `react-dom >= 18`.

## AI-native

Cathode is designed to be read by AI coding agents first. A machine-readable
`cathode.manifest.json` describes every component — props, `whenToUse`, `vs`
disambiguation, accessibility, feedback patterns, usage examples — validated
against a published JSON Schema.

A companion [`@cathode-ui/mcp`](https://www.npmjs.com/package/@cathode-ui/mcp)
Model Context Protocol server exposes the manifest as tools so Claude Code,
Cursor, etc. can discover and suggest components by intent.

## What's inside

**45 primitives** across 8 clusters:

- **Layout** — TerminalFrame, Card, Stack, Accordion, HazardStripes
- **Forms** — Button, TextField, TextArea, Select, Checkbox, RadioGroup,
  Toggle, Counter, SearchBar, FormField, Chips
- **Data** — Badge, Tag, Avatar, Kbd, CodeBlock, Table, StatusTile,
  DotLeader, Pill
- **Navigation** — Tabs, Breadcrumbs, Menu, Pagination
- **Feedback** — ProgressBar, Loader, Skeleton, PixelBar, ActivityBar,
  SignalBars, PulsingDot, Toast
- **Overlays** — Dialog, Drawer, Popover, Tooltip
- **AI** — Chat (first-class AI conversation component)
- **Retro** — ScanLine, TypewriterText, Countdown

Plus opt-in AI hooks on `TextField` (ghost-text suggest), `SearchBar`
(semantic search), `Button` (AI action routing).

## Accessibility

Every primitive is tested against `@axe-core/playwright` with WCAG 2.0/2.1
A+AA tags. The docs site runs the full gate on every build.

## Setup

```tsx
// Root of your app — import these three CSS entry points once.
import '@cathode-ui/react/tokens.css';   // CSS variables + dark/light
import '@cathode-ui/react/fonts.css';    // JetBrains Mono (optional)
import '@cathode-ui/react/styles.css';   // compiled component rules

import { CathodeProvider } from '@cathode-ui/react';

export function App() {
  return (
    <CathodeProvider>
      {/* ...your tree */}
    </CathodeProvider>
  );
}
```

`<CathodeProvider>` accepts: `theme` (`auto` / `dark` / `light`), `motion`
(`none` / `subtle` / `strong`), `haptic` (bool), `sound` (bool — default
off), `ai` (a `CathodeAIProvider` instance).

## Quick taste

```tsx
import {
  TerminalFrame, DotLeader, Pill, Button,
  TextField, FormField, Toggle,
  Dialog, Chat,
} from '@cathode-ui/react';

<TerminalFrame title="TELEMETRY" accent="info">
  <DotLeader label="LATENCY" value="42 MS" />
  <DotLeader label="STATE"   value="LIVE" valueColor="var(--cathode-color-success)" />
</TerminalFrame>

<FormField label="CALLSIGN" hint="4 characters, alphanumeric." required>
  <TextField value={callsign} onChange={setCallsign} />
</FormField>

<Button variant="primary">SAVE</Button>
```

## Author

Built by **[Madhan Raj](https://www.linkedin.com/in/cyphermadhan/)**.

## License

MIT.
