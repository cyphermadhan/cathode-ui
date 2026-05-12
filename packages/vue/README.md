# @cathode-ui/vue

Retro-future **Vue 3** design system. Sibling of [`@cathode-ui/react`](https://www.npmjs.com/package/@cathode-ui/react). Same 45-primitive manifest, same tokens, same motion/haptic/sound philosophy — framework-idiomatic Vue components (`<script setup>` + `<template>` SFCs).

By [Madhan Raj](https://www.linkedin.com/in/cyphermadhan/).

**[Docs →](https://cyphermadhan.github.io/cathode-ui/)** · **[React package →](https://www.npmjs.com/package/@cathode-ui/react)**

---

> ## ⚠️ Work in progress — Phase 4b
>
> This package ships **3 of the 45 primitives** today:
> `Button`, `Stack`, `TerminalFrame`. The remaining 42 — every form
> primitive, overlay, feedback, navigation, data display, and retro
> accent — are being ported session-by-session. Follow the repo's
> `implemented.md` for live progress.
>
> The tokens, manifest, and MCP server are already multi-framework,
> so AI coding agents that query `@cathode-ui/mcp` with
> `framework: "vue"` will get Vue-specific imports and examples for
> shipped components and a clear "React fallback — Vue port pending"
> note for the rest. Use that to gauge what's safe to lean on today.
>
> API surface for shipped components matches `@cathode-ui/react`
> except for the feedback/AI props (haptic, sound, `ai={{...}}`) —
> those port in Phase 4b session 2.

---

## Install

```bash
npm install @cathode-ui/vue
```

Peer dep: `vue >= 3.3`.

## Setup

```ts
// app entry (main.ts)
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
import { CathodeProvider, TerminalFrame, Stack, Button } from '@cathode-ui/vue';
</script>

<template>
  <CathodeProvider theme="dark" motion="strong">
    <TerminalFrame title="STATUS">
      <Stack :gap="8">
        <Button variant="primary" @click="onSave">SAVE</Button>
        <Button variant="danger"  @click="onDelete">DELETE</Button>
      </Stack>
    </TerminalFrame>
  </CathodeProvider>
</template>
```

`<CathodeProvider>` accepts: `theme` (`auto` / `dark` / `light`), `motion` (`none` / `subtle` / `strong`), `haptic` (bool, reserved), `sound` (bool, reserved).

## What's shipped today

| Component | Status | Notes |
|---|---|---|
| `Button` | ✅ | Variants `default` / `primary` / `danger`. Motion-intensity press scale via CSS transitions. `haptic` + `sound` + `ai` props port in session 2. |
| `Stack` | ✅ | Full parity with the React `Stack` API — same prop names, same defaults. |
| `TerminalFrame` | ✅ | Full parity. |
| `CathodeProvider` | ✅ (partial) | Theme + motion implemented. Haptic / sound / AI provider plumbing coming in session 2. |

The other 42 primitives live in [`@cathode-ui/react`](https://www.npmjs.com/package/@cathode-ui/react) today; you can import them from there if you need them in a Vue app via an interop wrapper, but that defeats the purpose — wait for the Vue port, or open an issue to prioritize a specific primitive.

## Author

Built by **[Madhan Raj](https://www.linkedin.com/in/cyphermadhan/)**.

## License

MIT.
