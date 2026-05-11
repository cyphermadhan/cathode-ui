#!/usr/bin/env node
// Copy cathode.manifest.json + tokens/tokens.json from the monorepo
// root into packages/mcp-server/dist/ so they travel with the
// published tarball. server.ts reads from dist/ at runtime.
//
// Also chmod +x the compiled server entry so `npx @cathode-ui/mcp`
// works out of the box on unix.

import { copyFileSync, chmodSync, existsSync } from 'node:fs';
import { fileURLToPath } from 'node:url';
import { dirname, resolve } from 'node:path';

const __dirname = dirname(fileURLToPath(import.meta.url));
const PKG  = resolve(__dirname, '..');
const DIST = resolve(PKG, 'dist');
const ROOT = resolve(PKG, '../..');

function copy(from, toName) {
  const src = resolve(ROOT, from);
  if (!existsSync(src)) {
    console.error(`missing ${src} — run \`npm run gen\` at the monorepo root first`);
    process.exit(1);
  }
  const dest = resolve(DIST, toName);
  copyFileSync(src, dest);
  console.log(`bundled ${from} → dist/${toName}`);
}

copy('cathode.manifest.json', 'cathode.manifest.json');
copy('tokens/tokens.json',    'tokens.json');

// Make the server entry executable so `cathode-mcp` bin works.
try {
  chmodSync(resolve(DIST, 'server.js'), 0o755);
} catch { /* Windows → no-op */ }
