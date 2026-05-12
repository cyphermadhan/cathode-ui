#!/usr/bin/env node
// Copy the repo-root agent-facing docs into packages/react/ so they
// travel with the published tarball. After `npm install @cathode-ui/react`,
// AI coding agents find these files at predictable paths:
//
//   node_modules/@cathode-ui/react/CATHODE.md
//   node_modules/@cathode-ui/react/cathode.manifest.json
//
// The package README points agents at these files, so the zero-config
// onboarding flow is: install the package → AI reads README → AI reads
// CATHODE.md + manifest → AI has full structured context. No MCP
// required, works in every AI tool that can read files.
//
// The copies are gitignored (single source of truth = repo root) and
// refreshed by `prepublishOnly` before every publish, so they never go
// stale in the tarball.

import { copyFileSync, existsSync } from 'node:fs';
import { fileURLToPath } from 'node:url';
import { dirname, resolve } from 'node:path';

const __dirname = dirname(fileURLToPath(import.meta.url));
const PKG  = resolve(__dirname, '..');
const ROOT = resolve(PKG, '../..');

function copy(fromName, toName = fromName) {
  const src = resolve(ROOT, fromName);
  if (!existsSync(src)) {
    console.error(`missing ${src} — run \`npm run gen\` at the monorepo root first`);
    process.exit(1);
  }
  const dest = resolve(PKG, toName);
  copyFileSync(src, dest);
  console.log(`bundled ${fromName} → packages/react/${toName}`);
}

copy('CATHODE.md');
copy('cathode.manifest.json');
