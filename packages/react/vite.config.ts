import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import dts from 'vite-plugin-dts';
import { resolve } from 'node:path';

export default defineConfig({
  plugins: [
    react(),
    dts({
      include: ['src'],
      exclude: ['src/**/*.stories.tsx', 'src/**/*.test.ts', 'src/**/*.test.tsx'],
      tsconfigPath: './tsconfig.json',
    }),
  ],
  build: {
    lib: {
      entry: {
        index: resolve(__dirname, 'src/index.ts'),
        icons: resolve(__dirname, 'src/icons.ts'),
      },
      formats: ['es', 'cjs'],
      fileName: (format, entryName) => `${entryName}.${format === 'cjs' ? 'cjs' : 'js'}`,
    },
    rollupOptions: {
      // These are provided by the consumer app. Don't bundle them —
      // keeps @cathode-ui/react small and avoids React-dup warnings.
      external: ['react', 'react-dom', 'react/jsx-runtime', 'framer-motion', '@phosphor-icons/react'],
      output: {
        // Prepend the React Server Components `"use client"` directive
        // to every output chunk. Rollup strips top-level directives
        // from source files during bundling, so we reassert it here to
        // guarantee the built package is a client boundary for
        // Next.js App Router / Remix / React Router 7 RSC compilers.
        // Source files still carry the directive for IDE + linter
        // awareness; duplicates are harmless (directives dedupe at
        // parse time).
        banner: `'use client';`,
      },
    },
    sourcemap: true,
    target: 'es2022',
  },
});
