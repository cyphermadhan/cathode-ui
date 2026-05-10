#!/usr/bin/env node
// Emits cathode.manifest.json at the repo root — a machine-readable
// registry of every Cathode primitive. AI coding agents (Claude Code,
// Cursor, etc.) read this instead of scraping React source. Keep it
// in sync by re-running `npm run gen:manifest` after component changes.
//
// The manifest is deliberately hand-curated rather than inferred from
// TypeScript types: prop *intent* (what's sensible to pass) is richer
// than prop *shape*, and the manifest's job is to teach AI agents how
// to compose components, not just what would compile.

import { writeFileSync, readFileSync } from 'node:fs';
import { fileURLToPath } from 'node:url';
import { dirname, resolve } from 'node:path';

const __dirname = dirname(fileURLToPath(import.meta.url));
const ROOT = resolve(__dirname, '..');
const TOKENS = JSON.parse(readFileSync(resolve(ROOT, 'tokens/tokens.json'), 'utf8'));

/** @type {Array<Object>} */
const components = [
  {
    name: 'TerminalFrame',
    import: "import { TerminalFrame } from '@cathode-ui/react';",
    summary:
      'Bordered box with a small inset title — the "┌─ PEERS ─" terminal look. Use to group related readouts.',
    props: [
      { name: 'title',    type: 'string',                                   required: false, default: undefined },
      { name: 'accent',   type: "'neutral'|'info'|'success'|'warning'|'danger'", required: false, default: 'neutral' },
      { name: 'children', type: 'ReactNode',                                 required: true },
      { name: 'className',type: 'string',                                    required: false },
    ],
    motionStates: [],
    a11y: { role: 'region', requires: [] },
    feedback: { haptic: null, sound: null },
    examples: [
      { name: 'titled',     snippet: '<TerminalFrame title="PEERS">{/* children */}</TerminalFrame>' },
      { name: 'accented',   snippet: '<TerminalFrame title="ERROR" accent="tx">…</TerminalFrame>' },
    ],
  },
  {
    name: 'Card',
    import: "import { Card } from '@cathode-ui/react';",
    summary: 'Generic bordered panel — same chrome as TerminalFrame without the inset title. Use for readouts, info blocks, or grouped form fields where the content speaks for itself.',
    props: [
      { name: 'children', type: 'ReactNode',                                       required: true },
      { name: 'accent',   type: "'neutral'|'info'|'success'|'warning'|'danger'",   required: false, default: 'neutral' },
      { name: 'surface',  type: "'flat'|'elevated'",                                required: false, default: 'flat', description: '`elevated` uses panel bg; `flat` is transparent.' },
      { name: 'padding',  type: "'none'|'sm'|'md'|'lg'",                            required: false, default: 'md' },
      { name: 'onClick',  type: '() => void',                                      required: false, description: 'When set, the Card renders as a focusable button.' },
    ],
    motionStates: [],
    a11y: { role: 'region (button when onClick)', requires: ['aria-label if clickable and children are icon-only'] },
    feedback: { haptic: null, sound: null },
    examples: [
      { name: 'info',      snippet: '<Card accent="info" surface="elevated"><DotLeader label="LAT" value="42 MS" /></Card>' },
      { name: 'clickable', snippet: '<Card onClick={open} aria-label="Show details">…</Card>' },
    ],
  },
  {
    name: 'PixelBar',
    import: "import { PixelBar } from '@cathode-ui/react';",
    summary: 'Discrete-cell horizontal level meter. Fill proportional to `level` (0–1).',
    props: [
      { name: 'level',    type: 'number', required: true,  description: 'Clamped to [0, 1].' },
      { name: 'cells',    type: 'number', required: false, default: 24 },
      { name: 'fill',     type: 'string', required: false, description: 'CSS color; overrides --cathode-pixelbar-fill.' },
      { name: 'cellSize', type: 'number', required: false, default: 6 },
    ],
    motionStates: [],
    a11y: { role: 'progressbar', requires: ['aria-valuenow set automatically'] },
    feedback: { haptic: null, sound: null },
    examples: [{ name: 'vu',       snippet: '<PixelBar level={0.6} cells={24} />' }],
  },
  {
    name: 'PulsingDot',
    import: "import { PulsingDot } from '@cathode-ui/react';",
    summary: 'Small square that pulses to signal "active/listening" without a full progress indicator.',
    props: [
      { name: 'color', type: 'string', required: false, default: 'currentColor' },
      { name: 'size',  type: 'number', required: false, default: 8 },
    ],
    motionStates: ['pulse'],
    a11y: { role: 'presentation', requires: [] },
    feedback: { haptic: null, sound: null },
    examples: [{ name: 'default', snippet: '<PulsingDot color="var(--cathode-color-ok)" />' }],
  },
  {
    name: 'DotLeader',
    import: "import { DotLeader } from '@cathode-ui/react';",
    summary: '"LABEL …………… VALUE" row — classic terminal readout. Dots fill available width.',
    props: [
      { name: 'label',      type: 'string', required: true },
      { name: 'value',      type: 'string', required: true },
      { name: 'valueColor', type: 'string', required: false, description: 'CSS color for the value half.' },
    ],
    motionStates: [],
    a11y: { role: 'text', requires: [] },
    feedback: { haptic: null, sound: null },
    examples: [
      { name: 'plain', snippet: '<DotLeader label="LATENCY" value="42 MS" />' },
      { name: 'error', snippet: '<DotLeader label="STATUS" value="DOWN" valueColor="var(--cathode-color-tx)" />' },
    ],
  },
  {
    name: 'Pill',
    import: "import { Pill } from '@cathode-ui/react';",
    summary:
      'Icon+text nav/action button. `active` marks the current tab; pass an icon node for the icon+text treatment.',
    props: [
      { name: 'title',    type: 'string',     required: true },
      { name: 'icon',     type: 'ReactNode',  required: false },
      { name: 'accent',   type: "PillAccent ('info'|'success'|'warning'|'danger'|'accent'|'amber'|'pink'|'purple'|'teal'|'grey')", required: false, default: 'info' },
      { name: 'active',   type: 'boolean',    required: false, default: false, description: 'Marks the current tab/state; visually highlights and disables click.' },
      { name: 'disabled', type: 'boolean',    required: false, default: false },
      { name: 'feedback', type: 'boolean',    required: false, default: true,  description: 'Local override for haptic+sound.' },
      { name: 'onClick',  type: '() => void', required: false },
    ],
    motionStates: ['idle', 'press'],
    a11y: { role: 'button', requires: ['aria-label if title is unclear'] },
    feedback: { haptic: 'tap', sound: 'click' },
    examples: [
      { name: 'nav-active',  snippet: '<Pill title="HOME" active accent="amber" />' },
      { name: 'with-icon',   snippet: '<Pill title="SAVE" icon={<IconCheck weight="bold" />} onClick={save} accent="success" />' },
    ],
  },
  {
    name: 'Button',
    import: "import { Button } from '@cathode-ui/react';",
    summary: 'General-purpose button. Variants: default / primary / danger. Supports declarative AI actions.',
    props: [
      { name: 'children', type: 'ReactNode',                required: true },
      { name: 'variant',  type: "'default'|'primary'|'danger'", required: false, default: 'default' },
      { name: 'icon',     type: 'ReactNode',                required: false },
      { name: 'disabled', type: 'boolean',                  required: false, default: false },
      { name: 'onClick',  type: '() => void',               required: false },
      { name: 'ai',       type: 'ButtonAIConfig',           required: false, description: 'Declarative AI intent; provider is routed from CathodeProvider.' },
      { name: 'onActionResult', type: '(result: string) => void', required: false },
    ],
    motionStates: ['idle', 'press'],
    a11y: { role: 'button', requires: ['aria-label for icon-only usage'] },
    feedback: {
      haptic: 'primary→confirm · danger→destructive · default→tap',
      sound:  'primary→confirm · danger→destructive · default→click',
    },
    examples: [
      { name: 'primary', snippet: '<Button variant="primary" onClick={save}>SAVE</Button>' },
      { name: 'ai',      snippet: '<Button ai={{ action: "explain", context: data }} onActionResult={setExplanation}>EXPLAIN</Button>' },
    ],
  },
  {
    name: 'TextField',
    import: "import { TextField } from '@cathode-ui/react';",
    summary: 'Monospace text input. With `ai={{ suggest: true }}` shows ghost-text AI completions (Tab to accept).',
    props: [
      { name: 'value',       type: 'string',           required: true },
      { name: 'onChange',    type: '(v: string) => void', required: true },
      { name: 'placeholder', type: 'string',           required: false },
      { name: 'disabled',    type: 'boolean',          required: false },
      { name: 'ai',          type: 'TextFieldAIConfig', required: false },
    ],
    motionStates: [],
    a11y: { role: 'textbox', requires: ['aria-label if no visible label'] },
    feedback: { haptic: null, sound: null },
    examples: [
      { name: 'basic',       snippet: '<TextField value={v} onChange={setV} placeholder="TYPE HERE" />' },
      { name: 'ai-suggest',  snippet: '<TextField value={v} onChange={setV} ai={{ suggest: true }} />' },
    ],
  },
  {
    name: 'StatusTile',
    import: "import { StatusTile } from '@cathode-ui/react';",
    summary: 'MPC-style tile: icon + uppercase title + tiny subtitle. Optional tappable.',
    props: [
      { name: 'title',    type: 'string',     required: true },
      { name: 'subtitle', type: 'string',     required: true },
      { name: 'icon',     type: 'ReactNode',  required: true },
      { name: 'accent',   type: 'PillAccent', required: false, default: 'info' },
      { name: 'active',   type: 'boolean',    required: false, default: false },
      { name: 'onClick',  type: '() => void', required: false, description: 'Makes the whole tile a press target.' },
    ],
    motionStates: ['idle', 'press'],
    a11y: { role: 'button (when onClick) / region', requires: [] },
    feedback: { haptic: 'tap', sound: 'click' },
    examples: [
      { name: 'display', snippet: '<StatusTile title="STATUS" subtitle="HEALTHY" icon={<IconCheck weight="bold" />} active accent="success" />' },
      { name: 'button',  snippet: '<StatusTile title="ACTION" subtitle="TAP TO RUN" icon={<IconSparkle />} onClick={handler} />' },
    ],
  },
  {
    name: 'ActivityBar',
    import: "import { ActivityBar } from '@cathode-ui/react';",
    summary: 'Pseudo-random "activity" meter — pixel cells flicker based on a deterministic seed (advance externally to animate).',
    props: [
      { name: 'intensity', type: 'number', required: true,  description: 'Probability a cell is lit (0–1).' },
      { name: 'seed',      type: 'number', required: false, default: 0 },
      { name: 'cells',     type: 'number', required: false, default: 24 },
      { name: 'fill',      type: 'string', required: false },
      { name: 'cellSize',  type: 'number', required: false, default: 6 },
    ],
    motionStates: [],
    a11y: { role: 'presentation', requires: [] },
    feedback: { haptic: null, sound: null },
    examples: [{ name: 'tx',  snippet: '<ActivityBar intensity={0.6} seed={tick} cells={24} />' }],
  },
  {
    name: 'HazardStripes',
    import: "import { HazardStripes } from '@cathode-ui/react';",
    summary: 'Decorative diagonal-stripe overlay for "caution" / "armed" states. Wraps children.',
    props: [
      { name: 'intensity', type: 'number', required: false, default: 0.12 },
      { name: 'angle',     type: 'number', required: false, default: 135 },
      { name: 'width',     type: 'number', required: false, default: 8 },
      { name: 'color',     type: 'string', required: false, default: 'white' },
      { name: 'children',  type: 'ReactNode', required: false },
    ],
    motionStates: [],
    a11y: { role: 'presentation', requires: [] },
    feedback: { haptic: null, sound: null },
    examples: [{ name: 'caution', snippet: '<HazardStripes><Button variant="danger">ARM</Button></HazardStripes>' }],
  },
  {
    name: 'Toggle',
    import: "import { Toggle } from '@cathode-ui/react';",
    summary: 'Binary on/off switch with square-cornered track and accent fill when on.',
    props: [
      { name: 'value',    type: 'boolean',              required: true },
      { name: 'onChange', type: '(v: boolean) => void', required: true },
      { name: 'label',    type: 'string',               required: false },
      { name: 'accent',   type: "'success'|'info'|'warning'|'danger'|'accent'|'amber'|'pink'|'purple'|'teal'", required: false, default: 'success' },
      { name: 'disabled', type: 'boolean',              required: false, default: false },
    ],
    motionStates: ['idle', 'press'],
    a11y: { role: 'switch', requires: ['aria-label if no visible label'] },
    feedback: { haptic: 'tap', sound: 'tick' },
    examples: [{ name: 'basic', snippet: '<Toggle value={on} onChange={setOn} label="ENABLED" />' }],
  },
  {
    name: 'Counter',
    import: "import { Counter } from '@cathode-ui/react';",
    summary: 'Numeric rocker "[−] LABEL VALUE [+]" — fused label/arrows read as one control. (Formerly named Stepper.)',
    props: [
      { name: 'value',    type: 'number',               required: true },
      { name: 'onChange', type: '(v: number) => void',  required: true },
      { name: 'min',      type: 'number',               required: false, default: 0 },
      { name: 'max',      type: 'number',               required: false, default: 100 },
      { name: 'step',     type: 'number',               required: false, default: 1 },
      { name: 'label',    type: 'string',               required: false },
      { name: 'format',   type: '(v: number) => string',required: false },
      { name: 'disabled', type: 'boolean',              required: false, default: false },
    ],
    motionStates: ['idle', 'press'],
    a11y: { role: 'group', requires: [] },
    feedback: { haptic: 'tap', sound: 'tick' },
    examples: [{ name: 'wpm', snippet: '<Counter value={wpm} onChange={setWpm} min={5} max={40} label="WPM" />' }],
  },
  {
    name: 'Chips',
    import: "import { Chips } from '@cathode-ui/react';",
    summary: 'Horizontally scrolling row of tappable preset chips. Supports grouped layouts with dividers.',
    props: [
      { name: 'groups',   type: 'Chip[] | Chip[][]',    required: true, description: 'Flat list or grouped arrays.' },
      { name: 'onSelect', type: '(chip: Chip) => void', required: true },
    ],
    motionStates: ['press'],
    a11y: { role: 'group', requires: [] },
    feedback: { haptic: 'tap', sound: 'click' },
    examples: [
      { name: 'flat',    snippet: '<Chips groups={[{ label: "SOS" }, { label: "HELP" }]} onSelect={insert} />' },
      { name: 'grouped', snippet: '<Chips groups={[[{label:"SOS"}], [{label:"OK"}, {label:"YES"}]]} onSelect={insert} />' },
    ],
  },
  {
    name: 'SearchBar',
    import: "import { SearchBar } from '@cathode-ui/react';",
    summary: 'Monospace search input. With `ai={{ semantic: true }}` routes query + items through provider.act("search", …) for AI ranking.',
    props: [
      { name: 'items',       type: 'SearchItem[]',               required: true },
      { name: 'onSelect',    type: '(item: SearchItem) => void', required: true },
      { name: 'placeholder', type: 'string',                      required: false, default: 'SEARCH…' },
      { name: 'ai',          type: 'SearchBarAIConfig',           required: false },
      { name: 'limit',       type: 'number',                      required: false, default: 8 },
      { name: 'icon',        type: 'boolean | ReactNode',         required: false, default: true, description: '`true` → built-in "⌕" glyph (default). `false` → no icon. Pass a ReactNode to supply your own (e.g. Phosphor IconSearch).' },
    ],
    motionStates: [],
    a11y: { role: 'combobox', requires: ['aria-label on the input'] },
    feedback: { haptic: null, sound: null },
    examples: [
      { name: 'plain',    snippet: '<SearchBar items={items} onSelect={pick} />' },
      { name: 'semantic', snippet: '<SearchBar items={items} onSelect={pick} ai={{ semantic: true }} />' },
    ],
  },
  {
    name: 'Dialog',
    import: "import { Dialog } from '@cathode-ui/react';",
    summary: 'Modal with TerminalFrame chrome. Portal-rendered, ESC + backdrop click to close (unless `modal`).',
    props: [
      { name: 'open',     type: 'boolean',     required: true },
      { name: 'onClose',  type: '() => void',  required: true },
      { name: 'title',    type: 'string',      required: false },
      { name: 'accent',   type: "'neutral'|'info'|'success'|'warning'|'danger'", required: false, default: 'neutral' },
      { name: 'children', type: 'ReactNode',   required: true },
      { name: 'maxWidth', type: 'number',      required: false, default: 480 },
      { name: 'modal',    type: 'boolean',     required: false, default: false, description: 'Disable click-outside-to-close.' },
    ],
    motionStates: ['enter', 'exit'],
    a11y: { role: 'dialog', requires: ['aria-modal="true"', 'aria-labelledby for titled dialogs'] },
    feedback: { haptic: null, sound: null },
    examples: [{ name: 'confirm', snippet: '<Dialog open={show} onClose={close} title="CONFIRM" accent="danger">…</Dialog>' }],
  },
  {
    name: 'Chat',
    import: "import { Chat } from '@cathode-ui/react';",
    summary: 'First-class AI conversation component with streaming, cancel, and auto-scroll. Wraps a CathodeAIProvider.',
    props: [
      { name: 'provider',     type: 'CathodeAIProvider', required: false, description: 'Overrides the provider from CathodeProvider.' },
      { name: 'systemPrompt', type: 'string',            required: false },
      { name: 'placeholder',  type: 'string',            required: false, default: 'TYPE A MESSAGE…' },
      { name: 'title',        type: 'string',            required: false, default: 'CHAT' },
      { name: 'maxHeight',    type: 'number',            required: false, default: 320 },
    ],
    motionStates: ['enter (assistant)', 'streaming'],
    a11y: { role: 'log', requires: ['aria-live="polite" set automatically'] },
    feedback: { haptic: 'confirm (send) · destructive (cancel)', sound: 'confirm (send) · destructive (cancel)' },
    examples: [{ name: 'basic', snippet: '<Chat systemPrompt="You are terse." />' }],
  },
  {
    name: 'Checkbox',
    import: "import { Checkbox } from '@cathode-ui/react';",
    summary: 'Binary form checkbox for multi-select values. Distinct from Toggle; supports indeterminate (tri-state).',
    props: [
      { name: 'value',         type: 'boolean',              required: true },
      { name: 'onChange',      type: '(v: boolean) => void', required: true },
      { name: 'label',         type: 'string',               required: false },
      { name: 'disabled',      type: 'boolean',              required: false, default: false },
      { name: 'indeterminate', type: 'boolean',              required: false, default: false, description: 'Renders a dash — use for parent rows of mixed children.' },
      { name: 'accent',        type: "'success'|'info'|'warning'|'danger'|'accent'", required: false, default: 'success' },
    ],
    motionStates: ['idle', 'press'],
    a11y: { role: 'checkbox', requires: ['aria-label if no visible label'] },
    feedback: { haptic: 'tap', sound: 'tick' },
    examples: [
      { name: 'basic',         snippet: '<Checkbox value={on} onChange={setOn} label="NOTIFY ME" />' },
      { name: 'indeterminate', snippet: '<Checkbox value={partial} onChange={selectAll} indeterminate label="ALL" />' },
    ],
  },
  {
    name: 'RadioGroup',
    import: "import { RadioGroup } from '@cathode-ui/react';",
    summary: 'Single-select from 2+ options. Renders native radios under the hood; browser handles keyboard arrow-nav.',
    props: [
      { name: 'value',       type: 'string',                  required: true },
      { name: 'onChange',    type: '(v: string) => void',     required: true },
      { name: 'options',     type: 'Array<{value, label, disabled?}>', required: true },
      { name: 'orientation', type: "'horizontal'|'vertical'", required: false, default: 'horizontal' },
      { name: 'accent',      type: "'success'|'info'|'warning'|'danger'|'accent'", required: false, default: 'info' },
      { name: 'disabled',    type: 'boolean',                 required: false, default: false },
      { name: 'name',        type: 'string',                  required: false, description: 'Shared form name. Auto-generated if omitted.' },
    ],
    motionStates: ['idle', 'press'],
    a11y: { role: 'radiogroup', requires: ['aria-label or aria-labelledby for the group'] },
    feedback: { haptic: 'tap', sound: 'tick' },
    examples: [
      { name: 'modes', snippet: '<RadioGroup value={mode} onChange={setMode} options={[{value:"a",label:"Alpha"},{value:"b",label:"Beta"}]} aria-label="Mode" />' },
      { name: 'stacked', snippet: '<RadioGroup value={v} onChange={setV} options={opts} orientation="vertical" />' },
    ],
  },
  {
    name: 'Select',
    import: "import { Select } from '@cathode-ui/react';",
    summary: 'Single-select dropdown for a finite option set. Wraps native <select> for a11y + mobile-picker compatibility.',
    props: [
      { name: 'value',       type: 'string',              required: true },
      { name: 'onChange',    type: '(v: string) => void', required: true },
      { name: 'options',     type: 'Array<{value, label, disabled?}>', required: true },
      { name: 'placeholder', type: 'string',              required: false },
      { name: 'disabled',    type: 'boolean',             required: false, default: false },
    ],
    motionStates: [],
    a11y: { role: 'combobox', requires: ['aria-label if no visible label'] },
    feedback: { haptic: null, sound: null },
    examples: [
      { name: 'modes',       snippet: '<Select value={mode} onChange={setMode} options={[{value:"dark",label:"Dark"},{value:"light",label:"Light"}]} aria-label="Theme" />' },
      { name: 'placeholder', snippet: '<Select value={v} onChange={setV} options={opts} placeholder="CHOOSE…" />' },
    ],
  },
  {
    name: 'TextArea',
    import: "import { TextArea } from '@cathode-ui/react';",
    summary: 'Multi-line monospace text input. Resize handle disabled by default to match the terminal chrome.',
    props: [
      { name: 'value',       type: 'string',              required: true },
      { name: 'onChange',    type: '(v: string) => void', required: true },
      { name: 'placeholder', type: 'string',              required: false },
      { name: 'disabled',    type: 'boolean',             required: false, default: false },
      { name: 'rows',        type: 'number',              required: false, default: 4 },
      { name: 'maxLength',   type: 'number',              required: false, description: 'Shows a character counter below when set.' },
      { name: 'resizable',   type: 'boolean',             required: false, default: false },
    ],
    motionStates: [],
    a11y: { role: 'textbox', requires: ['aria-label if no visible label'] },
    feedback: { haptic: null, sound: null },
    examples: [
      { name: 'basic',   snippet: '<TextArea value={notes} onChange={setNotes} placeholder="ADD NOTES…" />' },
      { name: 'counted', snippet: '<TextArea value={bio} onChange={setBio} maxLength={160} />' },
    ],
  },
  {
    name: 'FormField',
    import: "import { FormField } from '@cathode-ui/react';",
    summary: 'Stacks a label, a Cathode input, and an optional hint or error message. Auto-wires aria attributes.',
    props: [
      { name: 'label',    type: 'string',     required: true },
      { name: 'children', type: 'ReactElement', required: true, description: 'Single Cathode input.' },
      { name: 'hint',     type: 'string',     required: false },
      { name: 'error',    type: 'string',     required: false, description: 'Swaps the hint slot and turns the label danger-red.' },
      { name: 'required', type: 'boolean',    required: false, default: false, description: 'Renders a "*" next to the label.' },
    ],
    motionStates: [],
    a11y: { role: 'group', requires: ['child receives aria-labelledby automatically'] },
    feedback: { haptic: null, sound: null },
    examples: [
      { name: 'basic', snippet: '<FormField label="CALLSIGN" hint="4 characters."><TextField value={c} onChange={setC} /></FormField>' },
      { name: 'error', snippet: '<FormField label="EMAIL" error="Invalid address."><TextField value={e} onChange={setE} /></FormField>' },
    ],
  },
  {
    name: 'Toast',
    import: "import { Toast } from '@cathode-ui/react';",
    summary: 'Inline status notification. Controlled via `visible`; apps handle queuing/timing.',
    props: [
      { name: 'visible',  type: 'boolean',                                     required: true },
      { name: 'kind',     type: "'info'|'success'|'warning'|'error'",          required: false, default: 'info' },
      { name: 'children', type: 'ReactNode',                                   required: true },
    ],
    motionStates: ['enter', 'exit'],
    a11y: { role: 'status', requires: ['aria-live=assertive for error kind'] },
    feedback: { haptic: null, sound: null },
    examples: [{ name: 'error', snippet: '<Toast visible={hasError} kind="error">CONNECTION LOST</Toast>' }],
  },
];

const manifest = {
  $schema: 'https://cathode-ui.dev/manifest.schema.json',
  name: 'Cathode UI',
  version: TOKENS.version,
  description:
    'Retro-future design system — monospace, pixel shapes, motion + haptics + sound + AI-native surfaces. Read this manifest to understand how to compose Cathode primitives without scraping React source.',
  fontStack: TOKENS.type.fontStack,
  themes: ['light', 'dark'],
  themeSelection: "CSS `prefers-color-scheme`, overridable via <html data-theme='dark|light'> or <CathodeProvider theme='dark|light'>.",
  imports: {
    tokens: "import '@cathode-ui/react/tokens.css';",
    fonts:  "import '@cathode-ui/react/fonts.css';",
    icons:  "import { IconBroadcast, IconChat /* ... */ } from '@cathode-ui/react/icons';",
  },
  tokens: { $ref: 'tokens/tokens.json' },
  components,
};

writeFileSync(
  resolve(ROOT, 'cathode.manifest.json'),
  JSON.stringify(manifest, null, 2) + '\n'
);
console.log(`Wrote cathode.manifest.json with ${components.length} components.`);
