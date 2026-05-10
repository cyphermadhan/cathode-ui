import { defineConfig } from 'astro/config';
import react from '@astrojs/react';
import mdx from '@astrojs/mdx';

// https://astro.build/config
export default defineConfig({
  integrations: [react(), mdx()],
  // Vite tweaks: `@cathode-ui/react` publishes ESM only. We keep
  // framer-motion as a non-external dep so Vite bundles it into the
  // docs output (not ideal for a prod design-system site, but fine
  // for the preview.)
  vite: {
    ssr: {
      noExternal: ['@cathode-ui/react', 'framer-motion', '@phosphor-icons/react'],
    },
  },
});
