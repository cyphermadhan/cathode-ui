# CATHODE.md

> Read this first if you are an AI coding agent (Claude Code, Cursor, Copilot, etc.) asked to build with Cathode UI. This doc + `cathode.manifest.json` contain everything you need to compose a Cathode app without reading React source.

**Version**: 0.3.0. **Components**: 45.

---

## 1. What Cathode UI is

A retro-future React design system: pure-black / paper-white base, monospace typography (JetBrains Mono), pixel-square corners, tight saturated accents, subtle motion + haptics + sound baked in, AI-native surfaces on four primitives (`TextField` / `SearchBar` / `Chat` / `Button`).

Unique attributes vs. most React design systems:
- **Machine-readable by design.** `cathode.manifest.json` at repo root describes every component — props, examples, `whenToUse`, `vs` disambiguation. Agents should read it instead of scraping React source.
- **MCP server.** `@cathode-ui/mcp` exposes the manifest as Model Context Protocol tools so Claude Code, Cursor, etc. can query Cathode without bundling docs.
- **AI hooks as first-class.** `CathodeAIProvider` + `useAiSuggest` / `useAiChat` / `useAiAction`. Provider-agnostic; apps supply OpenAI / Anthropic / local adapters.

---

## 2. Install + setup

```bash
npm install @cathode-ui/react
```

```tsx
// Root of your app — import these three CSS entry points once.
import '@cathode-ui/react/tokens.css';  // CSS variables + dark/light
import '@cathode-ui/react/fonts.css';   // JetBrains Mono (optional)
import '@cathode-ui/react/styles.css';  // compiled component rules

import { CathodeProvider } from '@cathode-ui/react';

export function App() {
  return (
    <CathodeProvider>
      {/* ...your tree */}
    </CathodeProvider>
  );
}
```

`<CathodeProvider>` accepts:
- `theme`: `'auto' | 'dark' | 'light'` — defaults to `auto` (`prefers-color-scheme`)
- `motion`: `'none' | 'subtle' | 'strong'` — default `'strong'`
- `haptic`: `boolean` — default `true`
- `sound`: `boolean` — default `false` (unexpected audio is hostile)
- `ai`: a `CathodeAIProvider` instance (required for AI-enabled components)

All props are optional. Provider can be nested; inner providers override outer settings.

---

## 3. Picking the right primitive

**First check**: does your intent match a `whenToUse` line below?

### Layout

- **TerminalFrame** — Group a named section of readouts or controls with a visible label — the "┌─ PEERS ─" terminal section.
- **Card** — Wrap any content in a bordered panel without a label — info blocks, grouped form fields, composable widgets.
- **HazardStripes** — Wrap a destructive or high-stakes button/zone in a caution overlay — "ARMED · HOLD TO FIRE", emergency stop zones.
- **Stack** — Replace inline `style={{ display: 'flex', gap: ... }}` scaffolding — a utility wrapper for direction + gap + align + justify + wrap.
- **Accordion** — Stack several expand/collapse sections — settings groups, FAQ, long-form details panels.

### Forms

- **Button** — Fire a one-shot action — submit, delete, cancel, run. Use `variant` for semantic weight and `ai={{ action }}` for AI-routed intents.
- **TextField** — Single-line free-text input. Add `ai={{ suggest: true }}` for inline ghost-text AI completion.
- **TextArea** — Multi-line free-text input — notes, descriptions, bios. Optional character counter when `maxLength` is set.
- **Select** — Pick one value from a finite enum when options are many or space is tight — theme, region, unit.
- **Checkbox** — A boolean form value inside a list of related options — multi-select filters, agreement boxes, parent-of-children rows.
- **RadioGroup** — Pick exactly one option from 2–5 visible alternatives — mode, region, plan tier.
- **Toggle** — Flip a single setting on/off that takes effect immediately — notifications, dark mode, debug overlays.
- **Counter** — Let the user nudge a bounded numeric value up/down — WPM, volume, count. Discrete steps, welded label.
- **SearchBar** — Search/filter across a known dataset with a results dropdown. Toggle `ai={{ semantic: true }}` for provider-ranked results.
- **FormField** — Wrap any Cathode input (TextField, TextArea, Select, Checkbox, RadioGroup, Toggle, Counter) with a label, hint, and/or error message — auto-wires aria attributes.
- **Chips** — Render a horizontally-scrolling row of preset phrases the user inserts once — quick-replies, preset commands, saved filters.

### Data

- **Badge** — Attach a small inline status marker to text — NEW, BETA, v0.3.0, DEPRECATED. Display-only.
- **Tag** — Classify or filter with an accent-colored keyword marker — categories, tech stack, people. Optional × to remove.
- **Avatar** — Identify a person or entity — image or initials fallback in a square, optional presence dot.
- **Kbd** — Display a keyboard shortcut alongside a menu item, tooltip, or docs reference — Cmd+K, Ctrl+Shift+S.
- **CodeBlock** — Show a multi-line code sample in docs, prompt previews, or debug panels. Accepts plain text or pre-highlighted HTML (Shiki / Highlight.js).
- **Table** — Show structured tabular data — columns, rows, optional sort, optional row-click. Consumer controls the sort state.
- **StatusTile** — Render an MPC-style icon + title + subtitle tile in a grid of statuses or shortcut entry points.
- **DotLeader** — Render a single LABEL ……… VALUE row inside a TerminalFrame, Card, or stack of readouts.
- **Pill** — A compact icon+text button used for navigation, filters, or tabs — anything with a persistent `active` state.

### Navigation

- **Tabs** — Switch between related views without leaving the page — Overview / Logs / Settings. Persistent active state.
- **Breadcrumbs** — Show the user's location inside a nested hierarchy — Home › Docs › Tabs. Last item is the current page.
- **Menu** — Reveal a list of actions from a click trigger — context menu, overflow menu, "More actions" dropdown. Keyboard-navigable.
- **Pagination** — Let the user jump between pages of a long list — prev/next arrows + windowed page buttons with ellipses.

### Feedback

- **ProgressBar** — Show determinate progress as a continuous bar — downloads, uploads, task %. Omit `value` for indeterminate shimmer.
- **Loader** — Indicate a general "please wait, working on it" state when duration is unknown.
- **Skeleton** — Hold the shape of content that's still loading — row heights, card footprints — so the page doesn't jump when data arrives.
- **PixelBar** — Show a real-time VU-meter-style level (volume, signal intensity) as discrete pixel cells.
- **ActivityBar** — Show a "traffic / activity / thinking" indicator where the exact level is meaningless — deterministic pseudo-random per seed.
- **SignalBars** — Display a "strength of N" reading — cellular bars, battery, reception level.
- **PulsingDot** — Attach a small live-status signal to a label or row — LIVE / SCANNING / ONLINE.
- **Toast** — Surface a short transient status — session resumed, copied to clipboard, connection lost. App controls timing.

### Overlays

- **Dialog** — Block the UI until the user confirms, chooses, or dismisses — destructive confirmations, wizards, full-form panels.
- **Drawer** — Slide in a side panel from the viewport edge — filters, inspector, settings — without covering the underlying page.
- **Popover** — Show rich anchored content from a click trigger — details cards, mini-forms, property editors. Portaled, non-modal.
- **Tooltip** — Attach a short hover/focus hint to a control — keyboard shortcut, terse explanation. Text-only.

### AI

- **Chat** — Drop in a ready-made AI conversation UI — streaming assistant text, send/cancel, auto-scroll, hooked to a `CathodeAIProvider`.

### Retro

- **ScanLine** — Wrap a surface in a decorative CRT scan-line + sweep overlay — live camera feeds, retro dashboards.
- **TypewriterText** — Reveal short text character-by-character for dramatic effect — boot-up messages, AI turn-in-progress, intro hooks.
- **Countdown** — Count down to a specific Date in real time — launch timers, expiry countdowns, game rounds.


**Second check**: two sound plausible? Consult the disambiguation table:

| Pair | Picker |
|---|---|
| `TerminalFrame` vs `Card` | TerminalFrame when the section needs a visible name; Card when content speaks for itself. |
| `Card` vs `TerminalFrame` | Card when you don't need an inset title; TerminalFrame when you do. |
| `Card` vs `StatusTile` | Card for freeform content; StatusTile for the standard icon + title + subtitle pattern. |
| `PixelBar` vs `ProgressBar` | PixelBar for discrete level meters; ProgressBar for continuous determinate progress (e.g. download %). |
| `PixelBar` vs `ActivityBar` | PixelBar for a known level 0–1; ActivityBar for pseudo-random "something is happening" animation. |
| `PulsingDot` vs `Avatar` | PulsingDot for an abstract status indicator; Avatar's status dot when it's tied to a specific person. |
| `PulsingDot` vs `Badge` | PulsingDot for live animated state; Badge for static labels (NEW / BETA). |
| `DotLeader` vs `Table` | DotLeader for 1–8 rows of key/value pairs; Table for multi-column tabular data. |
| `Pill` vs `Button` | Pill when the button represents persistent state (current tab, selected filter); Button for one-shot actions (Save, Delete). |
| `Pill` vs `Tag` | Pill is tappable and can be active; Tag is a static label (optionally removable). |
| `Pill` vs `Chips` | Pill for nav; Chips for a scrolling row of preset phrases inserted once then cleared. |
| `Button` vs `Pill` | Button for one-shot actions; Pill for nav/filter state. |
| `Button` vs `Menu` | Single Button for one action; Menu when the button reveals a list of actions. |
| `TextField` vs `TextArea` | TextField for single-line; TextArea for multi-line. |
| `TextField` vs `Counter` | TextField for free-form numbers you want the user to type; Counter for bounded values nudged with arrow buttons. |
| `TextField` vs `SearchBar` | TextField for a free-form value; SearchBar when you want a results dropdown under the input. |
| `StatusTile` vs `Card` | StatusTile for the fixed icon/title/subtitle pattern; Card for custom content. |
| `StatusTile` vs `Pill` | StatusTile is a chunky tile in a grid; Pill is a compact inline button. |
| `ActivityBar` vs `PixelBar` | ActivityBar for decorative/indeterminate activity; PixelBar for a real quantitative level. |
| `ActivityBar` vs `Loader` | ActivityBar is part of a UI readout; Loader is a standalone "please wait" indicator. |
| `HazardStripes` vs `Button variant=danger` | Button danger for standard destructive buttons; HazardStripes adds the extra visual weight for irreversible / armed states. |
| `Toggle` vs `Checkbox` | Toggle for immediate settings; Checkbox for form values in a list (multi-select, indeterminate). |
| `Counter` vs `TextField` | Counter for bounded integer-ish values; TextField for free-form numbers. |
| `Counter` vs `Select` | Counter for a range; Select for a finite enum. |
| `Chips` vs `Tabs` | Chips for one-shot inserts that clear; Tabs for switching which view is active. |
| `Chips` vs `Pill` | Chips for a scroll row of presets; Pill for a single nav/action button. |
| `Chips` vs `Tag` | Chips are tappable actions; Tag is a display-only label (optionally removable). |
| `SearchBar` vs `Select` | SearchBar for fuzzy search over a large/unknown set; Select for a finite enum picker. |
| `SearchBar` vs `TextField` | SearchBar when you need a results dropdown; TextField for free text with no suggestions. |
| `Dialog` vs `Drawer` | Dialog for centered modal focus; Drawer for a side/top/bottom panel that doesn't fully cover the page. |
| `Dialog` vs `Popover` | Dialog is modal and portaled; Popover is anchored and non-modal. |
| `Chat` vs `TextField` | Chat for conversational back-and-forth; TextField for a single AI-suggested completion. |
| `Checkbox` vs `Toggle` | Checkbox for form values you submit; Toggle for immediate-effect settings. |
| `Checkbox` vs `RadioGroup` | Checkbox for multi-select (any can be on); RadioGroup for single-select (exactly one). |
| `RadioGroup` vs `Select` | RadioGroup when all options should be visible at once; Select when the list is long or space is tight. |
| `RadioGroup` vs `Checkbox` | RadioGroup for single-select; Checkbox for multi-select. |
| `RadioGroup` vs `Tabs` | RadioGroup for form values you submit; Tabs for switching which view is shown. |
| `Select` vs `RadioGroup` | Select for long/hidden lists; RadioGroup when showing all options helps the user compare. |
| `Select` vs `SearchBar` | Select for finite enums; SearchBar for fuzzy matching over an open set. |
| `TextArea` vs `TextField` | TextArea for multi-line; TextField for single-line. |
| `FormField` vs `Toast` | FormField error for inline validation beside the input; Toast for out-of-band global notices. |
| `Badge` vs `Tag` | Badge for status labels (solid fill by default, display-only); Tag for keywords/filters (outlined, optional remove). |
| `Badge` vs `PulsingDot` | Badge for static status text; PulsingDot for live animated state dot. |
| `Tag` vs `Badge` | Tag for keyword/filter labels (often removable); Badge for status markers (display-only). |
| `Tag` vs `Chips` | Tag represents a classification; Chips is an interactive row of preset phrases. |
| `Avatar` vs `StatusTile` | Avatar represents a person; StatusTile represents a named system or app surface. |
| `Kbd` vs `CodeBlock` | Kbd for keyboard keys; CodeBlock for code. |
| `CodeBlock` vs `inline <code>` | CodeBlock for multi-line; inline `<code>` for single terms in prose. |
| `Table` vs `DotLeader` | Table for multi-column data; DotLeader for a handful of key/value rows. |
| `Tabs` vs `RadioGroup` | Tabs for switching which view is shown; RadioGroup for form values you submit. |
| `Tabs` vs `Pill` | Tabs for a compact tab row with underline; Pill for standalone nav buttons. |
| `Tabs` vs `Chips` | Tabs for persistent view state; Chips for one-shot preset phrases. |
| `Breadcrumbs` vs `Tabs` | Breadcrumbs shows *where you are* in a hierarchy; Tabs switches between *peer* views. |
| `Menu` vs `Select` | Menu for a list of actions (each does something); Select for picking one value. |
| `Menu` vs `Popover` | Menu for a canonical list of menu items; Popover for arbitrary panel content. |
| `Pagination` vs `Table with scroll` | Pagination for discrete pages; unpaginated scroll when the list is short or infinite-scroll is natural. |
| `Popover` vs `Tooltip` | Popover for rich click-triggered content; Tooltip for short hover/focus-triggered text hints. |
| `Popover` vs `Menu` | Popover for arbitrary content; Menu for a canonical list of actions. |
| `Popover` vs `Dialog` | Popover is anchored + non-modal; Dialog is centered + modal. |
| `Tooltip` vs `Popover` | Tooltip for text-only hints on hover; Popover for rich click-triggered panels. |
| `Drawer` vs `Dialog` | Drawer for edge-anchored panels (non-modal by default); Dialog for centered modal focus. |
| `Drawer` vs `Popover` | Drawer for full-height edge panels; Popover for small anchored floaters. |
| `ProgressBar` vs `PixelBar` | ProgressBar for completion %; PixelBar for real-time level meters. |
| `ProgressBar` vs `Loader` | ProgressBar when you know the %; Loader when duration is unknown. |
| `Loader` vs `ProgressBar` | Loader for unknown duration; ProgressBar for known %. |
| `Loader` vs `Skeleton` | Loader in-place of a button/readout while it waits; Skeleton in-place of content layout before it arrives. |
| `Skeleton` vs `Loader` | Skeleton mirrors the eventual layout; Loader is a small spinner-style indicator. |
| `SignalBars` vs `PixelBar` | SignalBars for a 1-of-N strength indicator with ascending bar heights; PixelBar for a horizontal row of equal-height cells. |
| `SignalBars` vs `ProgressBar` | SignalBars for a discrete 0–5 level; ProgressBar for continuous %. |
| `ScanLine` vs `HazardStripes` | ScanLine for CRT/retro styling; HazardStripes for "caution/armed" overlay on destructive zones. |
| `TypewriterText` vs `Chat streaming` | TypewriterText for static pre-known text; Chat's streaming handles real AI-generated tokens. |
| `Countdown` vs `Counter` | Countdown auto-ticks toward a target Date; Counter is a manual numeric rocker. |
| `Stack` vs `Card` | Stack is structural (no chrome); Card is visual (border + optional fill). |
| `Accordion` vs `Tabs` | Accordion shows multiple sections simultaneously (or none); Tabs shows exactly one at a time. |
| `Toast` vs `Dialog` | Toast for transient confirmations; Dialog when the user must acknowledge or choose. |
| `Toast` vs `FormField error` | Toast for global notices; FormField `error` for inline validation. |

---

## 4. Design tokens

All values live in `tokens.json` and are emitted as CSS custom properties (`--cathode-color-*`, `--cathode-space-*`, etc.) and Figma Variables.

**Semantic colors** (state-carrying — use for meaning):
`danger` · `success` · `warning` · `info` · `accent`

**Palette colors** (differentiation only — no semantic claim):
`amber` · `pink` · `purple` · `teal` · `grey`

Most components take an `accent` or `kind` prop that selects from one of these names; don't hardcode hex values.

**Typography**: JetBrains Mono, size scale = caption (9) / readout (11) / label (13) / number (16) / display (24) / hero (36). Tracking (letter-spacing): header 2.0, label 1.4, caption 0.8.

**Spacing**: `xs` (4) · `sm` (8) · `md` (12) · `lg` (16) · `xl` (24) · `xxl` (32).

**Motion**: durations `instant` (80ms) / `quick` (150ms) / `settled` (300ms) / `slow` (500ms).

---

## 5. AI-enabled primitives

Four primitives accept an `ai` prop. Behavior is a no-op until a provider is supplied.

```tsx
import { CathodeProvider, type CathodeAIProvider } from '@cathode-ui/react';

const provider: CathodeAIProvider = {
  async *suggest(prefix, signal) { /* stream completion tail */ },
  async *chat(messages, signal)  { /* stream assistant reply */ },
  async act(intent, context, signal) { /* one-shot returns string */ },
};

<CathodeProvider ai={provider}>
  <TextField  value={v} onChange={setV} ai={{ suggest: true }} />
  <SearchBar  items={items} onSelect={pick} ai={{ semantic: true }} />
  <Chat       systemPrompt="You are terse." />
  <Button     ai={{ action: 'explain', context: data }} onActionResult={setResult}>
    EXPLAIN
  </Button>
</CathodeProvider>
```

---

## 6. Feedback (motion, haptic, sound)

Every interactive primitive emits:
- A framer-motion press animation (scale 0.97 in `strong` mode, 0.99 in `subtle`, off in `none`)
- A `navigator.vibrate` haptic pattern (no-op on iOS Safari — documented)
- An optional Web Audio oscillator sound (off by default)

Six sound patterns: `click` / `tick` / `confirm` / `warn` / `error` / `destructive`.
Six haptic patterns: `tap` / `confirm` / `warn` / `error` / `destructive` / `long`.

Each component documents which pattern it fires in `manifest.components[i].feedback`.

Users control all three globally via `<CathodeProvider motion|haptic|sound>`. Components can opt out locally via `feedback={false}` where supported.

---

## 7. Manifest & MCP

`cathode.manifest.json` at repo root is the full machine-readable spec. JSON Schema at `scripts/manifest.schema.json`. Every regen validates against the schema.

`@cathode-ui/mcp` exposes five tools over stdio for agent integration:
- `cathode_list_components()` — names + summaries
- `cathode_get_component(name)` — full spec including `whenToUse` + `vs`
- `cathode_get_tokens(theme?)` — resolved color set + theme-independent tokens
- `cathode_search(query)` — substring match against names + summaries
- `cathode_suggest_component(intent)` — ranked list of components matching an intent phrase

Wire into `.mcp.json`:

```json
{
  "mcpServers": {
    "cathode-ui": {
      "command": "node",
      "args": ["/path/to/cathode-ui/packages/mcp-server/dist/server.js"]
    }
  }
}
```

---

## 8. Canonical syntax cheatsheet

```tsx
// Layout
<TerminalFrame title="TELEMETRY" accent="info">…</TerminalFrame>
<Card surface="elevated" accent="info" padding="md">…</Card>
<Stack direction="row" gap={8} align="center">…</Stack>

// Action
<Button variant="primary" icon={<IconCheck />}>SAVE</Button>
<Pill title="HOME" active accent="info" />

// Form inputs — every one is controlled value+onChange
<TextField  value={v} onChange={setV} placeholder="TYPE HERE" />
<TextArea   value={v} onChange={setV} maxLength={160} />
<Select     value={v} onChange={setV} options={[{value:"a",label:"A"}]} />
<Checkbox   value={v} onChange={setV} label="NOTIFY" />
<RadioGroup value={v} onChange={setV} options={opts} aria-label="Mode" />
<Toggle     value={v} onChange={setV} label="ENABLED" />
<Counter    value={v} onChange={setV} min={0} max={10} label="COUNT" />
<FormField label="EMAIL" error={err} required>
  <TextField value={v} onChange={setV} />
</FormField>

// Data display
<Badge kind="success">NEW</Badge>
<Tag accent="info" onRemove={() => drop()}>FILTER</Tag>
<DotLeader label="LATENCY" value="42 MS" valueColor="var(--cathode-color-success)" />
<Kbd keys="Cmd+K" />
<CodeBlock language="ts" code="const x = 1;" />

// Overlays
<Dialog open={x} onClose={close} title="CONFIRM" accent="danger">…</Dialog>
<Drawer open={x} onClose={close} title="FILTERS" side="right">…</Drawer>
<Popover trigger={<Button>OPEN</Button>}>…</Popover>
<Tooltip label="Save — Cmd+S"><Button>SAVE</Button></Tooltip>

// Feedback
<ProgressBar value={0.42} showValue />
<Loader size="md" accent="info" />
<Skeleton variant="text" width={180} />
```

---

## 9. Where to look next

- The manifest itself: `cathode.manifest.json`. Every component entry has a full `examples` array with canonical calls.
- Docs site: https://cathode-ui.dev (or run `cd site && npm run dev` locally).
- Figma library: https://www.figma.com/design/yudyQFCPwX1FSLcXBXuVvY/Cathode-UI.
- MCP server source: `packages/mcp-server/`.
