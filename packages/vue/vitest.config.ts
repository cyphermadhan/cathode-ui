import { defineConfig } from 'vitest/config';
import vue from '@vitejs/plugin-vue';

export default defineConfig({
  plugins: [vue()],
  test: {
    environment: 'happy-dom',
    globals: false,
    // Tests live alongside src so .vue imports resolve relatively; no
    // barrel usage here by design — we want each test to exercise one
    // component in isolation.
    include: ['tests/**/*.test.ts'],
  },
});
