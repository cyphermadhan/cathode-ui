# @cathode-ui/vue

Retro-future **Vue 3** design system. Full framework-mirror of [`@cathode-ui/react`](https://www.npmjs.com/package/@cathode-ui/react): same 45 primitives, same tokens, same manifest, same motion/haptic/sound philosophy — implemented as idiomatic Vue SFCs (`<script setup>` + `<template>`).

By [Madhan Raj](https://www.linkedin.com/in/cyphermadhan/).

**[Docs →](https://cyphermadhan.github.io/cathode-ui/)** · **[React package →](https://www.npmjs.com/package/@cathode-ui/react)**

## Install

```bash
npm install @cathode-ui/vue
```

Peer dep: `vue >= 3.3`.

## AI-native

AI coding agents (Claude Code, Cursor, Windsurf, Codex, VS Code Copilot) can query the Cathode [`@cathode-ui/mcp`](https://www.npmjs.com/package/@cathode-ui/mcp) server with `framework: "vue"` and get Vue-idiomatic imports and template snippets for every component — no prompt engineering needed. The manifest ships a `vue` adapter for all 45 primitives.

## What's inside

**45 primitives** across 8 clusters, matching the React package component-for-component:

- **Layout** — TerminalFrame, Card, Stack, Accordion, HazardStripes
- **Forms** — Button, TextField, TextArea, Select, Checkbox, RadioGroup, Toggle, Counter, SearchBar, FormField, Chips
- **Data** — Badge, Tag, Avatar, Kbd, CodeBlock, Table, StatusTile, DotLeader, Pill
- **Navigation** — Tabs, Breadcrumbs, Menu, Pagination
- **Feedback** — ProgressBar, Loader, Skeleton, PixelBar, ActivityBar, SignalBars, PulsingDot, Toast
- **Overlays** — Dialog, Drawer, Popover, Tooltip
- **AI** — Chat
- **Retro** — ScanLine, TypewriterText, Countdown

Opt-in AI surface on `TextField` (ghost-text suggest), `SearchBar` (semantic search), `Button` (AI action routing), plus `Chat` as a first-class component. Apps plug in their own `CathodeAIProvider` via `<CathodeProvider :ai="provider">` — Cathode stays provider-agnostic.

## Accessibility

Every primitive inherits the same WCAG 2.0/2.1 A+AA-compliant markup as the React package — ARIA roles, keyboard navigation, focus management, form-field labelling via Vue's provide/inject.

## Vue vs React API deltas

Same 45 components, same prop names wherever possible — but Vue idioms pull a few surfaces apart from their React twins. If you're porting a Cathode-React app to Vue, scan this table first.

### v-model replaces `value` + `onChange`

Every controlled input uses `v-model` instead of the React `value` + `onChange` pair. Applies to: `TextField`, `TextArea`, `Select`, `Checkbox`, `RadioGroup`, `Toggle`, `Counter`, `Tabs`, `Pagination`, `Accordion` (via `v-model:expandedIds`), `Popover` (via `v-model:open`).

```vue
<!-- Vue -->              <!-- React equivalent -->
<Toggle v-model="armed" />   <Toggle value={armed} onChange={setArmed} />
```

### Events replace `on*` handler props

`@click`, `@select`, `@remove`, `@close`, `@complete`, `@sortChange`, `@rowClick`, `@actionResult`, `@done` — Cathode-Vue emits events where React accepted `onX` function props.

```vue
<Button variant="primary" @click="save">SAVE</Button>
<Dialog :open="open" @close="open = false">…</Dialog>
```

### Slots replace `ReactNode` props

Where React accepts a `ReactNode` prop (icon, children, trigger), Vue uses named or default slots.

| Component | React (prop) | Vue (slot) |
|---|---|---|
| `Button` | `icon={<Icon/>}` | `<template #icon><Icon/></template>` |
| `Pill` | `icon={<Icon/>}` | `<template #icon><Icon/></template>` |
| `StatusTile` | `icon={<Icon/>}` | `<template #icon><Icon/></template>` |
| `Menu` | `trigger={<Button/>}` | `<template #trigger><Button/></template>` |
| `Popover` | `trigger={<Button/>}` | `<template #trigger><Button/></template>` |
| `SearchBar` | `icon={<Icon/>}` | `<template #icon><Icon/></template>` (plus `showIcon` prop for the default) |
| `Accordion` | `items[].content: ReactNode` | `<template #default="{ item }">…</template>` or `item.content` string |
| `Table` | `columns[].render(row, i)` | `<template #cell-<key>="{ row, value }">…</template>` |

### Explicit `clickable` replaces "listener present"

React's `Card` and `StatusTile` swap to a `<button>` when you pass `onClick`. Vue has no prop-introspection equivalent, so both accept an explicit `clickable` prop:

```vue
<Card clickable @click="open" aria-label="Show details">…</Card>
<StatusTile clickable @click="talk" title="TALK" subtitle="HOLD">
  <template #icon><IconBroadcast/></template>
</StatusTile>
```

### Removable `Tag`

React: pass `onRemove={fn}` — the × button appears. Vue: set the `removable` prop and listen for `@remove`:

```vue
<Tag accent="info" removable @remove="drop('geodesy')">GEODESY</Tag>
```

### Button AI result

React exposes `onActionResult(result)` as a prop; Vue emits `actionResult`:

```vue
<Button :ai="{ action: 'summarize', context: { id } }" @actionResult="onResult">
  EXPLAIN
</Button>
```

### Accordion `defaultExpandedIds` + `v-model:expandedIds`

React is either uncontrolled (`defaultExpandedIds`) or controlled (`expandedIds` + `onExpandedChange`). Vue uses `v-model:expandedIds` for control:

```vue
<Accordion :items="items" v-model:expandedIds="expandedIds" />
```

### Boolean props — pass as `false` is legal

Unlike some Vue libraries, Cathode-Vue correctly distinguishes "prop not passed" from "prop explicitly false" for `open`-style props. Controlled `<Popover :open="false" @update:open="…" />` behaves the way you expect.

### AI composables instead of hooks

`useAiSuggest`, `useAiChat`, `useAiAction` are Vue composables returning reactive refs (not `[value, setter]` tuples):

```ts
const { suggestion, accept } = useAiSuggest(prefixRef, { enabled: enabledRef });
const { messages, send, streaming } = useAiChat();
```

## Setup

```ts
// main.ts
import { createApp } from 'vue';
import App from './App.vue';

import '@cathode-ui/vue/tokens.css';   // CSS variables + dark/light
import '@cathode-ui/vue/fonts.css';    // JetBrains Mono (optional)
import '@cathode-ui/vue/styles.css';   // compiled component rules

createApp(App).mount('#app');
```

```vue
<!-- App.vue -->
<script setup lang="ts">
import { ref } from 'vue';
import {
  CathodeProvider, TerminalFrame, Stack, Button,
  Toggle, Counter, DotLeader, PulsingDot,
} from '@cathode-ui/vue';

const armed = ref(false);
const wpm   = ref(12);
</script>

<template>
  <CathodeProvider theme="dark" motion="strong">
    <TerminalFrame title="TELEMETRY" accent="info">
      <Stack :gap="8">
        <Stack direction="row" :gap="8" align="center">
          <PulsingDot color="var(--cathode-color-success)" />
          <span>LIVE</span>
        </Stack>
        <DotLeader label="LATENCY" value="42 MS" />
        <DotLeader label="STATE"   value="HEALTHY" />
        <Toggle  v-model="armed" label="ARMED" accent="danger" />
        <Counter v-model="wpm"   :min="5" :max="40" label="WPM" />
        <Button  variant="primary" @click="onSave">SAVE</Button>
      </Stack>
    </TerminalFrame>
  </CathodeProvider>
</template>
```

`<CathodeProvider>` accepts: `theme` (`auto` / `dark` / `light`), `motion` (`none` / `subtle` / `strong`), `haptic` (bool), `sound` (bool — default off), `ai` (a `CathodeAIProvider` instance).

## Quick taste

```vue
<script setup lang="ts">
import { ref } from 'vue';
import {
  TerminalFrame, DotLeader, Button,
  TextField, FormField,
  Dialog, Chat,
} from '@cathode-ui/vue';

const callsign = ref('KA4X');
const open = ref(false);
</script>

<template>
  <TerminalFrame title="TELEMETRY" accent="info">
    <DotLeader label="LATENCY" value="42 MS" />
    <DotLeader label="STATE"   value="LIVE" valueColor="var(--cathode-color-success)" />
  </TerminalFrame>

  <FormField label="CALLSIGN" hint="4 characters, alphanumeric." required>
    <TextField v-model="callsign" />
  </FormField>

  <Button variant="primary" @click="open = true">SAVE</Button>

  <Dialog :open="open" title="SAVED" @close="open = false">
    <p>Callsign {{ callsign }} registered.</p>
  </Dialog>
</template>
```

## Author

Built by **[Madhan Raj](https://www.linkedin.com/in/cyphermadhan/)**.

## License

MIT.
