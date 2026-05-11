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
1. Web (React + CSS custom properties) — **Phase 1** ✅
2. Figma library + docs site — **Phase 2** ✅
3. Next.js / App Router compatibility + docs — **Phase 2.5** (small)
4. Swift package (iOS/macOS/visionOS) — **Phase 3**
5. Other web frameworks (Vue, Svelte, Solid) — **Phase 4**
6. Jetpack Compose (Android native) — **Phase 5**
7. React Native + other cross-platform — later, only if demand appears

**Framework selection rationale:** priorities follow the split in
`## Framework targeting rationale` below. TL;DR: React is ~40% of devs
and the stack AI writes best; Vue is the biggest non-React audience;
Svelte has the highest developer satisfaction; Solid is a cheap
bonus port; SwiftUI + Jetpack Compose are the paired native-mobile
equivalents of each other. Angular is skipped (large but low
design-system-adoption audience, foreign conventions). React Native
is deferred to a later phase because it's a different problem
(no CSS custom properties, separate StyleSheet shim needed).

**Out of scope for v1:** charting, full form library beyond the primitives listed.

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

### Phase 2.5 — Next.js / meta-framework compatibility (~1 day)

`@cathode-ui/react` works today when imported into Next.js App Router,
but it isn't *explicit* about the client-boundary contract. Users hit
cryptic errors when they try to use Cathode primitives from a Server
Component, and the docs don't address it.

**Deliverables:**

1. Add `"use client";` as the first line of `packages/react/src/index.ts`
   (and `icons.ts`, `dev.tsx`). This marks the whole package as a client
   boundary — Next RSC compilers will stop producing the "cannot use
   hooks in Server Component" error and users no longer have to wrap
   `CathodeProvider` manually.
2. Verify the `"use client"` directive survives the Vite build — the
   esbuild loader must preserve the banner in both `dist/index.js` and
   `dist/index.cjs`. Add a build-time check.
3. Docs page `site/src/pages/nextjs.astro` with:
   - Install + root layout setup for App Router (`layout.tsx` with
     `<CathodeProvider>` inside a client-component wrapper).
   - Pages Router variant (simpler — no boundary issue).
   - Remix / React Router 7 equivalent (same client-boundary model).
   - A short "using Cathode with RSC" section that explicitly says
     "every Cathode component is a client component".
4. Optional: `examples/nextjs-starter/` — minimal Next 15 App Router
   starter importing a handful of Cathode primitives.
5. Bump `@cathode-ui/react` to 0.4.0 (the `"use client"` banner changes
   consumer compilation semantics, so it's a minor version bump by semver
   convention for design-system packages).

**Verification:**

- `npx create-next-app@latest` → add `@cathode-ui/react@0.4.0`,
  drop a `<Button>` into `app/page.tsx`, `next dev` starts without RSC
  errors, the button renders and responds to clicks.
- `dist/index.js` and `dist/index.cjs` both begin with `"use client";`.
- The new docs page loads and passes the existing axe-core gate.

### Phase 3 — Swift package (~2–3 days)
1. `packages/swift/` targeting iOS 16 / macOS 13.
2. `scripts/gen-swift.js` emits `Sources/Cathode/Tokens.swift` from `tokens.json`.
3. Port primitives as SwiftUI components, matching React API names.
4. iOS-native haptics via `UIImpactFeedbackGenerator`, sound via `AVAudioEngine`, motion via `withAnimation`.
5. AI hooks stubbed; full provider integration a follow-up.

**Verification:** `swift test` passes, preview target renders primitives in both appearance modes, bridged iOS app can import and use.

### Phase 4 — Other web frameworks (Vue / Svelte / Solid)

Port Cathode to the top non-React web frameworks. Tokens are already
framework-agnostic, so this is mostly (a) re-implementing primitives
against each framework's idioms and (b) evolving the manifest + MCP to
hand back framework-correct imports and snippets.

**New packages (one per framework, in sequence):**

- `@cathode-ui/vue`    — Vue 3 + `<script setup>` components.
  Biggest non-React audience (~15–18% of devs). AI handles Vue 3
  Composition API cleanly. Port first.
- `@cathode-ui/svelte` — Svelte 5 runes.
  Highest developer satisfaction (~90%). Smallest bundles. AI handles
  Svelte 4 well and mostly-well on Svelte 5. Port second.
- `@cathode-ui/solid`  — Solid JS.
  Small audience (~2–3%) but high satisfaction and fastest growth.
  Mental model is close to React, so port is cheap. Port third as a
  bonus.

Each package ships its own `tokens.css` / equivalent, `styles.css`,
component implementations, and a small provider (`<CathodeProvider>`
equivalent). Motion + haptics + sound adapters are per-framework (e.g.
Svelte uses the `motion` primitive, Vue uses `@vueuse/motion`).

**Manifest + MCP — multi-framework architecture**

Today's `cathode.manifest.json` hard-codes React in every component's
`import` field and `examples[].snippet`. The MCP server itself is
framework-agnostic (just reads the manifest), so the evolution is in
the manifest schema, not the server.

*Option A (chosen): single MCP, multi-adapter manifest.* Extend the
per-component schema so framework-specific bits live under `adapters`:

```json
{
  "name": "Button",
  "whenToUse": "…",
  "props": [ … ],
  "a11y": { … },
  "adapters": {
    "react":  { "import": "import { Button } from '@cathode-ui/react';",
                "examples": [{ "name": "primary", "snippet": "<Button variant=\"primary\">SAVE</Button>" }] },
    "vue":    { "import": "import { Button } from '@cathode-ui/vue';",
                "examples": [{ "name": "primary", "snippet": "<Button variant=\"primary\">SAVE</Button>" }] },
    "svelte": { "import": "import { Button } from '@cathode-ui/svelte';",
                "examples": [{ "name": "primary", "snippet": "<Button variant=\"primary\">SAVE</Button>" }] },
    "solid":  { "import": "import { Button } from '@cathode-ui/solid';",
                "examples": [{ "name": "primary", "snippet": "<Button variant=\"primary\">SAVE</Button>" }] }
  }
}
```

Add a `framework?: 'react' | 'vue' | 'svelte' | 'solid' | 'react-native'`
arg to every MCP tool, defaulting to `react` so existing users keep
working without migration:

```
cathode_get_component({ name: "Button", framework: "vue" })
cathode_suggest_component({ intent: "show a confirmation", framework: "svelte" })
```

`cathode_get_tokens` is framework-independent — no changes.

*Option B (rejected): separate MCP package per framework*
(`@cathode-ui/mcp-react`, `@cathode-ui/mcp-vue`, …). Simpler per-package
but forces users to pick the right one, duplicates the substring search
+ scorer across N packages, and N× the maintenance. Only reconsider if
one framework's adapter shape diverges so radically that shared schema
hurts clarity.

**Versioning / compatibility**

- Manifest schema bump: current single-adapter shape → `adapters`
  object. Emit both during transition (`import` and `examples` still
  populated from `adapters.react` so old tool consumers still work).
- `@cathode-ui/mcp` 0.3.x → 0.4.0 when the `framework` param ships.
- Each framework package versions independently but shares the monorepo
  version for major releases (all go to 0.4.0 when Phase 4 ships).

**Sequencing within Phase 4**

1. Schema extension: migrate `cathode.manifest.json` to the `adapters`
   shape (React adapter only, no behavior change). Ship `@cathode-ui/mcp`
   0.4.0 with the `framework` param.
2. `@cathode-ui/vue` — the highest-demand non-React framework. Full
   primitive parity, AI hooks ported.
3. `@cathode-ui/svelte` — Svelte 5 runes idioms.
4. `@cathode-ui/solid` — small, close to React mentally, cheap to port.
5. React Native moves out of Phase 4 — see Phase 6.

**Verification (per framework added):**

- Same 45 primitives render in both themes.
- Manifest `adapters.<framework>` block populated; MCP's
  `cathode_get_component(name, { framework })` returns the right
  imports and snippets.
- axe-core a11y gate passes on a framework-specific demo site.
- Bundle size parity with React (<40 KB gzip).

### Phase 5 — Jetpack Compose (Android native, ~3–4 days)

The Android counterpart of Phase 3 (SwiftUI). Port Cathode to Kotlin +
Jetpack Compose so the native-mobile story is complete on both
platforms.

- `@cathode-ui/compose` — Kotlin / Compose package (published to Maven
  Central, not npm).
- Tokens: `scripts/gen-kotlin.js` emits
  `Sources/kotlin/Cathode/Tokens.kt` from the same `tokens.json`.
- Motion: Compose's `animate*AsState` + `Animatable`, matching the
  motion intensity levels from `<CathodeProvider>`.
- Haptics: `HapticFeedback.performHapticFeedback(...)` — real haptics,
  same story as iOS.
- Sound: `SoundPool` or `MediaPlayer` for the click/confirm/error
  palette. Tokens dictate frequency + duration.
- AI hooks: same shape as React/SwiftUI, provider-agnostic.
- Manifest: add an `adapters.compose` block per component with Kotlin
  imports + Compose snippets.

**Verification:**

- `./gradlew test` passes.
- Compose preview renders every primitive in both themes.
- An Android demo app imports two primitives and renders both themes.
- Manifest MCP returns Kotlin imports when called with
  `framework: "compose"`.

### Phase 6 — React Native + cross-platform (later, gated on demand)

React Native is a legitimate target but differs enough from web React
that it's *not* a trivial adapter port — it has no CSS custom
properties, `StyleSheet.create` objects replace class-based CSS, motion
uses `Animated` / `Reanimated` instead of Framer Motion, and asset
loading is different.

Defer until there's concrete demand — a request from a user, a prospect,
or a project. Then:

- `@cathode-ui/react-native` — tokens shim (`tokens.json` →
  `StyleSheet.create`), component rewrite against RN primitives.
- Reanimated 3 for motion, Expo Haptics for haptics, Expo AV for sound.
- Manifest gets an `adapters.react-native` block.

Everything else downstream (Flutter, Leptos, Qwik, etc.) stays out of
scope indefinitely unless someone funds the port.

---

## Framework targeting rationale

Why the phase ordering above — data points the user asked about.

**Developer usage (State of JS 2024 / npm trends):**

| Framework | Primary-use share | npm weekly DL | Satisfaction |
|---|---|---|---|
| React | ~40–45% | ~30M | ~78% |
| Vue | ~15–18% | ~5M | ~80% |
| Angular | ~15% (enterprise) | ~4M | ~55% |
| Svelte | ~8–10% | ~800K | ~90% |
| Solid | ~2–3% | ~150K | ~89% |

**AI effectiveness (training-data volume proxy, best → worst):**

1. React + TypeScript — overwhelming training coverage.
2. Vue 3 Composition API — strong secondary.
3. Svelte 4 (great), Svelte 5 runes (decent but newer).
4. Solid — AI tends to write it React-ish (subtly wrong reactivity).
5. Angular — AI produces Angular-9-era patterns; usable but stale.

**Skipped explicitly:**

- **Angular** — large audience but low design-system-adoption rate;
  the community leans on Material, PrimeNG, Bootstrap-Angular. Cathode's
  motion/haptic/sound philosophy doesn't map cleanly onto RxJS + DI
  conventions. Revisit only if an Angular-shop asks for it.
- **Flutter** — Dart ecosystem, separate from Cathode's orbit.
- **Meta-frameworks (Next, Nuxt, SvelteKit, SolidStart, Astro)** — not
  separate targets. They consume the UI-framework package directly;
  Cathode handles them via client-boundary docs (Phase 2.5 for Next).

**Table stakes, not phases:**

- **TypeScript** — every Cathode package ships types (`.d.ts` for JS
  frameworks, Kotlin/Swift types are strong by language default).
- **Dark + light themes** — every package ships both, selected via the
  platform's native mechanism (`prefers-color-scheme`, `UITraitCollection`,
  `isSystemInDarkTheme()`).

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
