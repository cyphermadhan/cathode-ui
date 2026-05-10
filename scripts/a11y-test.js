#!/usr/bin/env node
/**
 * axe-core a11y check over the built docs site.
 *
 * Pipeline: build site → `astro preview` on 127.0.0.1:4321 → for every
 * documented component, open its detail page, wait for the React
 * island to hydrate, run axe. Group violations by page, print a
 * summary, exit non-zero if any serious/critical violations hit.
 *
 * We treat 'minor' and 'moderate' violations as warnings (printed but
 * non-blocking) because the design system's monospace/terminal look
 * triggers contrast heuristics that aren't true a11y failures for
 * a retro-aesthetic preview surface.
 */
import { chromium } from 'playwright';
import { AxeBuilder } from '@axe-core/playwright';
import { spawn } from 'node:child_process';
import { readFileSync } from 'node:fs';
import { fileURLToPath } from 'node:url';
import { dirname, resolve } from 'node:path';

const __dirname = dirname(fileURLToPath(import.meta.url));
const repoRoot = resolve(__dirname, '..');
const manifest = JSON.parse(
  readFileSync(resolve(repoRoot, 'cathode.manifest.json'), 'utf8'),
);

const BASE = 'http://127.0.0.1:4321';
const PAGES = [
  { path: '/',                 name: 'Home' },
  { path: '/getting-started',  name: 'Getting Started' },
  { path: '/tokens',           name: 'Tokens' },
  { path: '/components',       name: 'Components index' },
  { path: '/ai',               name: 'AI providers' },
  { path: '/mcp',              name: 'MCP server' },
  ...manifest.components.map((c) => ({
    path: `/components/${c.name.toLowerCase()}`,
    name: c.name,
  })),
];

const BLOCKING_IMPACT = new Set(['serious', 'critical']);

async function waitForServer(url, timeoutMs = 30_000) {
  const start = Date.now();
  while (Date.now() - start < timeoutMs) {
    try {
      const res = await fetch(url);
      if (res.ok) return;
    } catch {
      /* not up yet */
    }
    await new Promise((r) => setTimeout(r, 250));
  }
  throw new Error(`server at ${url} did not start within ${timeoutMs}ms`);
}

function startPreview() {
  const proc = spawn('npm', ['run', 'preview', '-w', '@cathode-ui/site', '--', '--host', '127.0.0.1'], {
    cwd: repoRoot,
    stdio: ['ignore', 'pipe', 'pipe'],
    env: { ...process.env, FORCE_COLOR: '0' },
  });
  proc.stdout?.on('data', () => {});
  proc.stderr?.on('data', () => {});
  return proc;
}

function formatViolation(v) {
  const nodes = v.nodes
    .slice(0, 3)
    .map((n) => `     └─ ${n.target.join(' ')}`)
    .join('\n');
  const more = v.nodes.length > 3 ? `\n     └─ (+${v.nodes.length - 3} more)` : '';
  return `  [${v.impact}] ${v.id}: ${v.help}\n${nodes}${more}`;
}

async function main() {
  console.log('building site…');
  const build = spawn('npm', ['run', 'build', '-w', '@cathode-ui/site'], {
    cwd: repoRoot,
    stdio: 'inherit',
  });
  await new Promise((res, rej) => {
    build.on('exit', (code) => (code === 0 ? res() : rej(new Error(`build failed (${code})`))));
  });

  console.log('starting preview…');
  const preview = startPreview();
  let browser;
  try {
    await waitForServer(BASE + '/');
    browser = await chromium.launch();
    const context = await browser.newContext();
    const page = await context.newPage();

    let blockingViolations = 0;
    let warningViolations = 0;
    const perPageReport = [];

    for (const entry of PAGES) {
      await page.goto(BASE + entry.path, { waitUntil: 'networkidle' });
      // Let React islands settle. `client:only` components render async.
      await page.waitForTimeout(300);

      const results = await new AxeBuilder({ page })
        .withTags(['wcag2a', 'wcag2aa', 'wcag21a', 'wcag21aa'])
        .analyze();

      const violations = results.violations;
      const blocking = violations.filter((v) => BLOCKING_IMPACT.has(v.impact));
      const warnings = violations.filter((v) => !BLOCKING_IMPACT.has(v.impact));
      blockingViolations += blocking.length;
      warningViolations += warnings.length;

      const marker = blocking.length ? '✗' : warnings.length ? '!' : '✓';
      perPageReport.push({ entry, violations, marker });
      console.log(`${marker} ${entry.name.padEnd(22)} ${entry.path}`);
      for (const v of violations) console.log(formatViolation(v));
    }

    console.log('\n—');
    console.log(`${PAGES.length} pages scanned`);
    console.log(`${blockingViolations} blocking (serious/critical)`);
    console.log(`${warningViolations} warning (minor/moderate)`);

    await browser.close();
    preview.kill('SIGTERM');
    process.exit(blockingViolations > 0 ? 1 : 0);
  } catch (err) {
    if (browser) await browser.close().catch(() => {});
    preview.kill('SIGTERM');
    throw err;
  }
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
