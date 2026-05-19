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
// Per-component decision guidance kept in a companion file so the
// component definitions below stay focused on structural metadata.
// See scripts/component-guidance.json for the editable prose.
const GUIDANCE = JSON.parse(readFileSync(resolve(__dirname, 'component-guidance.json'), 'utf8'));

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
      { name: 'value',       type: 'string',                required: true },
      { name: 'onChange',    type: '(v: string) => void',   required: true },
      { name: 'placeholder', type: 'string',                required: false },
      { name: 'disabled',    type: 'boolean',               required: false },
      { name: 'ai',          type: 'TextFieldAIConfig',     required: false },
      { name: 'weight',      type: "'regular'|'bold'",      required: false, default: 'regular', description: 'Font weight of the typed text.' },
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
      { name: 'weight',      type: "'regular'|'bold'",    required: false, default: 'regular', description: 'Font weight of the typed text.' },
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
    name: 'Badge',
    import: "import { Badge } from '@cathode-ui/react';",
    summary: 'Small inline marker for status/state — "NEW", "BETA", "PRO". Display-only; solid (filled) or outline variants.',
    props: [
      { name: 'children', type: 'ReactNode',                                       required: true },
      { name: 'kind',     type: "'neutral'|'info'|'success'|'warning'|'danger'",   required: false, default: 'neutral' },
      { name: 'variant',  type: "'solid'|'outline'",                               required: false, default: 'solid' },
      { name: 'size',     type: "'sm'|'md'",                                       required: false, default: 'md' },
    ],
    motionStates: [],
    a11y: { role: 'text', requires: [] },
    feedback: { haptic: null, sound: null },
    examples: [
      { name: 'new',     snippet: '<Badge kind="success">NEW</Badge>' },
      { name: 'outline', snippet: '<Badge kind="warning" variant="outline">BETA</Badge>' },
    ],
  },
  {
    name: 'Tag',
    import: "import { Tag } from '@cathode-ui/react';",
    summary: 'Accent-colored outlined marker for keywords, filters, or classifications. Optional `onRemove` renders a trailing × button.',
    props: [
      { name: 'children',    type: 'ReactNode',                                                                                     required: true },
      { name: 'accent',      type: "'neutral'|'info'|'success'|'warning'|'danger'|'amber'|'pink'|'purple'|'teal'|'grey'",           required: false, default: 'neutral' },
      { name: 'onRemove',    type: '() => void',                                                                                    required: false, description: 'When set, renders a close button after the label.' },
      { name: 'removeLabel', type: 'string',                                                                                        required: false, default: 'Remove', description: 'ARIA label for the remove button.' },
    ],
    motionStates: [],
    a11y: { role: 'text', requires: ['aria-label on onRemove button (default "Remove")'] },
    feedback: { haptic: null, sound: null },
    examples: [
      { name: 'filter',     snippet: '<Tag accent="info">ENGINEERING</Tag>' },
      { name: 'removable',  snippet: '<Tag accent="amber" onRemove={() => drop("p1")}>P1</Tag>' },
    ],
  },
  {
    name: 'Avatar',
    import: "import { Avatar } from '@cathode-ui/react';",
    summary: 'Square identity marker — image, initials fallback, optional status dot.',
    props: [
      { name: 'name',     type: 'string',                                                                                        required: false, description: 'Source for initials fallback.' },
      { name: 'src',      type: 'string',                                                                                        required: false },
      { name: 'alt',      type: 'string',                                                                                        required: false },
      { name: 'size',     type: "'sm'|'md'|'lg'",                                                                                required: false, default: 'md' },
      { name: 'status',   type: "'online'|'away'|'busy'|'offline'",                                                              required: false },
      { name: 'accent',   type: "'neutral'|'info'|'success'|'warning'|'danger'|'amber'|'pink'|'purple'|'teal'|'grey'",           required: false, default: 'info' },
      { name: 'children', type: 'ReactNode',                                                                                     required: false, description: 'Custom content (icon, emoji). Falls back to initials.' },
    ],
    motionStates: [],
    a11y: { role: 'img', requires: ['alt or name for image variant'] },
    feedback: { haptic: null, sound: null },
    examples: [
      { name: 'initials', snippet: '<Avatar name="Madhan Raj" accent="teal" />' },
      { name: 'status',   snippet: '<Avatar src="/u.jpg" name="Madhan" status="online" size="lg" />' },
    ],
  },
  {
    name: 'Kbd',
    import: "import { Kbd } from '@cathode-ui/react';",
    summary: 'Keyboard shortcut indicator — each key in its own bordered box, joined by a separator.',
    props: [
      { name: 'keys',      type: 'string | string[]',    required: true, description: 'String ("Ctrl+K") is split on + or -. Pass an array for keys that literally contain "+".' },
      { name: 'separator', type: 'string',               required: false, default: '+' },
      { name: 'size',      type: "'sm'|'md'",            required: false, default: 'md' },
    ],
    motionStates: [],
    a11y: { role: 'group', requires: [] },
    feedback: { haptic: null, sound: null },
    examples: [
      { name: 'pair',  snippet: '<Kbd keys="Ctrl+K" />' },
      { name: 'array', snippet: '<Kbd keys={["Shift","+","Tab"]} />' },
    ],
  },
  {
    name: 'CodeBlock',
    import: "import { CodeBlock } from '@cathode-ui/react';",
    summary: 'Multi-line code sample with optional language label and copy button. Pass `html` for pre-highlighted code (Shiki/Highlight.js).',
    props: [
      { name: 'code',      type: 'string',  required: false, description: 'Plain-text code. Ignored when `html` is passed.' },
      { name: 'html',      type: 'string',  required: false, description: 'Pre-rendered highlighted HTML.' },
      { name: 'language',  type: 'string',  required: false },
      { name: 'showCopy',  type: 'boolean', required: false, default: true },
      { name: 'maxHeight', type: 'number',  required: false },
    ],
    motionStates: [],
    a11y: { role: 'region', requires: ['pre is focusable (tabindex=0) for keyboard scroll'] },
    feedback: { haptic: null, sound: null },
    examples: [
      { name: 'ts', snippet: '<CodeBlock language="ts" code={"const x = 1;"} />' },
    ],
  },
  {
    name: 'Table',
    import: "import { Table } from '@cathode-ui/react';",
    summary: 'Terminal-style tabular display. Controlled sort via onSortChange; optional row-click with keyboard support.',
    props: [
      { name: 'columns',       type: 'TableColumn[]',                                            required: true },
      { name: 'rows',          type: 'T[]',                                                      required: true },
      { name: 'sortBy',        type: 'string',                                                   required: false },
      { name: 'sortDir',       type: "'asc'|'desc'",                                             required: false, default: 'asc' },
      { name: 'onSortChange',  type: "(key, dir) => void",                                       required: false, description: 'Emitted when a sortable header is clicked. Consumer supplies sorted rows.' },
      { name: 'onRowClick',    type: '(row, i) => void',                                         required: false, description: 'Makes each row focusable + Enter/Space activatable.' },
      { name: 'caption',       type: 'string',                                                   required: false },
      { name: 'showCaption',   type: 'boolean',                                                  required: false, default: false, description: 'Visually show the caption above the table.' },
      { name: 'emptyText',     type: 'string',                                                   required: false, default: 'NO DATA' },
    ],
    motionStates: [],
    a11y: { role: 'table', requires: ['caption recommended; aria-sort set automatically'] },
    feedback: { haptic: null, sound: null },
    examples: [
      { name: 'basic',    snippet: '<Table columns={cols} rows={rows} />' },
      { name: 'sortable', snippet: '<Table columns={cols} rows={sortedRows} sortBy="name" sortDir="asc" onSortChange={handleSort} />' },
    ],
  },
  {
    name: 'Tabs',
    import: "import { Tabs } from '@cathode-ui/react';",
    summary: 'Horizontal tabs where exactly one is active. Controlled via value + onChange.',
    props: [
      { name: 'value',    type: 'string',                required: true },
      { name: 'onChange', type: '(v: string) => void',  required: true },
      { name: 'items',    type: 'Array<{value,label,disabled?}>', required: true },
      { name: 'accent',   type: "'info'|'success'|'warning'|'danger'|'accent'", required: false, default: 'info' },
    ],
    motionStates: ['idle', 'press'],
    a11y: { role: 'tablist', requires: ['aria-label for the group'] },
    feedback: { haptic: 'tap', sound: 'click' },
    examples: [{ name: 'views', snippet: '<Tabs value={v} onChange={setV} items={[{value:"a",label:"Overview"},{value:"b",label:"Logs"}]} aria-label="Views" />' }],
  },
  {
    name: 'Breadcrumbs',
    import: "import { Breadcrumbs } from '@cathode-ui/react';",
    summary: 'Path-style navigation. The last item is marked `aria-current="page"` and rendered as static text.',
    props: [
      { name: 'items',     type: 'Array<{label, href?}>', required: true },
      { name: 'separator', type: 'string',                required: false, default: '›' },
    ],
    motionStates: [],
    a11y: { role: 'navigation', requires: ['aria-label (defaults to "Breadcrumb")'] },
    feedback: { haptic: null, sound: null },
    examples: [{ name: 'path', snippet: '<Breadcrumbs items={[{label:"Home",href:"/"},{label:"Docs",href:"/docs"},{label:"Tabs"}]} />' }],
  },
  {
    name: 'Menu',
    import: "import { Menu } from '@cathode-ui/react';",
    summary: 'Click-triggered dropdown of actions. Keyboard-navigable (ArrowUp/Down, Enter, Escape).',
    props: [
      { name: 'trigger', type: 'ReactNode',                                            required: true, description: 'Usually a Button or icon.' },
      { name: 'items',   type: 'Array<{label, onSelect, disabled?, shortcut?, kind?, divider?}>', required: true },
      { name: 'align',   type: "'start'|'end'",                                        required: false, default: 'start' },
    ],
    motionStates: [],
    a11y: { role: 'menu', requires: ['aria-haspopup + aria-expanded set automatically on trigger'] },
    feedback: { haptic: null, sound: null },
    examples: [{ name: 'actions', snippet: '<Menu trigger={<Button>MORE</Button>} items={[{label:"Edit",onSelect:doEdit,shortcut:"E"},{label:"Delete",kind:"danger",onSelect:doDelete}]} />' }],
  },
  {
    name: 'Pagination',
    import: "import { Pagination } from '@cathode-ui/react';",
    summary: 'Prev/Next arrows + windowed page buttons with ellipses. Controlled: page + totalPages + onChange.',
    props: [
      { name: 'page',       type: 'number',            required: true, description: '1-based current page.' },
      { name: 'totalPages', type: 'number',            required: true, description: 'Renders nothing when ≤ 1.' },
      { name: 'onChange',   type: '(page: number) => void', required: true },
    ],
    motionStates: [],
    a11y: { role: 'navigation', requires: ['aria-label (defaults to "Pagination")', 'aria-current on active page'] },
    feedback: { haptic: null, sound: null },
    examples: [{ name: 'basic', snippet: '<Pagination page={p} totalPages={12} onChange={setP} />' }],
  },
  {
    name: 'Popover',
    import: "import { Popover } from '@cathode-ui/react';",
    summary: 'Anchored floating panel, click to open. Closes on outside click / Escape.',
    props: [
      { name: 'trigger',      type: 'ReactNode',             required: true },
      { name: 'children',     type: 'ReactNode',             required: true },
      { name: 'open',         type: 'boolean',               required: false, description: 'Controlled — pair with onOpenChange.' },
      { name: 'defaultOpen',  type: 'boolean',               required: false, default: false, description: 'Uncontrolled fallback.' },
      { name: 'onOpenChange', type: '(open: boolean) => void', required: false },
      { name: 'align',        type: "'start'|'end'",         required: false, default: 'start' },
    ],
    motionStates: [],
    a11y: { role: 'dialog', requires: ['aria-haspopup + aria-expanded set automatically on trigger'] },
    feedback: { haptic: null, sound: null },
    examples: [{ name: 'info', snippet: '<Popover trigger={<Button>DETAILS</Button>}><p>Some info</p></Popover>' }],
  },
  {
    name: 'Tooltip',
    import: "import { Tooltip } from '@cathode-ui/react';",
    summary: 'Hover/focus-triggered hint. Text-only; wraps a focusable child and injects aria-describedby.',
    props: [
      { name: 'children', type: 'ReactElement',  required: true, description: 'The element the tooltip describes.' },
      { name: 'label',    type: 'string',        required: true },
      { name: 'side',     type: "'top'|'bottom'|'left'|'right'", required: false, default: 'top' },
      { name: 'delay',    type: 'number',        required: false, default: 200, description: 'Delay before showing, in MILLISECONDS.' },
    ],
    motionStates: [],
    a11y: { role: 'tooltip', requires: ['aria-describedby threaded into child automatically'] },
    feedback: { haptic: null, sound: null },
    examples: [{ name: 'shortcut', snippet: '<Tooltip label="Save — Cmd+S"><Button>SAVE</Button></Tooltip>' }],
  },
  {
    name: 'Drawer',
    import: "import { Drawer } from '@cathode-ui/react';",
    summary: 'Slide-in panel anchored to a viewport edge. Non-modal by default; pass `modal` to require explicit close.',
    props: [
      { name: 'open',     type: 'boolean',              required: true },
      { name: 'onClose',  type: '() => void',           required: true },
      { name: 'children', type: 'ReactNode',            required: true },
      { name: 'title',    type: 'string',               required: false },
      { name: 'side',     type: "'left'|'right'|'top'|'bottom'", required: false, default: 'right' },
      { name: 'size',     type: 'number',               required: false, default: 360, description: 'Width for left/right, height for top/bottom.' },
      { name: 'modal',    type: 'boolean',              required: false, default: false },
    ],
    motionStates: ['enter', 'exit'],
    a11y: { role: 'dialog', requires: ['aria-modal set from `modal` prop', 'aria-label from title'] },
    feedback: { haptic: null, sound: null },
    examples: [{ name: 'filters', snippet: '<Drawer open={show} onClose={close} title="FILTERS" side="right">...</Drawer>' }],
  },
  {
    name: 'ProgressBar',
    import: "import { ProgressBar } from '@cathode-ui/react';",
    summary: 'Continuous horizontal bar for determinate progress. Omit `value` for an indeterminate shimmer.',
    props: [
      { name: 'value',     type: 'number',  required: false, description: '0–1. Omit for indeterminate.' },
      { name: 'accent',    type: "'info'|'success'|'warning'|'danger'|'accent'", required: false, default: 'success' },
      { name: 'height',    type: 'number',  required: false, default: 6 },
      { name: 'showValue', type: 'boolean', required: false, default: false },
    ],
    motionStates: ['shimmer'],
    a11y: { role: 'progressbar', requires: ['aria-label (default "Progress")', 'aria-valuenow set automatically'] },
    feedback: { haptic: null, sound: null },
    examples: [
      { name: 'value',         snippet: '<ProgressBar value={0.42} showValue />' },
      { name: 'indeterminate', snippet: '<ProgressBar />' },
    ],
  },
  {
    name: 'Loader',
    import: "import { Loader } from '@cathode-ui/react';",
    summary: 'Indeterminate loading indicator — four pixel-square cells that rise + brighten on a staggered 1s cycle. (Formerly named Spinner.)',
    props: [
      { name: 'size',   type: "'sm'|'md'|'lg'",                                required: false, default: 'md' },
      { name: 'accent', type: "'info'|'success'|'warning'|'danger'|'accent'", required: false, default: 'info' },
    ],
    motionStates: ['pulse'],
    a11y: { role: 'status', requires: ['aria-label (default "Loading")'] },
    feedback: { haptic: null, sound: null },
    examples: [{ name: 'loading', snippet: '<Loader /> <span>CONNECTING…</span>' }],
  },
  {
    name: 'Skeleton',
    import: "import { Skeleton } from '@cathode-ui/react';",
    summary: 'Placeholder block with a shimmer, used while content loads. Compose multiples to mirror the final layout.',
    props: [
      { name: 'width',   type: 'number | string', required: false },
      { name: 'height',  type: 'number | string', required: false },
      { name: 'variant', type: "'text'|'block'",  required: false, default: 'block' },
    ],
    motionStates: ['shimmer'],
    a11y: { role: 'presentation', requires: ['aria-hidden set automatically'] },
    feedback: { haptic: null, sound: null },
    examples: [
      { name: 'text',  snippet: '<Skeleton variant="text" width={180} />' },
      { name: 'block', snippet: '<Skeleton width="100%" height={120} />' },
    ],
  },
  {
    name: 'SignalBars',
    import: "import { SignalBars } from '@cathode-ui/react';",
    summary: 'Cellular/wifi-style ascending bars. Use for strength, battery, or any 1-of-N reading.',
    props: [
      { name: 'level',  type: 'number', required: true,  description: '0…bars; fractional values round.' },
      { name: 'bars',   type: 'number', required: false, default: 5 },
      { name: 'accent', type: "'info'|'success'|'warning'|'danger'|'accent'", required: false, default: 'info' },
      { name: 'width',  type: 'number', required: false, default: 24 },
      { name: 'height', type: 'number', required: false, default: 16 },
    ],
    motionStates: [],
    a11y: { role: 'img', requires: ['aria-label auto-composed "Signal: N of M"'] },
    feedback: { haptic: null, sound: null },
    examples: [{ name: 'strength', snippet: '<SignalBars level={4} />' }],
  },
  {
    name: 'ScanLine',
    import: "import { ScanLine } from '@cathode-ui/react';",
    summary: 'Decorative CRT scan-line overlay. Wraps children with a translucent grid + a sweeping beam.',
    props: [
      { name: 'children',       type: 'ReactNode', required: false },
      { name: 'speed',          type: 'number',    required: false, default: 4, description: 'Sweep duration in seconds.' },
      { name: 'color',          type: 'string',    required: false, description: 'CSS color for the sweeping beam.' },
      { name: 'patternOpacity', type: 'number',    required: false, default: 0.06 },
    ],
    motionStates: ['sweep'],
    a11y: { role: 'presentation', requires: ['decorative — aria-hidden on effect layers'] },
    feedback: { haptic: null, sound: null },
    examples: [{ name: 'overlay', snippet: '<ScanLine><TerminalFrame title="CAM">…</TerminalFrame></ScanLine>' }],
  },
  {
    name: 'TypewriterText',
    import: "import { TypewriterText } from '@cathode-ui/react';",
    summary: 'Character-by-character reveal animation. Respects `prefers-reduced-motion` by rendering the full text immediately.',
    props: [
      { name: 'text',        type: 'string',     required: true },
      { name: 'speed',       type: 'number',     required: false, default: 40, description: 'ms per character.' },
      { name: 'cursorAfter', type: 'boolean',    required: false, default: true },
      { name: 'delay',       type: 'number',     required: false, default: 0 },
      { name: 'color',       type: 'string',     required: false, description: 'CSS color for the typed text. Default inherits.' },
      { name: 'cursorColor', type: 'string',     required: false, description: 'CSS color for the blinking cursor. Default info token.' },
      { name: 'onDone',      type: '() => void', required: false },
    ],
    motionStates: ['typing', 'cursor-blink'],
    a11y: { role: 'text', requires: ['aria-label carries the full text so SR reads it once'] },
    feedback: { haptic: null, sound: null },
    examples: [{ name: 'boot', snippet: '<TypewriterText text="SYSTEM INITIALIZED." speed={30} />' }],
  },
  {
    name: 'Countdown',
    import: "import { Countdown } from '@cathode-ui/react';",
    summary: 'T-minus timer. Renders HH:MM:SS (or DD:HH:MM:SS when > 24h); auto-flips to danger in the final minute.',
    props: [
      { name: 'target',     type: 'Date | number', required: true },
      { name: 'prefix',     type: 'string',        required: false, default: 'T-' },
      { name: 'accent',     type: "'info'|'success'|'warning'|'danger'|'accent'", required: false, default: 'info' },
      { name: 'onComplete', type: '() => void',    required: false },
    ],
    motionStates: [],
    a11y: { role: 'timer', requires: ['aria-live="off" to avoid spamming SR'] },
    feedback: { haptic: null, sound: null },
    examples: [{ name: 'launch', snippet: '<Countdown target={launchAt} prefix="T-" onComplete={fire} />' }],
  },
  {
    name: 'Stack',
    import: "import { Stack } from '@cathode-ui/react';",
    summary: 'Utility flex wrapper — direction, gap, alignment in one prop surface. No visual chrome.',
    props: [
      { name: 'children',  type: 'ReactNode',                              required: true },
      { name: 'direction', type: "'row'|'column'",                          required: false, default: 'column' },
      { name: 'gap',       type: 'number | string',                         required: false, description: 'Number → px; string → any CSS length.' },
      { name: 'align',     type: 'CSSProperties.alignItems',                required: false },
      { name: 'justify',   type: 'CSSProperties.justifyContent',            required: false },
      { name: 'wrap',      type: 'boolean',                                 required: false, default: false },
      { name: 'inline',    type: 'boolean',                                 required: false, default: false, description: 'Render as inline-flex instead of flex.' },
      { name: 'fullWidth', type: 'boolean',                                 required: false, default: false },
      { name: 'as',        type: "'div'|'section'|'article'|'header'|'footer'|'main'|'nav'|'aside'", required: false, default: 'div' },
    ],
    motionStates: [],
    a11y: { role: 'generic', requires: ['pass `as` + aria-label when Stack acts as a semantic group'] },
    feedback: { haptic: null, sound: null },
    examples: [
      { name: 'horizontal', snippet: '<Stack direction="row" gap={8} align="center"><Pill title="A" /><Pill title="B" /></Stack>' },
      { name: 'vertical',   snippet: '<Stack gap={12}><DotLeader label="LAT" value="42 MS" /><DotLeader label="LOSS" value="0%" /></Stack>' },
    ],
  },
  {
    name: 'Accordion',
    import: "import { Accordion } from '@cathode-ui/react';",
    summary: 'Expand/collapse sections. Controlled via expandedIds + onExpandedChange; `allowMultiple={false}` for exclusive mode.',
    props: [
      { name: 'items',              type: 'Array<{id, title, content, meta?, disabled?}>', required: true },
      { name: 'expandedIds',        type: 'string[]',                                      required: false, description: 'Controlled. Uncontrolled fallback uses defaultExpandedIds.' },
      { name: 'onExpandedChange',   type: '(ids: string[]) => void',                       required: false },
      { name: 'defaultExpandedIds', type: 'string[]',                                      required: false, default: '[]' },
      { name: 'allowMultiple',      type: 'boolean',                                       required: false, default: true, description: 'When false, opening one item closes the others.' },
    ],
    motionStates: ['expand', 'collapse', 'chevron-rotate'],
    a11y: { role: 'group', requires: ['aria-expanded + aria-controls set automatically on each header'] },
    feedback: { haptic: null, sound: null },
    examples: [
      { name: 'basic',     snippet: '<Accordion items={[{id:"a",title:"DETAILS",content:<p>hello</p>}]} />' },
      { name: 'exclusive', snippet: '<Accordion items={items} allowMultiple={false} defaultExpandedIds={["a"]} />' },
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

// Merge the decision-guidance companion into each component entry.
// Every component must have guidance — fail loud if one's missing so
// new primitives don't silently ship without "when to use" help.
// Vue adapter entries for every Cathode component shipped in
// `@cathode-ui/vue`. Derived from the React examples above, transposed
// into Vue template idioms:
//   - JSX `onX={fn}` → Vue `@x="fn"`
//   - controlled inputs use `v-model` where the React version used
//     `value` + `onChange`
//   - numeric / boolean prop shortcuts use `:` prefix
//   - slots replace `children` — named slots (`#icon`, etc.) where
//     React accepted a ReactNode prop
// Any component whose Vue adapter isn't listed here falls back to the
// React adapter in MCP responses with a `fallbackFrom: 'react'` note.
const vueImport = (name) => `import { ${name} } from '@cathode-ui/vue';`;

// SwiftUI adapter entries for components shipped in `packages/swift`
// (Cathode-Swift package, distributed via SPM at repo root). The
// import line is the same for every component (`import CathodeUI`),
// and the class names use the `Cathode` prefix to avoid SwiftUI's
// own `Button` / `Stack` types. Components NOT listed here omit
// `adapters.swiftui` — MCP falls back to React with a per-component
// `note` so agents know the SwiftUI port is pending. Phase 3 ships
// 7 bellwether primitives in session 1; remaining ~38 land in
// follow-up sessions.
const swiftImport = "import CathodeUI";
const SWIFTUI_ADAPTERS = {
  TerminalFrame: { import: swiftImport, examples: [
    { name: 'titled',   snippet: 'CathodeTerminalFrame(title: "PEERS") {\n    // children\n}' },
    { name: 'accented', snippet: 'CathodeTerminalFrame(title: "ERROR", accent: .danger) {\n    // children\n}' },
  ]},
  Stack: { import: swiftImport, examples: [
    { name: 'row',    snippet: 'CathodeStack(direction: .row, gap: 8, alignment: .center) {\n    CathodePill("ALPHA")\n    CathodePill("BRAVO")\n}' },
    { name: 'column', snippet: 'CathodeStack(gap: 16, fullWidth: true) {\n    CathodeBadge("LIVE", kind: .success)\n}' },
  ]},
  DotLeader: { import: swiftImport, examples: [
    { name: 'row',     snippet: 'CathodeDotLeader(label: "LATENCY", value: "42 MS")' },
    { name: 'colored', snippet: 'CathodeDotLeader(label: "STATE", value: "HEALTHY",\n                 valueColor: CathodeTokens.Palette.Dark.success)' },
  ]},
  PulsingDot: { import: swiftImport, examples: [
    { name: 'basic', snippet: 'CathodePulsingDot(color: CathodeTokens.Palette.Dark.success)' },
  ]},
  Badge: { import: swiftImport, examples: [
    { name: 'solid',   snippet: 'CathodeBadge("NEW", kind: .info)' },
    { name: 'outline', snippet: 'CathodeBadge("LIVE", kind: .success, variant: .outline)' },
  ]},
  Button: { import: swiftImport, examples: [
    { name: 'primary', snippet: 'CathodeButton("SAVE", variant: .primary) { save() }' },
    { name: 'danger',  snippet: 'CathodeButton("DELETE", variant: .danger) { remove() }' },
  ]},
  Pill: { import: swiftImport, examples: [
    { name: 'nav',    snippet: 'CathodePill("LOGS", accent: .info, isActive: tab == .logs) { tab = .logs }' },
    { name: 'action', snippet: 'CathodePill("REFRESH", accent: .info) { refetch() }' },
  ]},

  // Forms cluster (Phase 3 session 2)
  Toggle: { import: swiftImport, examples: [
    { name: 'basic', snippet: 'CathodeToggle("ARMED", value: $armed)' },
    { name: 'danger', snippet: 'CathodeToggle("DANGER MODE", value: $armed, accent: .danger)' },
  ]},
  Checkbox: { import: swiftImport, examples: [
    { name: 'basic', snippet: 'CathodeCheckbox("ENABLE", value: $enabled)' },
    { name: 'tri',   snippet: 'CathodeCheckbox("ALL", value: $allOn, isIndeterminate: someOn && !allOn)' },
  ]},
  RadioGroup: { import: swiftImport, examples: [
    { name: 'basic', snippet: 'CathodeRadioGroup(value: $mode, options: [\n    .init(value: "auto",   label: "AUTO"),\n    .init(value: "manual", label: "MANUAL"),\n])' },
  ]},
  Select: { import: swiftImport, examples: [
    { name: 'basic', snippet: 'CathodeSelect(value: $theme, options: [\n    .init(value: "auto",  label: "AUTO"),\n    .init(value: "dark",  label: "DARK"),\n    .init(value: "light", label: "LIGHT"),\n])' },
  ]},
  Counter: { import: swiftImport, examples: [
    { name: 'basic', snippet: 'CathodeCounter(value: $wpm, min: 5, max: 40, label: "WPM")' },
  ]},
  TextField: { import: swiftImport, examples: [
    { name: 'basic',   snippet: 'CathodeTextField(text: $name, placeholder: "CALLSIGN")' },
    { name: 'aiSuggest', snippet: 'CathodeTextField(text: $draft, aiSuggest: true)' },
  ]},
  TextArea: { import: swiftImport, examples: [
    { name: 'basic', snippet: 'CathodeTextArea(text: $notes, rows: 6, maxLength: 500)' },
  ]},
  FormField: { import: swiftImport, examples: [
    { name: 'basic', snippet: 'CathodeFormField(label: "CALLSIGN", hint: "4 chars", isRequired: true) {\n    CathodeTextField(text: $callsign)\n}' },
    { name: 'error', snippet: 'CathodeFormField(label: "CALLSIGN", error: "Must be 4 characters") {\n    CathodeTextField(text: $callsign)\n}' },
  ]},
  SearchBar: { import: swiftImport, examples: [
    { name: 'plain', snippet: 'CathodeSearchBar(\n    items: contacts,\n    label: { .init(primary: $0.name, secondary: $0.callsign) }\n) { onPick($0) }' },
    { name: 'semantic', snippet: 'CathodeSearchBar(\n    items: contacts,\n    label: { .init(primary: $0.name) },\n    aiSemantic: true\n) { onPick($0) }' },
  ]},
  Chips: { import: swiftImport, examples: [
    { name: 'flat',    snippet: 'CathodeChips([.init(label: "GO"), .init(label: "STOP")]) { onPick($0) }' },
    { name: 'grouped', snippet: 'CathodeChips(groups: [\n    .init([.init(label: "DUPLICATE")]),\n    .init([.init(label: "DELETE")])\n]) { onPick($0) }' },
  ]},
};
const VUE_ADAPTERS = {
  // Layout
  TerminalFrame: { import: vueImport('TerminalFrame'), examples: [
    { name: 'titled',   snippet: '<TerminalFrame title="PEERS">\n  <!-- children -->\n</TerminalFrame>' },
    { name: 'accented', snippet: '<TerminalFrame title="ERROR" accent="danger">…</TerminalFrame>' },
  ]},
  Card: { import: vueImport('Card'), examples: [
    { name: 'info',      snippet: '<Card accent="info" surface="elevated">\n  <DotLeader label="LAT" value="42 MS" />\n</Card>' },
    { name: 'clickable', snippet: '<Card clickable aria-label="Show details" @click="open">…</Card>' },
  ]},
  Stack: { import: vueImport('Stack'), examples: [
    { name: 'row',    snippet: '<Stack direction="row" :gap="8" align="center">\n  <Pill />\n  <Pill />\n</Stack>' },
    { name: 'column', snippet: '<Stack :gap="16" fullWidth>\n  <FormField />\n  <FormField />\n</Stack>' },
  ]},
  Accordion: { import: vueImport('Accordion'), examples: [
    { name: 'basic', snippet: '<Accordion\n  :items="items"\n  v-model:expandedIds="expanded"\n/>' },
    { name: 'exclusive', snippet: '<Accordion :items="items" :allowMultiple="false" />' },
  ]},
  HazardStripes: { import: vueImport('HazardStripes'), examples: [
    { name: 'subtle', snippet: '<HazardStripes :intensity="0.12">\n  <Button variant="danger">DELETE</Button>\n</HazardStripes>' },
  ]},

  // Forms
  Button: { import: vueImport('Button'), examples: [
    { name: 'primary', snippet: '<Button variant="primary" @click="save">SAVE</Button>' },
    { name: 'danger',  snippet: '<Button variant="danger"  @click="remove">DELETE</Button>' },
  ]},
  TextField: { import: vueImport('TextField'), examples: [
    { name: 'basic',   snippet: '<TextField v-model="name" placeholder="CALLSIGN" />' },
    { name: 'ai',      snippet: '<TextField v-model="draft" :ai="{ suggest: true }" />' },
  ]},
  TextArea: { import: vueImport('TextArea'), examples: [
    { name: 'basic',   snippet: '<TextArea v-model="notes" :rows="6" :maxLength="500" />' },
  ]},
  Select: { import: vueImport('Select'), examples: [
    { name: 'basic', snippet: '<Select v-model="theme" :options="themeOptions" aria-label="Theme" />' },
  ]},
  Checkbox: { import: vueImport('Checkbox'), examples: [
    { name: 'basic', snippet: '<Checkbox v-model="enabled" label="ENABLE" />' },
    { name: 'tri',   snippet: '<Checkbox v-model="allOn" :indeterminate="someOn && !allOn" label="ALL" />' },
  ]},
  RadioGroup: { import: vueImport('RadioGroup'), examples: [
    { name: 'basic', snippet: '<RadioGroup v-model="mode" :options="modeOptions" />' },
  ]},
  Toggle: { import: vueImport('Toggle'), examples: [
    { name: 'basic', snippet: '<Toggle v-model="notify" label="NOTIFICATIONS" />' },
    { name: 'armed', snippet: '<Toggle v-model="armed" accent="danger" label="I UNDERSTAND" />' },
  ]},
  Counter: { import: vueImport('Counter'), examples: [
    { name: 'basic', snippet: '<Counter v-model="wpm" :min="5" :max="40" label="WPM" />' },
  ]},
  SearchBar: { import: vueImport('SearchBar'), examples: [
    { name: 'plain',    snippet: '<SearchBar :items="contacts" @select="onPick" placeholder="SEARCH…" />' },
    { name: 'semantic', snippet: '<SearchBar :items="contacts" :ai="{ semantic: true }" @select="onPick" />' },
  ]},
  FormField: { import: vueImport('FormField'), examples: [
    { name: 'basic', snippet: '<FormField label="CALLSIGN" hint="4 chars, alphanumeric." required>\n  <TextField v-model="callsign" />\n</FormField>' },
    { name: 'error', snippet: '<FormField label="CALLSIGN" error="Must be 4 characters">\n  <TextField v-model="callsign" />\n</FormField>' },
  ]},
  Chips: { import: vueImport('Chips'), examples: [
    { name: 'flat',    snippet: '<Chips :groups="phrases" @select="onPick" />' },
    { name: 'grouped', snippet: '<Chips :groups="[emergency, everyday]" @select="onPick" />' },
  ]},

  // Data
  Badge: { import: vueImport('Badge'), examples: [
    { name: 'solid',   snippet: '<Badge kind="info">NEW</Badge>' },
    { name: 'outline', snippet: '<Badge kind="success" variant="outline">LIVE</Badge>' },
  ]},
  Tag: { import: vueImport('Tag'), examples: [
    { name: 'basic',     snippet: '<Tag accent="info">GEODESY</Tag>' },
    { name: 'removable', snippet: '<Tag accent="info" removable @remove="drop(\'geodesy\')">GEODESY</Tag>' },
  ]},
  Avatar: { import: vueImport('Avatar'), examples: [
    { name: 'initials', snippet: '<Avatar name="K. ALICE" status="online" />' },
    { name: 'image',    snippet: '<Avatar src="/u/kmw.jpg" alt="KMW" size="lg" />' },
  ]},
  Kbd: { import: vueImport('Kbd'), examples: [
    { name: 'string',  snippet: '<Kbd keys="Ctrl+K" />' },
    { name: 'array',   snippet: '<Kbd :keys="[\'Shift\', \'Tab\']" />' },
  ]},
  CodeBlock: { import: vueImport('CodeBlock'), examples: [
    { name: 'plain',  snippet: '<CodeBlock :code="snippet" language="ts" />' },
    { name: 'shiki',  snippet: '<CodeBlock :html="highlighted" language="ts" />' },
  ]},
  Table: { import: vueImport('Table'), examples: [
    { name: 'basic', snippet: '<Table :columns="cols" :rows="rows" />' },
    { name: 'sorted', snippet: '<Table :columns="cols" :rows="rows" :sortBy="sortBy" :sortDir="sortDir" @sortChange="onSort" />' },
  ]},
  StatusTile: { import: vueImport('StatusTile'), examples: [
    { name: 'clickable', snippet: '<StatusTile title="TALK" subtitle="HOLD TO TRANSMIT" accent="info" clickable @click="startTalking">\n  <template #icon><IconBroadcast /></template>\n</StatusTile>' },
  ]},
  DotLeader: { import: vueImport('DotLeader'), examples: [
    { name: 'row',     snippet: '<DotLeader label="LATENCY" value="42 MS" />' },
    { name: 'colored', snippet: '<DotLeader label="STATE" value="HEALTHY" valueColor="var(--cathode-color-success)" />' },
  ]},
  Pill: { import: vueImport('Pill'), examples: [
    { name: 'nav',    snippet: '<Pill title="LOGS" accent="info" :active="tab === \'logs\'" @click="tab = \'logs\'" />' },
    { name: 'action', snippet: '<Pill title="REFRESH" accent="info" @click="refetch" />' },
  ]},

  // Navigation
  Tabs: { import: vueImport('Tabs'), examples: [
    { name: 'basic', snippet: '<Tabs v-model="view" :items="[{ value: \'overview\', label: \'OVERVIEW\' }, { value: \'logs\', label: \'LOGS\' }]" />' },
  ]},
  Breadcrumbs: { import: vueImport('Breadcrumbs'), examples: [
    { name: 'basic', snippet: '<Breadcrumbs :items="[{ label: \'HOME\', href: \'/\' }, { label: \'FLEET\', href: \'/fleet\' }, { label: \'KA4X\' }]" />' },
  ]},
  Menu: { import: vueImport('Menu'), examples: [
    { name: 'overflow', snippet: '<Menu :items="[{ label: \'DUPLICATE\' }, { label: \'DELETE\', kind: \'danger\' }]" @select="onAction">\n  <template #trigger><Button>⋯</Button></template>\n</Menu>' },
  ]},
  Pagination: { import: vueImport('Pagination'), examples: [
    { name: 'basic', snippet: '<Pagination v-model="page" :totalPages="12" />' },
  ]},

  // Feedback
  ProgressBar: { import: vueImport('ProgressBar'), examples: [
    { name: 'determinate',   snippet: '<ProgressBar :value="uploadPct" showValue />' },
    { name: 'indeterminate', snippet: '<ProgressBar />' },
  ]},
  Loader: { import: vueImport('Loader'), examples: [
    { name: 'md', snippet: '<Loader size="md" aria-label="Connecting" />' },
  ]},
  Skeleton: { import: vueImport('Skeleton'), examples: [
    { name: 'text',  snippet: '<Skeleton variant="text" :width="180" />' },
    { name: 'block', snippet: '<Skeleton variant="block" :height="60" />' },
  ]},
  PixelBar: { import: vueImport('PixelBar'), examples: [
    { name: 'vu', snippet: '<PixelBar :level="0.6" :cells="24" />' },
  ]},
  ActivityBar: { import: vueImport('ActivityBar'), examples: [
    { name: 'transmitting', snippet: '<ActivityBar :intensity="0.55" :seed="tick" :cells="28" />' },
  ]},
  SignalBars: { import: vueImport('SignalBars'), examples: [
    { name: 'basic', snippet: '<SignalBars :level="4" :bars="5" accent="success" />' },
  ]},
  PulsingDot: { import: vueImport('PulsingDot'), examples: [
    { name: 'basic', snippet: '<PulsingDot color="var(--cathode-color-success)" />' },
  ]},
  Toast: { import: vueImport('Toast'), examples: [
    { name: 'basic', snippet: '<Toast :visible="show" kind="success">SAVED</Toast>' },
  ]},

  // Overlays
  Dialog: { import: vueImport('Dialog'), examples: [
    { name: 'confirm', snippet: '<Dialog :open="open" title="DELETE ACCOUNT?" accent="danger" @close="open = false">\n  <p>No undo. Armed actions only.</p>\n</Dialog>' },
  ]},
  Drawer: { import: vueImport('Drawer'), examples: [
    { name: 'right', snippet: '<Drawer :open="open" title="FILTERS" side="right" @close="open = false">\n  <!-- controls -->\n</Drawer>' },
  ]},
  Popover: { import: vueImport('Popover'), examples: [
    { name: 'basic', snippet: '<Popover v-model:open="open" align="end">\n  <template #trigger><Button>…</Button></template>\n  <div>panel content</div>\n</Popover>' },
  ]},
  Tooltip: { import: vueImport('Tooltip'), examples: [
    { name: 'basic', snippet: '<Tooltip label="SAVED" side="top">\n  <Badge kind="success">OK</Badge>\n</Tooltip>' },
  ]},

  // AI
  Chat: { import: vueImport('Chat'), examples: [
    { name: 'basic', snippet: '<Chat title="ASSISTANT" :maxHeight="360" />' },
  ]},

  // Retro
  ScanLine: { import: vueImport('ScanLine'), examples: [
    { name: 'basic', snippet: '<ScanLine :speed="4">\n  <TerminalFrame title="LIVE">…</TerminalFrame>\n</ScanLine>' },
  ]},
  TypewriterText: { import: vueImport('TypewriterText'), examples: [
    { name: 'basic', snippet: '<TypewriterText text="BOOT SEQUENCE INITIATED" :speed="40" />' },
  ]},
  Countdown: { import: vueImport('Countdown'), examples: [
    { name: 'basic', snippet: '<Countdown :target="launchTime" prefix="T-" />' },
  ]},
};

const missing = [];
const enrichedComponents = components.map((c) => {
  const g = GUIDANCE[c.name];
  if (!g) { missing.push(c.name); return c; }

  // Component entries in this file are authored React-first: `import`
  // and `examples` are the React adapter. Fold them into an `adapters`
  // object (keyed by framework name) and merge in any other framework
  // adapters shipped today. The top-level `import` and `examples`
  // fields remain populated as a backwards-compat mirror of
  // `adapters.react` — older MCP clients (<0.4.0) keep working.
  const adapters = {
    react: { import: c.import, examples: c.examples },
  };
  if (VUE_ADAPTERS[c.name]) {
    adapters.vue = VUE_ADAPTERS[c.name];
  }
  if (SWIFTUI_ADAPTERS[c.name]) {
    adapters.swiftui = SWIFTUI_ADAPTERS[c.name];
  }
  return {
    ...c,
    whenToUse: g.whenToUse,
    vs: g.vs ?? [],
    adapters,
  };
});
if (missing.length > 0) {
  console.error(`\nERROR: components missing from component-guidance.json: ${missing.join(', ')}`);
  console.error('Add entries with `whenToUse` + `vs` before regenerating.\n');
  process.exit(1);
}

const manifest = {
  $schema: './scripts/manifest.schema.json',
  name: 'Cathode UI',
  version: TOKENS.version,
  description:
    'Retro-future design system — monospace, pixel shapes, motion + haptics + sound + AI-native surfaces. Read this manifest to understand how to compose Cathode primitives without scraping React source.',
  fontStack: TOKENS.type.fontStack,
  themes: ['light', 'dark'],
  themeSelection: "CSS `prefers-color-scheme`, overridable via <html data-theme='dark|light'> or <CathodeProvider theme='dark|light'>.",
  // Framework adapters currently populated in every component's
  // `adapters` field. Phase 4 adds 'vue', 'svelte', 'solid'; Phase 5
  // adds 'compose'. MCP clients should read `adapters[framework]` on
  // each component; if the key is missing, the flat `import` +
  // `examples` on the component are the React fallback.
  adapters: ['react', 'vue', 'swiftui'],
  imports: {
    tokens: "import '@cathode-ui/react/tokens.css';",
    fonts:  "import '@cathode-ui/react/fonts.css';",
    styles: "import '@cathode-ui/react/styles.css';",
    icons:  "import { IconBroadcast, IconChat /* ... */ } from '@cathode-ui/react/icons';",
  },
  tokens: { $ref: 'tokens/tokens.json' },
  components: enrichedComponents,
};

// Validate the assembled manifest against the JSON Schema. Fails loud
// if any component entry is missing a required key — catches drift
// between scripts/gen-manifest.js and scripts/manifest.schema.json
// before either ships.
// Ajv v8's default export is draft-07; our schema targets draft 2020-12
// (the current standard). Import the 2020 entry point so our `$schema`
// reference resolves.
const { default: Ajv2020 } = await import('ajv/dist/2020.js');
const schema = JSON.parse(readFileSync(resolve(__dirname, 'manifest.schema.json'), 'utf8'));
const ajv = new Ajv2020({ strict: false, allErrors: true });
const validate = ajv.compile(schema);
if (!validate(manifest)) {
  console.error('\nERROR: generated manifest fails its own JSON Schema:');
  for (const err of validate.errors) {
    console.error(`  ${err.instancePath} ${err.message} ${JSON.stringify(err.params)}`);
  }
  process.exit(1);
}

writeFileSync(
  resolve(ROOT, 'cathode.manifest.json'),
  JSON.stringify(manifest, null, 2) + '\n'
);
console.log(`Wrote cathode.manifest.json with ${components.length} components. Schema-valid.`);
