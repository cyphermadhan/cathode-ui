#!/usr/bin/env node
/**
 * Cathode UI — Model Context Protocol server.
 *
 * Exposes four tools over stdio so AI coding agents (Claude Code,
 * Cursor, etc.) can discover and query the Cathode design system
 * without scraping source. The server reads `cathode.manifest.json`
 * and `tokens/tokens.json` from the repo; no network calls, no state.
 *
 * Register in `.mcp.json`:
 *   {
 *     "mcpServers": {
 *       "cathode-ui": { "command": "npx", "args": ["-y", "@cathode-ui/mcp"] }
 *     }
 *   }
 *
 * Five tools:
 *   - cathode_list_components()        → name + summary for every component
 *   - cathode_get_component(name)      → full spec (props, a11y, examples, …)
 *   - cathode_get_tokens(theme?)       → resolved color set + type/spacing/etc
 *   - cathode_search(query)            → substring match across names+summaries
 *   - cathode_suggest_component(intent)→ ranked list of primitives matching a
 *                                        free-form "what should I use for X?"
 *                                        question, leveraging each component's
 *                                        `whenToUse` + `vs` fields
 */

import { readFileSync } from 'node:fs';
import { fileURLToPath } from 'node:url';
import { dirname, resolve } from 'node:path';
import { Server } from '@modelcontextprotocol/sdk/server/index.js';
import { StdioServerTransport } from '@modelcontextprotocol/sdk/server/stdio.js';
import {
  CallToolRequestSchema,
  ListToolsRequestSchema,
} from '@modelcontextprotocol/sdk/types.js';

const __dirname = dirname(fileURLToPath(import.meta.url));

// Manifest + tokens need to be readable when the package is installed
// from npm (node_modules/@cathode-ui/mcp/…), NOT just from the monorepo.
// We ship both files alongside the compiled server in dist/ via the
// build script. Fall back to the monorepo paths when running from
// source so `npm start` in the workspace still works.
const LOCAL_MANIFEST = resolve(__dirname, 'cathode.manifest.json');
const LOCAL_TOKENS   = resolve(__dirname, 'tokens.json');
const MONOREPO_ROOT  = resolve(__dirname, '../../..');

function readJSONIfExists(path: string): any | null {
  try { return JSON.parse(readFileSync(path, 'utf8')); }
  catch { return null; }
}

function loadManifest(): any {
  return (
    readJSONIfExists(LOCAL_MANIFEST) ??
    readJSONIfExists(resolve(MONOREPO_ROOT, 'cathode.manifest.json')) ??
    (() => { throw new Error('cathode.manifest.json not found — is the package properly installed?'); })()
  );
}
function loadTokens(): any {
  return (
    readJSONIfExists(LOCAL_TOKENS) ??
    readJSONIfExists(resolve(MONOREPO_ROOT, 'tokens/tokens.json')) ??
    (() => { throw new Error('tokens.json not found — is the package properly installed?'); })()
  );
}

const server = new Server(
  { name: 'cathode-ui', version: '0.1.0' },
  { capabilities: { tools: {} } }
);

server.setRequestHandler(ListToolsRequestSchema, async () => ({
  tools: [
    {
      name: 'cathode_list_components',
      description:
        'Returns every Cathode UI component with a one-line summary. Use this to discover what primitives exist before composing UI.',
      inputSchema: { type: 'object', properties: {}, additionalProperties: false },
    },
    {
      name: 'cathode_get_component',
      description:
        'Returns the full spec for a named component: props, types, motion states, a11y notes, and usage examples. Call after cathode_list_components.',
      inputSchema: {
        type: 'object',
        properties: {
          name: { type: 'string', description: 'Component name (case-sensitive, e.g. "Pill", "TerminalFrame").' },
        },
        required: ['name'],
      },
    },
    {
      name: 'cathode_get_tokens',
      description:
        'Returns the resolved color set for a theme plus the theme-independent type/spacing/size/motion/sound/haptic tokens.',
      inputSchema: {
        type: 'object',
        properties: {
          theme: { type: 'string', enum: ['dark', 'light'], description: 'Which color set to return. Defaults to dark.' },
        },
      },
    },
    {
      name: 'cathode_search',
      description:
        'Substring match a query against component names and summaries. Use when you recognize keywords from a component ("level meter", "dialog", "avatar"). For natural-language intent ("I want to show a confirmation before deleting"), prefer cathode_suggest_component.',
      inputSchema: {
        type: 'object',
        properties: {
          query: { type: 'string', description: 'Free-text query, e.g. "level meter" or "notification".' },
        },
        required: ['query'],
      },
    },
    {
      name: 'cathode_suggest_component',
      description:
        'Given free-form intent ("I need to show a confirmation before deleting", "let the user pick one of three options"), return a ranked list of Cathode primitives with reasons. Uses each component\'s `whenToUse` + `vs` fields for matching. Call this when you know WHAT the user wants to do but not which component to use.',
      inputSchema: {
        type: 'object',
        properties: {
          intent: { type: 'string', description: 'One-sentence description of what the UI needs to accomplish.' },
          limit:  { type: 'number', description: 'Max number of suggestions to return. Default 5.' },
        },
        required: ['intent'],
      },
    },
  ],
}));

server.setRequestHandler(CallToolRequestSchema, async (req) => {
  const name = req.params.name;
  const args = (req.params.arguments ?? {}) as Record<string, unknown>;

  try {
    switch (name) {
      case 'cathode_list_components': {
        const manifest = loadManifest();
        const items = manifest.components.map((c: any) => ({
          name: c.name,
          summary: c.summary,
        }));
        return { content: [{ type: 'text', text: JSON.stringify(items, null, 2) }] };
      }

      case 'cathode_get_component': {
        const manifest = loadManifest();
        const target = String(args.name ?? '');
        const match = manifest.components.find((c: any) => c.name === target);
        if (!match) {
          return {
            isError: true,
            content: [{ type: 'text', text: `No component named "${target}". Call cathode_list_components for the full list.` }],
          };
        }
        return { content: [{ type: 'text', text: JSON.stringify(match, null, 2) }] };
      }

      case 'cathode_get_tokens': {
        const tokens = loadTokens();
        const theme = args.theme === 'light' ? 'light' : 'dark';
        const payload = {
          theme,
          color: tokens.color[theme],
          type: tokens.type,
          spacing: tokens.spacing,
          size: tokens.size,
          motion: tokens.motion,
          sound: tokens.sound,
          haptic: tokens.haptic,
          breakpoint: tokens.breakpoint,
        };
        return { content: [{ type: 'text', text: JSON.stringify(payload, null, 2) }] };
      }

      case 'cathode_search': {
        const manifest = loadManifest();
        const q = String(args.query ?? '').toLowerCase();
        // Cheap substring match across name + summary. The corpus is
        // small enough (<50 components) that real fuzzy matching is
        // overkill; substring covers 95% of the intent.
        const hits = manifest.components
          .map((c: any) => {
            const hay = (c.name + ' ' + c.summary).toLowerCase();
            const score = hay.includes(q) ? 1 : 0;
            return { ...c, __score: score };
          })
          .filter((c: any) => c.__score > 0)
          .map((c: any) => ({ name: c.name, summary: c.summary }));
        return {
          content: [{ type: 'text', text: JSON.stringify({ query: q, hits }, null, 2) }],
        };
      }

      case 'cathode_suggest_component': {
        const manifest = loadManifest();
        const intent = String(args.intent ?? '').toLowerCase().trim();
        const limit = typeof args.limit === 'number' ? Math.max(1, Math.min(20, args.limit)) : 5;
        if (!intent) {
          return {
            isError: true,
            content: [{ type: 'text', text: '`intent` must be a non-empty string.' }],
          };
        }

        // Tokenize the intent, drop stopwords, then score each
        // component by where the intent tokens land. Weighted so
        // curated `whenToUse` text and the component name outrank
        // generic summary boilerplate. The corpus is small (<50
        // components), so a cheap weighted bag-of-words scorer beats
        // a real embedding pipeline on latency + deployability.
        const STOP = new Set([
          // Articles, conjunctions, prepositions.
          'the','a','an','and','or','but','if','then','of','to','for','with','in','on','at','by','from','as','so',
          // Pronouns + possessives.
          'i','you','we','they','it','this','that','these','those',
          'my','your','our','their','its',
          // Auxiliary + modal verbs.
          'is','are','be','been','being','have','has','had','do','does','did','can','could','should','would','will',
          // Intent-phrasing words that carry no component signal.
          'want','wants','need','needs','use','uses','using','let','lets','when','how','what','where','which',
          'show','shows','showing','display','displays','displaying','render','renders','rendering',
          // Generic noun wrappers.
          'user','users','ui','component','components','thing','things','one','some','any','many',
          'someone','something','somebody',
        ]);
        const tokenize = (s: string) =>
          s.toLowerCase()
            .replace(/[^a-z0-9\s]/g, ' ')
            .split(/\s+/)
            .filter((t) => t.length > 2 && !STOP.has(t));

        const intentTokens = tokenize(intent);
        if (intentTokens.length === 0) {
          return {
            content: [{ type: 'text', text: JSON.stringify({
              intent,
              warning: 'Intent resolved to zero meaningful tokens after stopword removal. Try a more specific phrase.',
              suggestions: [],
            }, null, 2) }],
          };
        }

        const scored = manifest.components.map((c: any) => {
          // Separate the searchable text into tiers — the weight
          // reflects how curated the source is. `whenToUse` is the
          // canonical "should I use this?" phrase and outweighs the
          // prose `summary` or ambient mentions in `vs.*.picker`.
          const nameL      = c.name.toLowerCase();
          const whenToUseL = (c.whenToUse ?? '').toLowerCase();
          const summaryL   = (c.summary ?? '').toLowerCase();
          const vsL        = (c.vs ?? [])
            .map((d: any) => `${d.component} ${d.picker}`)
            .join(' ')
            .toLowerCase();

          let score = 0;
          const matchedTokens: string[] = [];
          for (const t of intentTokens) {
            let hit = false;
            if (nameL.includes(t))      { score += 4; hit = true; }
            if (whenToUseL.includes(t)) { score += 3; hit = true; }
            if (summaryL.includes(t))   { score += 1; hit = true; }
            if (vsL.includes(t))        { score += 1; hit = true; }
            if (hit) matchedTokens.push(t);
          }

          // Bonus: the intent names the component directly (decisive).
          if (intent.includes(nameL)) score += 10;

          return { component: c, score, matchedTokens };
        });

        const hits = scored
          .filter((s: any) => s.score > 0)
          .sort((a: any, b: any) => b.score - a.score)
          .slice(0, limit)
          .map((s: any) => ({
            name: s.component.name,
            score: s.score,
            matchedTokens: s.matchedTokens,
            whenToUse: s.component.whenToUse,
            summary: s.component.summary,
            import: s.component.import,
            // Include vs entries so the agent sees the disambiguation
            // context without a follow-up cathode_get_component call.
            vs: s.component.vs ?? [],
          }));

        return {
          content: [{ type: 'text', text: JSON.stringify({
            intent,
            intentTokens,
            suggestions: hits,
            note: hits.length === 0
              ? 'No component matched any intent token. Call cathode_list_components to browse the full set.'
              : 'Results ranked by keyword overlap against name/summary/whenToUse/vs. Check each `vs` entry to disambiguate near matches.',
          }, null, 2) }],
        };
      }

      default:
        return {
          isError: true,
          content: [{ type: 'text', text: `Unknown tool: ${name}` }],
        };
    }
  } catch (err) {
    return {
      isError: true,
      content: [{ type: 'text', text: `Tool error: ${err instanceof Error ? err.message : String(err)}` }],
    };
  }
});

const transport = new StdioServerTransport();
await server.connect(transport);
