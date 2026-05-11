import { defineConfig } from 'astro/config';
import react from '@astrojs/react';
import mdx from '@astrojs/mdx';

// https://astro.build/config
export default defineConfig({
  // Deploy target is GitHub Pages project path:
  //   https://cyphermadhan.github.io/cathode-ui/
  // `site` is the canonical origin (used for sitemap URLs + absolute
  // href resolution); `base` is the path prefix every page sits under.
  // Override CATHODE_SITE_BASE at build time for a custom domain.
  site: process.env.CATHODE_SITE ?? 'https://cyphermadhan.github.io',
  base: process.env.CATHODE_SITE_BASE ?? '/cathode-ui',
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
