# Cathode UI — Implemented

Running log of what's shipped vs. what's open. Paired with `plan.md`.
Run `git log --oneline` in the repo for the exact commit history.

---

## Summary

- **45 React primitives** shipped under `@cathode-ui/react`. **14.5 KB gzip** for the JS bundle, **6.1 KB gzip** for the compiled component CSS, **0.5 KB gzip** for the icon re-exports. Tokens v0.3.0.
- **Dark + light themes** driven by `prefers-color-scheme`, pinnable via `<CathodeProvider theme="…">` or `<html data-theme>`.
- **Motion, haptics, sound** baked in. Six-pattern sound palette, six-pattern haptic palette. Global controls + per-component opt-out.
- **AI-native**: `CathodeAIProvider` interface, three React hooks, first-class `Chat` component, opt-in AI in `TextField` / `SearchBar` / `Button`.
- **AI-friendly**: machine-readable `cathode.manifest.json` + Model Context Protocol server at `@cathode-ui/mcp`.
- **Docs site**: Astro, 51 pages, live React islands for interactive demos, global theme/motion/haptic/sound controls.
- **Figma library**: 8 pages, 45 component sets, 210 components/variants at `figma.com/design/yudyQFCPwX1FSLcXBXuVvY`. All tokens bound to Figma Variables with Dark + Light modes.
- **a11y**: 54/54 docs pages pass `@axe-core/playwright` cleanly (WCAG 2.0/2.1 A+AA).
- **GitHub**: pushed to `github.com/cyphermadhan/cathode-ui`, default branch `main`.
- **Agent-facing docs**: `llms.txt` (per llmstxt.org convention) + `CATHODE.md` (long-form onboarding) at repo root, both generated from the manifest. Five MCP tools including `cathode_suggest_component(intent)` for natural-language component selection. Manifest has `whenToUse` + `vs` disambiguation per component, validated against a JSON Schema.
- **npm published**: `@cathode-ui/react@0.4.1`, `@cathode-ui/mcp@0.4.0`, and `@cathode-ui/vue@0.1.0` live on the public registry.
- **Next.js / App Router compatible** (Phase 2.5). Every JS entry ships a `"use client"` directive so Cathode primitives import cleanly into Server Components with no consumer-side wrapping. Verified end-to-end against `next@16` App Router.
- **Multi-framework manifest schema** (Phase 4a). Each component has an `adapters.<framework>` block (currently `react` + partial `vue`); the flat `import` + `examples` fields mirror `adapters.react` for backwards compat. MCP tools take an optional `framework` arg (default `"react"`) and fall back with a warning when an adapter isn't shipped — lays the groundwork for Svelte / Solid / Compose.
- **Vue 3 package complete** (Phase 4b). `@cathode-ui/vue@0.1.0` ships all 45 primitives in full API parity with `@cathode-ui/react`:
  - `CathodeProvider` (theme/motion/haptic/sound/ai) + `useCathode` composable
  - Feedback controllers (`haptic`, `sound`) + AI composables (`useAiSuggest`, `useAiChat`, `useAiAction`) + AI provider types
  - 5 layout (TerminalFrame, Card, Stack, Accordion, HazardStripes), 11 forms (Button, TextField, TextArea, Select, Checkbox, RadioGroup, Toggle, Counter, SearchBar, FormField, Chips), 9 data (Badge, Tag, Avatar, Kbd, CodeBlock, Table, StatusTile, DotLeader, Pill), 4 nav (Tabs, Breadcrumbs, Menu, Pagination), 8 feedback (ProgressBar, Loader, Skeleton, PixelBar, ActivityBar, SignalBars, PulsingDot, Toast), 4 overlays (Dialog, Drawer, Popover, Tooltip), 1 AI (Chat), 3 retro (ScanLine, TypewriterText, Countdown)
  - Portals via Vue `<Teleport>` — Dialog, Drawer, Menu, Popover, Tooltip escape layout contexts the same way React's `createPortal` does
  - Form inputs auto-wire `aria-labelledby` / `aria-describedby` through a `FORM_FIELD_KEY` provide/inject token (Vue's equivalent of React's `cloneElement` aria injection)
  - Vue Transitions replace framer-motion (Accordion, Dialog, Drawer slide-in, Toast)
  - 75 kB gzipped JS + 47 kB gzipped CSS for the full package
  - Interactive test suite (Vitest + happy-dom + @vue/test-utils) — 26 tests across 6 files covering v-model roundtrip on every controlled input, Dialog close paths (Escape, backdrop, ×, `modal` suppression), Menu keyboard navigation (ArrowUp/Down/Enter/Escape + click-item), Popover (trigger/outside-click/Escape close), Tooltip hover+delay, Button AI-action flow with a mock provider. All green. Suite surfaced two real bugs before publish: Dialog Escape ignored `modal`, Popover couldn't detect controlled mode because Vue auto-coerces missing boolean props to `false`. Both fixed.
  - `/vue` docs page on the Astro site with setup (Vite + Nuxt), API deltas vs React, and AI composable examples. 55/55 a11y pages pass.
- **MCP framework routing proven end-to-end** — the manifest now carries `adapters.vue` for all 45 components; `cathode_get_component(name, { framework: "vue" })` returns Vue imports + Vue template snippets for every primitive.

Not yet shipped: Swift package (Phase 3), Svelte / Solid (Phase 4c–d), Jetpack Compose (Phase 5).

---

## Monorepo

```
cathode-ui/
├── tokens/tokens.json              ← single source of truth (v0.3.0)
├── scripts/
│   ├── gen-css.js                  ← → packages/react/src/tokens.css
│   ├── gen-manifest.js             ← → cathode.manifest.json
│   └── a11y-test.js                ← axe-core runner over docs site
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

`tokens/tokens.json` — version `0.3.0`. Generator scripts emit CSS
custom properties and (eventually) Swift constants from it.

**Two color families** in the API surface:
- **Semantic**: `danger` / `success` / `warning` / `info` / `accent` — for state-carrying meaning.
- **Palette**: `amber` / `pink` / `purple` / `teal` / `grey` — for differentiation without semantic claim.

Light-theme accents were deepened in 0.3.0 so every accent clears WCAG AA 4.5:1 contrast on both panel and bg surfaces without sacrificing the retro palette feel.

**Other token groups**: `spacing` (xs/sm/md/lg/xl/xxl + framePad/rowHeight), `size` (pixelCell, touchTargetMin, iconSm/Md/Lg, borderWidth, …), `type.scale` (caption/readout/label/number/display/hero), `motion.duration/ease/scale`, `breakpoint`.

**Output:**
- `packages/react/src/tokens.css` — `:root` light-default + `@media (prefers-color-scheme: dark)` dark override + `[data-theme]` scoped overrides.
- `packages/react/src/fonts.css` — JetBrains Mono via Google Fonts.

---

## React package — `@cathode-ui/react`

Vite + TypeScript strict, framer-motion, Phosphor Icons. Dual ESM + CJS output, types generated via `vite-plugin-dts`.

**Build targets**: ES2022, iOS 16+ / modern browsers.
**Last build sizes**: `index.js` 14.51 KB gzip · `style.css` 6.09 KB gzip · `icons.js` 0.52 KB gzip.

**Three CSS subpath exports** — consumers must import all three (or at minimum `tokens.css` + `styles.css`):
- `@cathode-ui/react/tokens.css` — `:root` CSS variables, Light/Dark switching via `prefers-color-scheme` + `[data-theme]`.
- `@cathode-ui/react/fonts.css` — JetBrains Mono `@font-face` (optional; remote Google Fonts).
- `@cathode-ui/react/styles.css` — compiled component class rules (`.cathode-pill`, `.cathode-frame`, etc.).

### `<CathodeProvider>` (src/CathodeProvider.tsx)
Context with `theme` (auto/dark/light), `motion` (none/subtle/strong), `haptic` (bool), `sound` (bool, default off), `ai` (provider).

### Feedback controllers (src/feedback/)
- **`haptic.ts`** — `navigator.vibrate` wrapper with iOS-Safari no-op. 6 patterns: `tap` / `confirm` / `warn` / `error` / `destructive` / `long`.
- **`sound.ts`** — Web Audio oscillator synth, supports multi-note sequences with per-note `delay`. 6 patterns:
  - `click` — 1.2 kHz square, 30 ms
  - `tick` — 1.6 kHz square, 15 ms, low gain (slider / counter step)
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

**45 primitives**, all with motion profiles, opt-in haptic/sound, accessibility attributes.

| # | Primitive | Summary |
|---|---|---|
| 1  | `TerminalFrame` | Bordered box w/ inset title. Accent variants (neutral/info/success/warning/danger). |
| 2  | `Card` | TerminalFrame minus the inset title. Generic panel; clickable variant via `onClick`. |
| 3  | `PixelBar` | Discrete-cell level meter, 0–1 level, configurable cells + fill. |
| 4  | `ActivityBar` | Pseudo-random VU meter (deterministic hash per cell/seed). |
| 5  | `PulsingDot` | Small CSS-animated square for "active/scanning" indicators. |
| 6  | `DotLeader` | `LABEL ……………… VALUE` terminal readout. |
| 7  | `StatusTile` | MPC-style icon+title+subtitle tile, optional tappable. |
| 8  | `Pill` | Icon+text nav/action button with `active` state + 10-color accent API. |
| 9  | `Button` | `default/primary/danger` variants; AI action via `ai={{ action }}`. |
| 10 | `TextField` | Monospace input; AI ghost-text suggest with `ai={{ suggest: true }}`. Regular weight by default; `weight="bold"` switches to 600. |
| 11 | `SearchBar` | Monospace search + results dropdown; Phosphor MagnifyingGlass icon by default; semantic AI mode via `ai={{ semantic: true }}`. |
| 12 | `Chat` | First-class AI conversation — streaming, cancel, reset, auto-scroll. |
| 13 | `Toast` | Inline status notification, 4 kinds (info/success/warning/error). |
| 14 | `Dialog` | Portal-rendered modal with TerminalFrame chrome. ESC + backdrop close. |
| 15 | `Chips` | Horizontal-scroll preset chips, supports grouped layouts with dividers. |
| 16 | `Counter` | `[−]  LABEL VALUE  [+]` rocker; welded label reads as one control. (Renamed from `Stepper` in 0.3.0.) |
| 17 | `Toggle` | Binary on/off switch with accent fill when on. |
| 18 | `HazardStripes` | Decorative diagonal-stripe overlay for "armed/caution" states. |
| 19 | `Checkbox` | Binary form input; supports `indeterminate` for tri-state parent rows. |
| 20 | `RadioGroup` | Single-select from 2+ options; native radios under the hood (keyboard arrow-nav free). |
| 21 | `Select` | Native-backed single-select for finite option sets; Cathode chrome + chevron. |
| 22 | `TextArea` | Multi-line monospace input; optional char counter; resize disabled by default. Regular weight by default; `weight="bold"` switches to 600. |
| 23 | `FormField` | Label + input + hint/error wrapper; auto-wires `aria-labelledby` + `aria-describedby`. |
| 24 | `Badge` | Small inline status marker (solid or outline). "NEW", "BETA", "v0.3.0". |
| 25 | `Tag` | Outlined accent marker for keywords/filters; optional `onRemove` × button. |
| 26 | `Avatar` | Square identity — image, initials fallback, optional status dot. |
| 27 | `Kbd` | Keyboard shortcut indicator — each key in its own bordered `<kbd>` box. |
| 28 | `CodeBlock` | Multi-line code sample with language label + copy button. Accepts plain text or pre-highlighted HTML. |
| 29 | `Table` | Terminal-style tabular display with controlled sort + optional row-click (keyboard-activatable). |
| 30 | `Tabs` | Horizontal tab row, one active. Controlled via value + onChange. |
| 31 | `Breadcrumbs` | Path-style nav — last item marked `aria-current="page"`. |
| 32 | `Menu` | Click-triggered dropdown. Keyboard arrow-nav + Enter/Escape. Portaled to `document.body` so ancestor overflow can't clip it. |
| 33 | `Pagination` | Prev/next arrows + windowed page buttons with ellipses. |
| 34 | `Popover` | Anchored floating panel, click-to-open. Portaled; closes on outside click + Escape. |
| 35 | `Tooltip` | Hover/focus hint; wraps children in an anchor `<span>` (no `forwardRef` required downstream); portaled to document.body. |
| 36 | `Drawer` | Portaled slide-in panel from any of four edges; non-modal by default. |
| 37 | `ProgressBar` | Continuous determinate bar; omit `value` for indeterminate shimmer. |
| 38 | `Loader` | Indeterminate loader; four pixel-square cells cycling. (Renamed from `Spinner` in 0.3.1.) |
| 39 | `Skeleton` | Loading-state placeholder box with a shimmer sweep. |
| 40 | `SignalBars` | Cellular-style ascending bars for strength/battery/reception readings. |
| 41 | `ScanLine` | Decorative CRT overlay — translucent grid + sweeping beam. |
| 42 | `TypewriterText` | Character-by-character reveal; SR gets the full text immediately via visually-hidden sibling. `color` + `cursorColor` props. |
| 43 | `Countdown` | T-minus timer (HH:MM:SS or DD:HH:MM:SS); auto-flips to danger in the last minute. |
| 44 | `Stack` | Utility flex wrapper — direction/gap/align/justify/wrap via props; optional `as` tag. |
| 45 | `Accordion` | Expand/collapse sections; controlled or uncontrolled; `allowMultiple={false}` for exclusive mode. |

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

**Five tools exposed over stdio:**
- `cathode_list_components()` — name + one-line summary per component
- `cathode_get_component(name)` — full spec (props, types, a11y, feedback, motion, `whenToUse`, `vs`, examples)
- `cathode_get_tokens(theme?)` — resolved color set + theme-independent tokens
- `cathode_search(query)` — substring match against names + summaries (keyword lookup)
- `cathode_suggest_component(intent)` — given a natural-language intent ("show a confirmation before deleting"), returns ranked components using a weighted bag-of-words scorer over name (weight 4) + `whenToUse` (3) + `summary` (1) + `vs` (1). Exact name mention = +10. Stopword list drops verbs like "show"/"display"/"need" that carry no component signal.

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

Committed at repo root. **45 components** fully specified. Each entry includes:
- `name`, `import`, `summary`
- `whenToUse` — one imperative sentence of decision guidance
- `vs[]` — disambiguation pairs against commonly-confused siblings (e.g. `Pill` has `vs: [{component: "Button", picker: "Pill = persistent nav/tab state; Button = one-shot action"}]`)
- `props[]` (name, type, required, default, description)
- `motionStates[]`
- `a11y` (role, requires)
- `feedback` (haptic, sound pattern mapping)
- `examples[]` (name, snippet)

`whenToUse` + `vs` live in `scripts/component-guidance.json` and are merged into the manifest at generation time — keeps structural metadata + decision prose separable.

**JSON Schema** at `scripts/manifest.schema.json` (draft 2020-12) — every `gen-manifest.js` run validates against it via Ajv, so shipping an invalid manifest is impossible.

Generated by `scripts/gen-manifest.js`; regenerate via `npm run gen:manifest` after any component change.

---

## Docs site — `site/`

Astro + MDX + React islands. **53 static pages** at build time. Dogfoods `@cathode-ui/react/tokens.css` — the docs chrome respects the same theme variables as the components it documents.

**Pages (top-level):**
- `/` — hero + principles + quick-taste snippet
- `/getting-started` — install / provider / first render
- `/tokens` — color grids (both themes), type scale, spacing, motion durations, sound + haptic tables — all rendered from `tokens/tokens.json`
- `/components` — alphabetical index from `cathode.manifest.json`
- `/ai` — `CathodeAIProvider` interface + OpenAI adapter example
- `/mcp` — MCP tool list, `.mcp.json` config, sample agent transcript
- `/figma` — companion Figma library (what's inside, how to use, static-Figma caveats)
- `/patterns` — four canonical compositions built from the shipped primitives, shown live + as copy-paste code snippets

**Component detail pages** — one per primitive (45 total):
- Chat + Dialog have dedicated `.astro` files with richer live layouts
- The other 43 are generated by a dynamic `[name].astro` route via `getStaticPaths` over `cathode.manifest.json`
- Every page renders: live interactive demo (via a shared `ComponentDemo` React island), import line, props table, manifest examples, a11y role + requirements, feedback spec, motion states

**Site-wide controls bar** (top of every page, React island):
- Theme (auto / dark / light) — persists via localStorage + `data-theme` on `<html>`, inline head script prevents theme flash on first paint
- Motion intensity (none / subtle / strong)
- Haptic on/off, Sound on/off
- Every `ComponentDemo` + `ChatDemo` + `DialogDemo` subscribes via a shared settings module and forwards the values into its embedded `<CathodeProvider>` — so flipping any control re-renders every demo live

**Sidebar** — alphabetical listing of all 45 components, auto-populated from the manifest. Scroll position persists across in-site navigation via sessionStorage (inline script in `Main.astro`).

**Run**: `cd site && npm run dev` → `http://127.0.0.1:4321/`.

**Build**: `npm run build` — ~3 s, outputs pure static HTML + React island bundles for the interactive demos.

**a11y gate**: `npm run test:a11y` (root) builds the docs site, serves it via `astro preview`, and runs `@axe-core/playwright` against every page with WCAG 2.0/2.1 A+AA tags. All 53 pages pass cleanly.

**Deploy target**: GitHub Pages via `.github/workflows/deploy-docs.yml`. Every push to `main` triggers a build + deploy to `https://cyphermadhan.github.io/cathode-ui/`. The workflow regenerates tokens + manifest + AI docs, builds `@cathode-ui/react` from source, then builds the Astro site with `CATHODE_SITE_BASE=/cathode-ui` so every internal href resolves under the project-pages path. Internal hrefs go through `withBase()` in `site/src/lib/href.ts` so dev server (base `/`) and Pages (base `/cathode-ui/`) both work from the same source.

---

## Figma library

**File**: `figma.com/design/yudyQFCPwX1FSLcXBXuVvY/Cathode-UI`.

Built programmatically via the figma-remote MCP's `use_figma` tool (Plugin API) — no designer hand-crafting. Strokes, fills, and text colors are bound to Figma Variables so toggling a page's mode Dark ↔ Light re-colors every instance live.

**8 pages, 45 component sets, 210 components/variants total.**

| Page | Contents |
|---|---|
| Tokens | 5 Variable collections (Color with Dark + Light modes, Spacing, Size, Type, Motion) — 54 variables. Plus a visual swatch page. |
| Layout | TerminalFrame (5 variants), Card (10), HazardStripes (1) |
| Forms | Button (6), TextField (4), TextArea (3), Select (3), Counter (3), Checkbox (4), Radio (3), Toggle (3), SearchBar (3), FormField (4), Chip (3) |
| Data | Badge (10), Tag (20), Avatar (7), Kbd (4), DotLeader (3), Pill (18), CodeBlock (3), Table (1), StatusTile (5) |
| Navigation | Tabs (5), Breadcrumbs (1), Menu (2), Pagination (3) |
| Feedback | ProgressBar (7), Loader (6), Skeleton (6), PixelBar (4), ActivityBar (3), SignalBars (6), PulsingDot (5), Toast (4) |
| Overlays | Dialog (3), Drawer (4), Popover (2), Tooltip (2) |
| Misc | Stack (4), Accordion (3), Chat (3), ScanLine (1), TypewriterText (5), Countdown (5) |

**Static-Figma caveats:**
- Animation-heavy primitives (`Loader`, `PulsingDot`, `TypewriterText`, `ScanLine`, `Countdown`, `Chat` streaming) render as static "at-rest" representations — Figma can't drive CSS keyframes.
- Composite multi-state components (`Menu`, `Popover`, `Tooltip`, `Drawer`) ship as separate variants per state rather than live interactions.
- `ScanLine`'s scanline grid is omitted in Figma (gradients can't truly repeat like CSS `repeating-linear-gradient`); only the stationary beam + content are shown.
- `HazardStripes` uses a manually-constructed 45° stripe pattern since Figma can't do `repeating-linear-gradient` at arbitrary angles.

---

## AI-friendliness surface

Cathode is designed to be read by AI coding agents first. Agents can discover, disambiguate, and compose the system without reading React source.

**At repo root** (regenerated on every `npm run gen`):
- `cathode.manifest.json` — full machine-readable spec. 45 entries, each with `name`, `import`, `summary`, `whenToUse`, `vs[]`, `props[]`, `motionStates[]`, `a11y`, `feedback`, `examples[]`.
- `llms.txt` — [llmstxt.org](https://llmstxt.org/) convention. Compact index of canonical URLs pointing an agent at the manifest, CATHODE.md, and docs-site pages.
- `CATHODE.md` — long-form onboarding doc. Install steps, provider setup, a `whenToUse` quick-reference grouped by cluster, a complete disambiguation table (every `vs` entry flattened), token cheatsheet, and a canonical syntax reference for every primitive.
- `scripts/manifest.schema.json` — JSON Schema 2020-12 describing the manifest shape. Validated on every regen via Ajv.
- `scripts/component-guidance.json` — editable source for `whenToUse` + `vs` prose, merged into the manifest at generation time.

**MCP server** (`@cathode-ui/mcp`) exposes five stdio tools (see MCP server section above).

**Pattern recipes** at `/patterns` on the docs site show four canonical compositions (dashboard readout, settings panel, destructive flow, loading states) as both live demos and copy-paste code. Feeds the suggestion flow — agent picks the component, then sees how to use it in context.

**Honest gaps** still on the list:
- No embeddings / vector search for `cathode_suggest_component`. Bag-of-words is adequate for 45 components but won't scale past ~100.
- No "generate Cathode UI from Figma mockup" agent workflow.
- No Cursor / Copilot `.rules` file yet.

## a11y

- **`npm run test:a11y`** (root script) builds the docs site, serves it via `astro preview`, iterates every page via `@axe-core/playwright` with WCAG 2.0/2.1 A+AA tags, exits non-zero on any serious/critical violation.
- **51/51 pages pass** cleanly (0 serious, 0 critical, 0 minor).
- Violations fixed during build-out: bumped light-theme accent tokens for ≥4.5:1 contrast, swapped `.cathode-chat-empty` to `text-dim`, added `aria-label` to `PixelBar`, `aria-disabled` on `Toggle`'s outer label, `role="img"` on `Avatar`'s status dot, clone-element `aria-haspopup/aria-expanded` onto `Menu` + `Popover` triggers (not wrapper div), visually-hidden full-text sibling on `TypewriterText`, `tabindex="0"` on scrollable code blocks.

---

## Not yet implemented

### Phase 3: Swift package
Planned. `scripts/gen-swift.js` will emit `Sources/Cathode/Tokens.swift`
from the same `tokens.json`. Components port to SwiftUI matching the
React API names. iOS-native haptics (`UIImpactFeedbackGenerator`) and
sound (`AVAudioEngine`) replace the web shims. Adds `adapters.swift`
(or `swiftui`) to every component's adapter block.

### Phase 4b–d: other web frameworks
Vue 3 → Svelte 5 → Solid. Each ships a sibling package
(`@cathode-ui/vue` etc.) and populates its own `adapters.<name>` block
per component. Manifest schema + MCP already support this (Phase 4a).

**Phase 4b (Vue) in progress:**
- Session 1 (shipped): scaffold + `Button`, `Stack`, `TerminalFrame` + minimal `CathodeProvider` (theme + motion).
- Session 2 (planned): feedback shims (haptic, sound) + AI provider types in the Vue package + Button feedback props + 5–10 more primitives across layout/forms/data.
- Sessions 3+: remaining 35+ primitives batched by cluster.

### Phase 5: Jetpack Compose (Android native)
Kotlin + Compose counterpart of SwiftUI. `scripts/gen-kotlin.js`
generates `Tokens.kt`. `HapticFeedback` + `SoundPool` replace the web
shims. Adds `adapters.compose` to every component.

### Phase 6: React Native (deferred)
Non-trivial: no CSS variables, separate `StyleSheet` shim, Reanimated
for motion, Expo Haptics + AV. Gated on concrete demand.

### Housekeeping
- No Storybook. The `dev.tsx` preview + docs site cover the same ground without the additional dependency weight.
- No visual regression tests (Chromatic / Playwright) beyond axe-core a11y.
- MCP server uses substring search for `cathode_search`; a vector-embedding mode would be a nice upgrade but the corpus is <50 components, so cost outweighs benefit right now.

---

## Divergences from plan.md

- **pnpm → npm workspaces.** Swapped for fewer toolchain dependencies; npm workspaces cover our needs fine.
- **Storybook deferred.** `dev.tsx` preview inside `packages/react/` + live islands in the docs site do the same job without a separate build pipeline. Revisit if the primitive count balloons further.
- **Reference AI provider deferred.** Core package stays dependency-free; the docs demo uses an inline mock. Separate `@cathode-ui/provider-openai` / `-anthropic` adapters are TBD packages.
- **Figma library built programmatically via MCP, not hand-crafted in Figma or exported as Tokens Studio JSON.** The `figma-remote` MCP's `use_figma` tool runs arbitrary JavaScript in the file via Figma's Plugin API, so we can create Variables, component sets, variants, and token bindings directly from `tokens.json` — no designer bottleneck and no `.fig` binary to maintain.
- **Custom pixel-art icons**: not started. Phosphor covers the current need; custom set becomes relevant only if we find Phosphor gaps in the wild.
- **Primitive count expanded from 17 to 45.** The plan scoped the initial set tightly (`TerminalFrame`, `Pill`, etc. — the core retro-future primitives plus a handful of new ones). Subsequent rounds added forms (Checkbox/RadioGroup/Select/TextArea/FormField), data (Badge/Tag/Avatar/Kbd/CodeBlock/Table), navigation (Tabs/Breadcrumbs/Menu/Pagination), feedback (ProgressBar/Loader/Skeleton/SignalBars), overlays (Popover/Tooltip/Drawer), layout (Stack/Accordion/Card), and Cathode-flavor (ScanLine/TypewriterText/Countdown) clusters.
