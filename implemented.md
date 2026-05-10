# Cathode UI — Implemented

Running log of what's shipped vs. what's open. Paired with `plan.md`.
Run `git log --oneline` in the repo for the exact commit history.

---

## Summary

- **43 React primitives** shipped under `@cathode-ui/react`. ~13 KB gzipped.
- **Dark + light themes** driven by `prefers-color-scheme`, pinnable via `<CathodeProvider theme="…">` or `data-theme`.
- **Motion, haptics, sound** baked in. Six-pattern sound palette, five-pattern haptic palette.
- **AI-native**: `CathodeAIProvider` interface, three React hooks, first-class `Chat` component, opt-in AI in `TextField` / `SearchBar` / `Button`.
- **AI-friendly**: machine-readable `cathode.manifest.json` + Model Context Protocol server at `@cathode-ui/mcp`.
- **Docs site**: Astro, 8 pages, live React islands for interactive components.

Not yet shipped: Figma kit, Swift package, npm publish, GitHub remote.

---

## Monorepo

```
cathode-ui/
├── tokens/tokens.json              ← single source of truth (v0.2.0)
├── scripts/
│   ├── gen-css.js                  ← → packages/react/src/tokens.css
│   └── gen-manifest.js             ← → cathode.manifest.json
├── packages/
│   ├── react/                      ← @cathode-ui/react
│   └── mcp-server/                 ← @cathode-ui/mcp
├── site/                           ← docs (Astro)
├── cathode.manifest.json           ← committed; AI agents consume
├── plan.md                         ← design + sequencing (this file's sibling)
└── implemented.md                  ← you are here
```

Npm workspaces registered: `packages/*` + `site`.
Node version pinned via `engines.node >= 20`. Licensed MIT.

---

## Tokens

`tokens/tokens.json` — version `0.2.0`. Generator scripts emit CSS
custom properties and (eventually) Swift constants from it.

**Color token renames in 0.2.0:**
- `tx` → `danger`, `txDeep` → `dangerDeep`
- `ok` → `success`
- `warn` → `warning`
- `sys` → `accent`
- `navTalk / navChat / navListen / navSettings` → `amber / pink / purple / grey`
- Added: `teal`

**Two color families** in the API surface:
- **Semantic**: `danger` / `success` / `warning` / `info` / `accent` — for state-carrying meaning.
- **Palette**: `amber` / `pink` / `purple` / `teal` / `grey` — for differentiation without semantic claim.

**Other token groups**: `spacing` (xs/sm/md/lg/xl/xxl + framePad/rowHeight), `size` (pixelCell, touchTargetMin, iconSm/Md/Lg, borderWidth, …), `type.scale` (caption/readout/label/number/display/hero), `motion.duration/ease/scale`, `breakpoint`.

**Output:**
- `packages/react/src/tokens.css` — `:root` light-default + `@media (prefers-color-scheme: dark)` dark override + `[data-theme]` scoped overrides.
- `packages/react/src/fonts.css` — JetBrains Mono via Google Fonts.

---

## React package — `@cathode-ui/react`

Vite + TypeScript strict, framer-motion, Phosphor Icons. Dual ESM + CJS output, types generated via `vite-plugin-dts`.

**Build targets**: ES2022, iOS 16+ / modern browsers. Size at last build: **index 7.03 KB gzip, icons 0.52 KB gzip, CSS 2.20 KB gzip.**

### `<CathodeProvider>` (src/CathodeProvider.tsx)
Context with `theme` (auto/dark/light), `motion` (none/subtle/strong), `haptic` (bool), `sound` (bool, default off), `ai` (provider).

### Feedback controllers (src/feedback/)
- **`haptic.ts`** — `navigator.vibrate` wrapper with iOS-Safari no-op. 6 patterns: `tap` / `confirm` / `warn` / `error` / `destructive` / `long`.
- **`sound.ts`** — Web Audio oscillator synth, supports multi-note sequences with per-note `delay`. 6 patterns:
  - `click` — 1.2 kHz square, 30 ms
  - `tick` — 1.6 kHz square, 15 ms, low gain
  - `confirm` — 880 → 1175 Hz sine rising two-note
  - `warn` — 600 Hz triangle, 140 ms
  - `error` — 440 → 330 Hz sawtooth descending two-note (classic system ding-dong)
  - `destructive` — 180 Hz sawtooth, 100 ms (pre-action warning)
- Respects `prefers-reduced-motion` as a sensory-noise mute.

### AI infrastructure (src/ai/)
- **`provider.ts`** — `CathodeAIProvider` interface: `suggest(prefix)` / `chat(messages)` / `act(intent, context)`. All streaming via AsyncIterable where applicable.
- **`hooks.ts`** — `useAiSuggest` (debounced streamed completion), `useAiChat` (message list + streaming assistant + cancel), `useAiAction` (one-shot intent).
- No reference provider shipped; apps bring their own adapter.

### Components (src/components/)

**43 primitives**, all with motion profiles, opt-in haptic/sound, accessibility attributes.

| # | Primitive | Summary |
|---|---|---|
| 1 | `TerminalFrame` | Bordered box w/ inset title. Accent variants (neutral/info/success/warning/danger). |
| 1b | `Card` | TerminalFrame minus the inset title. Generic panel; clickable variant via `onClick`. |
| 2 | `PixelBar` | Discrete-cell level meter, 0–1 level, configurable cells + fill. |
| 3 | `ActivityBar` | Pseudo-random VU meter (deterministic hash per cell/seed). |
| 4 | `PulsingDot` | Small CSS-animated square for "active/scanning" indicators. |
| 5 | `DotLeader` | `LABEL ……………… VALUE` terminal readout. |
| 6 | `StatusTile` | MPC-style icon+title+subtitle tile, optional tappable. |
| 7 | `Pill` | Icon+text nav/action button with `active` state + 10-color accent API. |
| 8 | `Button` | `default/primary/danger` variants; AI action via `ai={{ action }}`. |
| 9 | `TextField` | Monospace input; AI ghost-text suggest with `ai={{ suggest: true }}`. |
| 10 | `SearchBar` | Monospace search + results dropdown; semantic AI mode via `ai={{ semantic: true }}`. |
| 11 | `Chat` | First-class AI conversation — streaming, cancel, reset, auto-scroll. |
| 12 | `Toast` | Inline status notification, 4 kinds (info/success/warning/error). |
| 13 | `Dialog` | Portal-rendered modal with TerminalFrame chrome. ESC + backdrop close. |
| 14 | `Chips` | Horizontal-scroll preset chips, supports grouped layouts with dividers. |
| 15 | `Counter` | `[−]  LABEL VALUE  [+]` rocker; welded label reads as one control. (Renamed from `Stepper` in 0.3.0.) |
| 16 | `Toggle` | Binary on/off switch with accent fill when on. |
| 17 | `HazardStripes` | Decorative diagonal-stripe overlay for "armed/caution" states. |
| 18 | `Checkbox` | Binary form input; supports `indeterminate` for tri-state parent rows. |
| 19 | `RadioGroup` | Single-select from 2+ options; native radios under the hood (keyboard arrow-nav free). |
| 20 | `Select` | Native-backed single-select for finite option sets; Cathode chrome + chevron. |
| 21 | `TextArea` | Multi-line monospace input; optional char counter; resize disabled by default. |
| 22 | `FormField` | Label + input + hint/error wrapper; auto-wires `aria-labelledby` + `aria-describedby`. |
| 23 | `Badge` | Small inline status marker (solid or outline). "NEW", "BETA", "v0.3.0". |
| 24 | `Tag` | Outlined accent marker for keywords/filters; optional `onRemove` × button. |
| 25 | `Avatar` | Square identity — image, initials fallback, optional status dot. |
| 26 | `Kbd` | Keyboard shortcut indicator — each key in its own bordered `<kbd>` box. |
| 27 | `CodeBlock` | Multi-line code sample with language label + copy button. Accepts plain text or pre-highlighted HTML. |
| 28 | `Table` | Terminal-style tabular display with controlled sort + optional row-click (keyboard-activatable). |
| 29 | `Tabs` | Horizontal tab row, one active. Controlled via value + onChange. |
| 30 | `Breadcrumbs` | Path-style nav — last item marked `aria-current="page"`. |
| 31 | `Menu` | Click-triggered dropdown. Keyboard arrow-nav + Enter/Escape. |
| 32 | `Pagination` | Prev/next arrows + windowed page buttons with ellipses. |
| 33 | `Popover` | Anchored floating panel, click-to-open; cloneElement-wires aria on the trigger. |
| 34 | `Tooltip` | Hover/focus hint; injects `aria-describedby` into the wrapped child. |
| 35 | `Drawer` | Portaled slide-in panel from any of four edges; non-modal by default. |
| 36 | `ProgressBar` | Continuous determinate bar; omit `value` for indeterminate shimmer. |
| 37 | `Spinner` | Indeterminate loader; four pixel-square cells cycling. |
| 38 | `Skeleton` | Loading-state placeholder box with a shimmer sweep. |
| 39 | `SignalBars` | Cellular-style ascending bars for strength/battery/reception readings. |
| 40 | `ScanLine` | Decorative CRT overlay — translucent grid + sweeping beam. |
| 41 | `TypewriterText` | Character-by-character reveal; SR gets the full text immediately via visually-hidden sibling. |
| 42 | `Countdown` | T-minus timer (HH:MM:SS or DD:HH:MM:SS); auto-flips to danger in the last minute. |

### Icons (src/icons.ts)
Curated Phosphor Icons re-exports under `@cathode-ui/react/icons`. Includes `IconBroadcast`, `IconChat`, `IconEar`, `IconSignal`, `IconCheck`, `IconCamera`, `IconSparkle`, `IconClose`, `IconSettings`, `IconSearch`, `IconBrain`, `IconRobot`, and more.

### Preview page (src/dev.tsx)
Run `npm run dev` from the repo root (or `packages/react/`). Serves at `http://localhost:5173/`. Renders every primitive with:
- Theme picker (auto / dark / light)
- Motion intensity (none / subtle / strong)
- Haptic / sound toggles
- A dedicated **SOUND PALETTE** audition row with six buttons for each pattern
- Live Chat + Dialog islands hooked to a mock provider

---

## MCP server — `@cathode-ui/mcp`

Node-based Model Context Protocol server (`packages/mcp-server/`). Reads `cathode.manifest.json` + `tokens/tokens.json` locally — no network calls, no state.

**Four tools exposed over stdio:**
- `cathode_list_components()` — name + one-line summary per component
- `cathode_get_component(name)` — full spec (props, types, a11y, feedback, motion, examples)
- `cathode_get_tokens(theme?)` — resolved color set + theme-independent tokens
- `cathode_search(query)` — substring match against names + summaries

Register via `.mcp.json` in Claude Code / Cursor:
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

## Machine-readable manifest — `cathode.manifest.json`

Committed at repo root. **17 components** fully specified. Each entry includes:
- `name`, `import`, `summary`
- `props[]` (name, type, required, default, description)
- `motionStates[]`
- `a11y` (role, requires)
- `feedback` (haptic, sound pattern mapping)
- `examples[]` (name, snippet)

Generated by `scripts/gen-manifest.js`; regenerate via `npm run gen:manifest` after any component change.

---

## Docs site — `site/`

Astro + MDX + React islands. **23 static pages** at build time. Dogfoods `@cathode-ui/react/tokens.css` — the docs chrome respects the same theme variables as the components it documents.

**Pages (top-level):**
- `/` — hero + principles + quick-taste snippet
- `/getting-started` — install / provider / first render
- `/tokens` — color grids (both themes), type scale, spacing, motion durations, sound + haptic tables — all rendered from `tokens/tokens.json`
- `/components` — auto-generated index from `cathode.manifest.json`
- `/ai` — `CathodeAIProvider` interface + OpenAI adapter example
- `/mcp` — MCP tool list, `.mcp.json` config, sample agent transcript

**Component detail pages** — one per primitive (17 total):
- Chat + Dialog have dedicated `.astro` files with richer live layouts
- The other 15 are generated by a dynamic `[name].astro` route via `getStaticPaths` over `cathode.manifest.json`
- Every page renders: **live interactive demo** (via a shared `ComponentDemo` React island), import line, props table, manifest examples, a11y role + requirements, feedback spec, motion states

Paths: `/components/terminalframe`, `/components/pill`, `/components/button`, `/components/textfield`, `/components/stepper`, `/components/toggle`, `/components/chips`, `/components/searchbar`, `/components/statustile`, `/components/pixelbar`, `/components/activitybar`, `/components/pulsingdot`, `/components/dotleader`, `/components/hazardstripes`, `/components/toast`, `/components/chat`, `/components/dialog`.

**Run**: `cd site && npm run dev` → `http://127.0.0.1:4321/`.

**Build**: `npm run build` — ~3 s, outputs pure static HTML + React island bundles for the interactive demos.

**Deploy target**: any static host (Vercel / Netlify / Cloudflare Pages / GitHub Pages).

---

## Not yet implemented

### Phase 2 gap: Figma library
The `.fig` binary can't be produced from code. To unblock designers, a
follow-up will emit a [Tokens Studio](https://tokens.studio/)-compatible
JSON export that imports into a blank Figma file in one click.

### Phase 3: Swift package
Planned. `scripts/gen-swift.js` will emit `Sources/Cathode/Tokens.swift`
from the same `tokens.json`. Components port to SwiftUI matching the
React API names. iOS-native haptics (`UIImpactFeedbackGenerator`) and
sound (`AVAudioEngine`) replace the web shims.

### Phase 4: other frameworks
React Native, Vue, Svelte wrappers — architecture supports it (tokens
are framework-agnostic) but deferred.

### Housekeeping
- Pushed to https://github.com/cyphermadhan/cathode-ui (default branch `main`). Not yet published to npm — `@cathode-ui/react` + `@cathode-ui/mcp` install via workspace path only.
- **a11y CI**: `npm run test:a11y` builds the docs site, serves it via `astro preview`, and runs `@axe-core/playwright` against every page (23 total) with the WCAG 2.0/2.1 A+AA tag set. All 23 pass with 0 serious/critical violations. Fixing the initial 28 violations took token tweaks (darker light-theme accents for ≥4.5:1 contrast), a `.cathode-chat-empty` color swap, an `aria-label` on `PixelBar`, and `aria-disabled` on `Toggle`'s outer label.
- No Storybook. The `dev.tsx` preview + docs site cover the same ground without the additional dependency weight.
- No visual regression tests (Chromatic / Playwright).
- MCP server uses substring search for `cathode_search`; a vector-embedding mode would be a nice upgrade but the corpus is <20 components, so cost outweighs benefit right now.

---

## Divergences from plan.md

- **pnpm → npm workspaces.** Swapped for fewer toolchain dependencies; npm workspaces cover our needs fine.
- **Storybook deferred.** `dev.tsx` preview inside `packages/react/` + live islands in the docs site do the same job without a separate build pipeline. Revisit if the primitive count balloons.
- **Reference AI provider deferred.** Core package stays dependency-free; the docs demo uses an inline mock. Separate `@cathode-ui/provider-openai` / `-anthropic` adapters are TBD packages.
- **Figma library: JSON export instead of `.fig`** (see above).
- **Custom pixel-art icons**: not started. Phosphor covers the current need; custom set becomes relevant only if we find Phosphor gaps in the wild.
