# Cathode UI — Design System Plan

## Context

A distinctive retro-future UI — pure-black base, monospace type, pixel
shapes, dot-leaders, tight saturated accents, composed from a small core
set of primitives. Nothing open source ships this exact flavor. The
aesthetic is worth packaging as a standalone, multi-platform design
system.

**Cathode UI** is that system. It adds motion, haptics, sound, and an
AI-driven surface to every primitive — a design system aimed at agentic
workflows as much as human ones.

**Repo location:** `~/Documents/GitHub/cathode-ui/`.

**Output scope (user-confirmed, phase-ordered):**
1. Web (React + CSS custom properties) — **Phase 1**
2. Figma library + docs site — Phase 2
3. Swift package (iOS/macOS) — Phase 3
4. Other frameworks (React Native, Vue, etc.) — later

**Out of scope for v1:** Android native, charting, full form library beyond the primitives listed.

---

## Goals

1. **React-first.** Phase 1 produces a publishable `@cathode-ui/react` npm package with full primitive coverage + docs.
2. **Dark + light themes by default**, switched via `prefers-color-scheme`. Light theme is cool paper-white + blue-grey ink.
3. **Responsive for mobile + desktop browsers.** Touch targets ≥44px, container queries for adaptive layouts, rem-based scaling.
4. **Motion, haptics, sound** first-class. Every component has a motion profile and optional haptic/sound feedback. Global + per-component overrides.
5. **AI-friendly.** Machine-readable component manifest + MCP server + structured docs so AI agents can discover, query, and compose Cathode primitives without reading source.
6. **AI-enabled components.** A specific subset (`TextField`, `SearchBar`, `Chat`, `Button`) ship with built-in AI hooks.
7. **Self-contained.** Standalone repo; no cross-project dependencies or implicit consumers.

---

## Architecture

### Repo layout (monorepo)

```
cathode-ui/
├── tokens/
│   └── tokens.json                ← source of truth: colors/type/spacing/motion/sound
├── scripts/
│   ├── gen-css.js                 ← tokens.json → CSS custom properties
│   ├── gen-swift.js               ← tokens.json → Swift constants (Phase 3)
│   └── gen-manifest.js            ← scans components/, emits cathode.manifest.json
├── packages/
│   ├── react/                     ← @cathode-ui/react (Phase 1)
│   │   ├── package.json
│   │   ├── src/
│   │   │   ├── tokens.css         (generated from tokens.json)
│   │   │   ├── fonts.css          (@font-face JetBrains Mono)
│   │   │   ├── CathodeProvider.tsx
│   │   │   ├── components/
│   │   │   │   ├── TerminalFrame.tsx
│   │   │   │   ├── PixelBar.tsx
│   │   │   │   ├── Pill.tsx
│   │   │   │   └── ... (one file per primitive)
│   │   │   ├── motion/            (framer-motion variants per component)
│   │   │   ├── feedback/          (haptic, sound controllers)
│   │   │   ├── ai/                (AI hooks: useAiSuggest, useAiChat, …)
│   │   │   └── index.ts
│   │   └── vite.config.ts
│   ├── mcp-server/                ← @cathode-ui/mcp (Phase 1b)
│   │   ├── package.json
│   │   └── src/server.ts          (exposes list_components, get_spec, get_tokens)
│   └── swift/                     ← Phase 3
├── figma/
│   └── CathodeUI.fig              ← Phase 2
├── cathode.manifest.json          ← generated; AI agents read this
└── site/                          ← docs (Astro) — Phase 2
    └── pages/
```

### Token source of truth

`tokens.json` is canonical. Shape:

```json
{
  "color": {
    "dark":  { "bg": "#000000", "text": "#EAEAEA", "info": "#38A8E2", ... },
    "light": { "bg": "#F6F7F2", "text": "#1B2030", "info": "#1E6FA8", ... }
  },
  "type":    { "scale": { "caption": 9, "label": 13, "display": 24 }, "trackingLabel": 1.4 },
  "spacing": { "framePad": 12, "rowHeight": 28 },
  "size":    { "pixelCell": 6, "touchTargetMin": 44 },
  "motion":  {
    "duration": { "instant": 80, "quick": 150, "settled": 300 },
    "ease":     { "snap": "cubic-bezier(0.4, 0, 0.2, 1)" }
  },
  "sound":   {
    "click":   { "freq": 1200, "ms": 30 },
    "confirm": { "freq": 800,  "ms": 80 },
    "error":   { "freq": 200,  "ms": 120 }
  },
  "haptic":  { "tap": 10, "confirm": 20, "error": [20, 40, 20] }
}
```

Generator scripts emit:
- `packages/react/src/tokens.css` — CSS custom properties scoped by `prefers-color-scheme`
- Swift constants (Phase 3)
- Figma variable-import JSON (manual paste for now, or Tokens Studio plugin)

### Theme handling

- **CSS variables** under `:root` (light default) + `@media (prefers-color-scheme: dark)` override block. Zero JS theme logic needed.
- `<CathodeProvider>` React context carries non-color settings (motion intensity, haptic/sound enabled, AI provider). Optional per-component overrides via props.

### Responsive / mobile-and-web

- Base sizing in `rem`. Root font size via `clamp()` so it scales with viewport.
- All interactive targets ≥ `var(--cathode-touch-min)` (44px default).
- Container queries (`@container`) on primitives so a `TerminalFrame` in a narrow sidebar lays out differently than one at full width.
- Primitives don't assume viewport width; they adapt to their container.

### Motion system

- Every component has a **motion profile** with named states (`idle`, `hover`, `press`, `active`, `enter`, `exit`).
- Built on `framer-motion` (React). Profile = `Variants` object.
- Motion intensity is user-controllable:
  - `<CathodeProvider motion="subtle">` — minimal movement
  - `<CathodeProvider motion="strong">` — full expression
  - `<CathodeProvider motion="none">` — respects `prefers-reduced-motion` automatically
- Per-component override: `<Pill motion="none">`.
- Signatures built-in: pressed tiles recoil 2% scale; TerminalFrame title wipes in; PixelBar cells cascade-fill.

### Haptic system

- `navigator.vibrate()` wrapper. Safe fallback (no-op on unsupported browsers).
- Per-component opt-in via `haptic` prop or global provider.
- Patterns defined in `tokens.json → haptic`: `tap` (10ms), `confirm` (20ms), `error` ([20,40,20]ms buzz).
- iOS Safari limitations noted (WebKit ignores `vibrate`); docs call this out and suggest the Swift package for iOS apps that need real haptics.

### Sound system

- Web Audio API oscillator-based (no audio files). Matches the hardware-synth aesthetic, keeps the package tiny.
- Sound palette defined in `tokens.json → sound`:
  - `click` (high-pitched short pulse) — button/pill taps
  - `confirm` (mid-pitched medium) — successful action
  - `error` (low-pitched long) — validation fail
  - `tick` (minimum energy) — value change (slider, stepper)
- Opt-in via `sound` prop or provider. Defaults to **off** (users have to enable) — unexpected sounds are hostile.
- Global mute respects `<audio>` user preference.

### AI-friendly infrastructure

Two layers:

**1. Manifest.** `scripts/gen-manifest.js` walks `packages/react/src/components/` and emits `cathode.manifest.json`:

```json
{
  "version": "0.1.0",
  "components": [
    {
      "name": "Pill",
      "description": "Icon + text nav button…",
      "props": [
        { "name": "title", "type": "string", "required": true },
        { "name": "icon", "type": "ReactNode", "required": false },
        { "name": "active", "type": "boolean", "default": false },
        { "name": "accent", "type": "'talk'|'chat'|'listen'|'settings'|'custom'" }
      ],
      "variants": [
        { "name": "active-talk", "snippet": "<Pill title=\"TALK\" icon=…active accent=\"talk\"/>" }
      ],
      "motionStates": ["idle","hover","press","active"],
      "a11y": { "role": "button", "requires": ["accessible label"] },
      "feedback": { "haptic": "tap", "sound": "click" }
    }
  ],
  "tokens": { "$ref": "tokens.json" }
}
```

The manifest is committed. AI agents reading the repo don't need to parse source — the manifest tells them everything.

**2. MCP server.** `packages/mcp-server/` ships a Node-based Model Context Protocol server exposing tools:

- `cathode_list_components()` → component names + summaries
- `cathode_get_component(name)` → full spec from manifest
- `cathode_get_tokens(theme?)` → resolved color/type/spacing values
- `cathode_search(query)` → fuzzy-match against component descriptions

Configure in `.mcp.json` / Claude Code / Cursor — AI coding agents get live design-system context without scraping docs.

### Per-component AI capabilities

Not every component needs AI. Targeted set for v1:

| Component    | AI hook                             | Behavior |
|--------------|-------------------------------------|----------|
| `TextField`  | `ai={{ suggest: true, provider }}` | Inline completion (grey ghost text, tab to accept). Uses the passed provider (`openai`, `anthropic`, custom). |
| `SearchBar`  | `ai={{ semantic: true, provider }}`| Semantic search over a passed-in dataset; ranked results. |
| `Chat`       | *first-class component*             | Conversation UI with streaming assistant response. Pluggable provider + tool-calling hooks. Cathode styling out of the box. |
| `Button`     | `ai={{ action: "explain" }}`        | Declarative AI actions; Cathode routes through the configured provider and returns a result the app handles. |

Providers abstracted behind a `CathodeAIProvider` interface — app supplies an implementation (OpenAI, Anthropic, local, etc.); Cathode stays provider-agnostic. Reference adapters shipped separately in `@cathode-ui/provider-openai`, etc., so core package stays light.

---

## Primitives inventory (Phase 1, React)

Core primitives that define the aesthetic:

| Primitive         | Purpose |
|-------------------|---------|
| **TerminalFrame** | Bordered box with inset title — the `┌─ PEERS ─` look. |
| **PixelBar**      | Discrete-cell level meter. |
| **ActivityBar**   | Pseudo-random VU meter, deterministic per seed. |
| **DotLeader**     | `LABEL ……… VALUE` terminal readout. |
| **StatusTile**    | MPC-style icon + title + subtitle tile. |
| **PulsingDot**    | Small square that pulses for live / active state. |
| **Pill**          | Icon + text nav / action button with persistent `active` state. |
| **HazardStripes** | Decorative diagonal-stripe overlay for armed / caution states. |

**New primitives for Cathode UI:**

| Primitive        | Purpose |
|------------------|---------|
| **TextField**    | Monospace text input with optional AI suggest. |
| **Button**       | Primary / secondary / terminal variants. |
| **SearchBar**    | Monospace search input with optional semantic AI search. |
| **Chat**         | Conversation component for AI/messaging. |
| **Toast**        | Terminal-style status notification. |
| **Dialog**       | Modal with TerminalFrame chrome. |
| **Chips**        | Tappable preset chips — a scrolling row of one-shot phrase inserts. |
| **Counter**      | `−  value  +` rocker for bounded numeric values. |
| **Toggle**       | On/off switch in the Cathode language. |

---

## Icons — recommendation

**Primary: [Phosphor Icons](https://phosphoricons.com/)** (`@phosphor-icons/react`).

Why it fits:
- Name is literally on-brand (Cathode ↔ Phosphor, the CRT glow material).
- Stroke-based, clean, 9k+ icons — comprehensive enough no app runs out.
- Multiple weights: `thin / light / regular / bold / fill / duotone`. Cathode standardizes on **bold** for the terminal feel.
- MIT licensed, tree-shakeable, React package is well-maintained.
- The `duotone` variant has a two-tone aesthetic that mirrors the dim/bright tokens we already use.

**Secondary option (future):** custom pixel-art icon set — 8×8 or 12×12 px icons for the places Phosphor doesn't fit (walkie-talkie, radio tower, signal bars). A Phase 3+ addition.

Cathode UI will re-export a curated subset of Phosphor via `@cathode-ui/react/icons` so consumers have a consistent default without pulling the full 9k catalog.

---

## Sequencing

### Phase 1 — React package + AI infrastructure (~5–7 days)
1. Init `cathode-ui/` monorepo (pnpm workspaces). `packages/react/` Vite + TypeScript scaffold.
2. `tokens/tokens.json` built with color / type / spacing / size tokens plus new motion / haptic / sound token groups.
3. `scripts/gen-css.js` runs, emits `tokens.css`.
4. Implement `CathodeProvider` (theme context + motion intensity + haptic/sound globals).
5. Port primitives one at a time with matching motion/haptic/sound hooks:
   `TerminalFrame`, `PixelBar`, `ActivityBar`, `DotLeader`, `StatusTile`, `PulsingDot`, `Pill`, `HazardStripes`.
6. Add new primitives: `TextField`, `Button`, `SearchBar`, `Chat`, `Toast`, `Dialog`, `Chips`, `Stepper`, `Toggle`.
7. Implement `@cathode-ui/react/icons` curated Phosphor re-export.
8. AI hooks: `useAiSuggest`, `useAiChat`, `useAiAction`. `CathodeAIProvider` interface. No reference provider adapter in v1 — consumer apps implement.
9. `scripts/gen-manifest.js` scans components, emits `cathode.manifest.json`.
10. `packages/mcp-server/` — Node MCP server exposing the four tools.
11. Storybook (`@storybook/react-vite`) — one story per primitive, both themes, motion/haptic/sound toggles.
12. Publish `@cathode-ui/react` + `@cathode-ui/mcp` (private npm initially).

**Verification:**
- `pnpm build` produces ESM bundle <40 KB gzip.
- Storybook renders every primitive in both themes, with working motion/haptic/sound controls.
- `cathode.manifest.json` validates against a JSON schema.
- MCP server connects to Claude Code via `.mcp.json`; `cathode_list_components()` returns the list.
- A throwaway Next.js consumer app imports two primitives and renders both themes correctly in mobile Safari.

### Phase 2 — Docs site + Figma (~3–4 days)
1. Astro site in `site/` importing `@cathode-ui/react`.
2. One MDX page per primitive: prop table, live preview in both themes, motion/haptic/sound toggles, code snippet, AI-specific usage for AI-enabled components.
3. Tokens reference page (color grid, type scale, motion/sound timing).
4. Getting-started pages (React install, MCP server setup).
5. Deploy to Vercel or GitHub Pages.
6. Figma library: color + text variables from `tokens.json`, Modes for light/dark, each primitive as a component with variants.

**Verification:** site deploys, every page loads in both modes, Figma kit visually matches Storybook output.

### Phase 3 — Swift package (~2–3 days)
1. `packages/swift/` targeting iOS 16 / macOS 13.
2. `scripts/gen-swift.js` emits `Sources/Cathode/Tokens.swift` from `tokens.json`.
3. Port primitives as SwiftUI components, matching React API names.
4. iOS-native haptics via `UIImpactFeedbackGenerator`, sound via `AVAudioEngine`, motion via `withAnimation`.
5. AI hooks stubbed; full provider integration a follow-up.

**Verification:** `swift test` passes, preview target renders primitives in both appearance modes, bridged iOS app can import and use.

### Phase 4 — Other frameworks (later)
React Native, Vue, Svelte wrappers. Out of scope for initial plan but architecture supports (tokens.json is framework-agnostic).

---

## Verification (end-to-end after Phase 1)

1. **Build**: `pnpm build` in `packages/react/` produces clean ESM + CJS output.
2. **Storybook**: every primitive renders in both themes with motion/haptic/sound controls; mobile-view (375px) layouts adapt correctly.
3. **Tokens regen**: `pnpm gen` produces byte-identical `tokens.css` and `cathode.manifest.json` on successive runs.
4. **MCP**: adding the server to Claude Code's `.mcp.json` makes `cathode_*` tools visible and working.
5. **A11y**: axe-core run over Storybook reports no violations on any primitive.
6. **Perf**: LCP < 1.5s on the docs site; bundle size < 40 KB gzipped.
7. **AI components**: `TextField` with `ai={{ suggest: true }}` + a mock provider produces ghost-text suggestions live.
8. **Haptic**: Android Chrome triggers `navigator.vibrate` on button press; iOS Safari gracefully no-ops.
9. **Sound**: enabled sounds play on interaction; disabled = silent; respects `prefers-reduced-motion` for sound too.

---

## Open questions

- **Repo creation**: user offered to create `cathode-ui/` folder. Confirm when ready; I'll document the exact path in a follow-up message rather than guess.
- **Licensing**: MIT recommended for public-facing design system. Confirm before first public commit.
- **npm scope ownership**: `@cathode-ui/*` on npm — need to register the org. Alternative: `cathode-ui-react` flat-name.
- **Reference AI provider**: should Cathode ship one example adapter (OpenAI or Anthropic) or stay provider-agnostic with zero reference impls? Recommendation: ship `@cathode-ui/provider-anthropic` as a reference so docs have something to demo — but keep core package free of provider deps.
- **Custom icons**: Phosphor covers 9k+ but may miss walkie-talkie / radio-tower / signal-specific glyphs. Decide whether Cathode's curated default includes custom additions for those or relies on composed Phosphor primitives.
