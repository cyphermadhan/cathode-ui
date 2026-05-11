#!/usr/bin/env node
// Emits /llms.txt and /CATHODE.md at repo root. These are the two
// agent-facing docs: llms.txt follows the llmstxt.org convention (a
// compact index of canonical URLs) and CATHODE.md is a longer
// onboarding doc AI coding agents can read in one pass to know how
// to compose a Cathode UI app.
//
// Both are generated from cathode.manifest.json so they can't drift
// from the actual component set. Regenerate via `npm run gen:ai-docs`
// (also wired into `npm run gen`).

import { writeFileSync, readFileSync } from 'node:fs';
import { fileURLToPath } from 'node:url';
import { dirname, resolve } from 'node:path';

const __dirname = dirname(fileURLToPath(import.meta.url));
const ROOT = resolve(__dirname, '..');
const manifest = JSON.parse(readFileSync(resolve(ROOT, 'cathode.manifest.json'), 'utf8'));

// ── llms.txt (llmstxt.org convention) ──────────────────────────

const llms = `# Cathode UI

> Retro-future React design system with motion, haptics, sound, and AI-native surfaces. ${manifest.components.length} primitives, monospace typography, Dark + Light themes, machine-readable manifest.

Cathode UI is designed to be read by AI coding agents first. The manifest at \`cathode.manifest.json\` is the canonical description of every component — props, examples, decision guidance, accessibility. Start there. \`CATHODE.md\` at repo root is the onboarding doc; read that second.

## Canonical for agents
- [cathode.manifest.json](./cathode.manifest.json): Every component, prop, example, \`whenToUse\`, \`vs\` disambiguation. JSON Schema at [scripts/manifest.schema.json](./scripts/manifest.schema.json).
- [CATHODE.md](./CATHODE.md): Agent onboarding doc — install, provider setup, picking the right primitive, top-level API.

## Human-facing docs
- [plan.md](./plan.md): Design goals + sequencing.
- [implemented.md](./implemented.md): Current shipped state (primitives, docs site, Figma library, a11y gate).
- [README.md](./README.md): Short intro.

## Live
- [/components](https://cathode-ui.dev/components): Component index + live demos.
- [/tokens](https://cathode-ui.dev/tokens): Color / type / spacing / motion tokens.
- [/ai](https://cathode-ui.dev/ai): \`CathodeAIProvider\` interface + adapter examples.
- [/mcp](https://cathode-ui.dev/mcp): MCP server setup.

## Design reference
- [Figma library](https://www.figma.com/design/yudyQFCPwX1FSLcXBXuVvY/Cathode-UI): ${manifest.components.length} component sets, tokens bound to Figma Variables.

## MCP
- [@cathode-ui/mcp](./packages/mcp-server): Model Context Protocol server exposing the manifest as \`cathode_list_components\`, \`cathode_get_component\`, \`cathode_get_tokens\`, \`cathode_search\`, \`cathode_suggest_component\`.
`;

writeFileSync(resolve(ROOT, 'llms.txt'), llms);

// ── CATHODE.md (agent onboarding) ──────────────────────────────

// Group components by the cluster they conceptually belong to. The
// manifest preserves author order (roughly initial primitives first,
// later clusters after); we re-group here for quicker scannability.
const CLUSTER = {
  'Layout':     ['TerminalFrame', 'Card', 'HazardStripes', 'Stack', 'Accordion'],
  'Forms':      ['Button', 'TextField', 'TextArea', 'Select', 'Checkbox', 'RadioGroup', 'Toggle', 'Counter', 'SearchBar', 'FormField', 'Chips'],
  'Data':       ['Badge', 'Tag', 'Avatar', 'Kbd', 'CodeBlock', 'Table', 'StatusTile', 'DotLeader', 'Pill'],
  'Navigation': ['Tabs', 'Breadcrumbs', 'Menu', 'Pagination'],
  'Feedback':   ['ProgressBar', 'Loader', 'Skeleton', 'PixelBar', 'ActivityBar', 'SignalBars', 'PulsingDot', 'Toast'],
  'Overlays':   ['Dialog', 'Drawer', 'Popover', 'Tooltip'],
  'AI':         ['Chat'],
  'Retro':      ['ScanLine', 'TypewriterText', 'Countdown'],
};

function quickReference() {
  const lines = [];
  for (const [cluster, names] of Object.entries(CLUSTER)) {
    lines.push(`### ${cluster}`);
    lines.push('');
    for (const name of names) {
      const c = manifest.components.find((x) => x.name === name);
      if (!c) continue;
      lines.push(`- **${c.name}** — ${c.whenToUse}`);
    }
    lines.push('');
  }
  return lines.join('\n');
}

function disambiguationTable() {
  // Flatten every `vs` entry so an agent searching for "when to use X
  // vs Y" finds the right rule in one pass.
  const rows = [];
  for (const c of manifest.components) {
    for (const d of (c.vs ?? [])) {
      rows.push(`| \`${c.name}\` vs \`${d.component}\` | ${d.picker} |`);
    }
  }
  return rows.join('\n');
}

const cathodeMd = `# CATHODE.md

> Read this first if you are an AI coding agent (Claude Code, Cursor, Copilot, etc.) asked to build with Cathode UI. This doc + \`cathode.manifest.json\` contain everything you need to compose a Cathode app without reading React source.

**Version**: ${manifest.version}. **Components**: ${manifest.components.length}.

---

## 1. What Cathode UI is

A retro-future React design system: pure-black / paper-white base, monospace typography (JetBrains Mono), pixel-square corners, tight saturated accents, subtle motion + haptics + sound baked in, AI-native surfaces on four primitives (\`TextField\` / \`SearchBar\` / \`Chat\` / \`Button\`).

Unique attributes vs. most React design systems:
- **Machine-readable by design.** \`cathode.manifest.json\` at repo root describes every component — props, examples, \`whenToUse\`, \`vs\` disambiguation. Agents should read it instead of scraping React source.
- **MCP server.** \`@cathode-ui/mcp\` exposes the manifest as Model Context Protocol tools so Claude Code, Cursor, etc. can query Cathode without bundling docs.
- **AI hooks as first-class.** \`CathodeAIProvider\` + \`useAiSuggest\` / \`useAiChat\` / \`useAiAction\`. Provider-agnostic; apps supply OpenAI / Anthropic / local adapters.

---

## 2. Install + setup

\`\`\`bash
npm install @cathode-ui/react
\`\`\`

\`\`\`tsx
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
\`\`\`

\`<CathodeProvider>\` accepts:
- \`theme\`: \`'auto' | 'dark' | 'light'\` — defaults to \`auto\` (\`prefers-color-scheme\`)
- \`motion\`: \`'none' | 'subtle' | 'strong'\` — default \`'strong'\`
- \`haptic\`: \`boolean\` — default \`true\`
- \`sound\`: \`boolean\` — default \`false\` (unexpected audio is hostile)
- \`ai\`: a \`CathodeAIProvider\` instance (required for AI-enabled components)

All props are optional. Provider can be nested; inner providers override outer settings.

---

## 3. Picking the right primitive

**First check**: does your intent match a \`whenToUse\` line below?

${quickReference()}

**Second check**: two sound plausible? Consult the disambiguation table:

| Pair | Picker |
|---|---|
${disambiguationTable()}

---

## 4. Design tokens

All values live in \`tokens.json\` and are emitted as CSS custom properties (\`--cathode-color-*\`, \`--cathode-space-*\`, etc.) and Figma Variables.

**Semantic colors** (state-carrying — use for meaning):
\`danger\` · \`success\` · \`warning\` · \`info\` · \`accent\`

**Palette colors** (differentiation only — no semantic claim):
\`amber\` · \`pink\` · \`purple\` · \`teal\` · \`grey\`

Most components take an \`accent\` or \`kind\` prop that selects from one of these names; don't hardcode hex values.

**Typography**: JetBrains Mono, size scale = caption (9) / readout (11) / label (13) / number (16) / display (24) / hero (36). Tracking (letter-spacing): header 2.0, label 1.4, caption 0.8.

**Spacing**: \`xs\` (4) · \`sm\` (8) · \`md\` (12) · \`lg\` (16) · \`xl\` (24) · \`xxl\` (32).

**Motion**: durations \`instant\` (80ms) / \`quick\` (150ms) / \`settled\` (300ms) / \`slow\` (500ms).

---

## 5. AI-enabled primitives

Four primitives accept an \`ai\` prop. Behavior is a no-op until a provider is supplied.

\`\`\`tsx
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
\`\`\`

---

## 6. Feedback (motion, haptic, sound)

Every interactive primitive emits:
- A framer-motion press animation (scale 0.97 in \`strong\` mode, 0.99 in \`subtle\`, off in \`none\`)
- A \`navigator.vibrate\` haptic pattern (no-op on iOS Safari — documented)
- An optional Web Audio oscillator sound (off by default)

Six sound patterns: \`click\` / \`tick\` / \`confirm\` / \`warn\` / \`error\` / \`destructive\`.
Six haptic patterns: \`tap\` / \`confirm\` / \`warn\` / \`error\` / \`destructive\` / \`long\`.

Each component documents which pattern it fires in \`manifest.components[i].feedback\`.

Users control all three globally via \`<CathodeProvider motion|haptic|sound>\`. Components can opt out locally via \`feedback={false}\` where supported.

---

## 7. Manifest & MCP

\`cathode.manifest.json\` at repo root is the full machine-readable spec. JSON Schema at \`scripts/manifest.schema.json\`. Every regen validates against the schema.

\`@cathode-ui/mcp\` exposes five tools over stdio for agent integration:
- \`cathode_list_components()\` — names + summaries
- \`cathode_get_component(name)\` — full spec including \`whenToUse\` + \`vs\`
- \`cathode_get_tokens(theme?)\` — resolved color set + theme-independent tokens
- \`cathode_search(query)\` — substring match against names + summaries
- \`cathode_suggest_component(intent)\` — ranked list of components matching an intent phrase

Wire into \`.mcp.json\`:

\`\`\`json
{
  "mcpServers": {
    "cathode-ui": {
      "command": "node",
      "args": ["/path/to/cathode-ui/packages/mcp-server/dist/server.js"]
    }
  }
}
\`\`\`

---

## 8. Canonical syntax cheatsheet

\`\`\`tsx
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
\`\`\`

---

## 9. Where to look next

- The manifest itself: \`cathode.manifest.json\`. Every component entry has a full \`examples\` array with canonical calls.
- Docs site: https://cathode-ui.dev (or run \`cd site && npm run dev\` locally).
- Figma library: https://www.figma.com/design/yudyQFCPwX1FSLcXBXuVvY/Cathode-UI.
- MCP server source: \`packages/mcp-server/\`.
`;

writeFileSync(resolve(ROOT, 'CATHODE.md'), cathodeMd);

console.log(`Wrote llms.txt and CATHODE.md (${manifest.components.length} components indexed).`);
