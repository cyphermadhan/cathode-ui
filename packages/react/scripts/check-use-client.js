#!/usr/bin/env node
// Build-time guard: every JS output chunk MUST begin with the
// `"use client";` directive so @cathode-ui/react can be imported from
// Next.js App Router / Remix / React Router 7 Server Components
// without tripping the "cannot use hooks" compiler error.
//
// Rollup strips top-level directives from source during bundling, so
// vite.config.ts reasserts the banner via rollupOptions.output.banner.
// This script verifies the banner actually landed — if it didn't,
// the package is quietly RSC-broken and we fail the build.

import { readFileSync, existsSync } from 'node:fs';
import { fileURLToPath } from 'node:url';
import { dirname, resolve } from 'node:path';

const __dirname = dirname(fileURLToPath(import.meta.url));
const DIST = resolve(__dirname, '..', 'dist');
const ENTRIES = ['index.js', 'index.cjs', 'icons.js', 'icons.cjs'];
const DIRECTIVE = /^(['"])use client\1;?/;

let failed = false;

for (const file of ENTRIES) {
  const path = resolve(DIST, file);
  if (!existsSync(path)) {
    console.error(`✗ ${file} — missing (did the build run?)`);
    failed = true;
    continue;
  }
  const first = readFileSync(path, 'utf8').split(/\r?\n/, 1)[0];
  if (!DIRECTIVE.test(first)) {
    console.error(`✗ ${file} — missing "use client" directive on line 1`);
    console.error(`    got: ${first.slice(0, 80)}`);
    failed = true;
  } else {
    console.log(`✓ ${file} — "use client" present`);
  }
}

if (failed) {
  console.error('');
  console.error('One or more dist entries are missing the "use client" directive.');
  console.error('This breaks @cathode-ui/react in Next.js App Router consumers.');
  console.error('Fix: ensure rollupOptions.output.banner is set in vite.config.ts.');
  process.exit(1);
}
