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
 * Four tools:
 *   - cathode_list_components()     → name + summary for every component
 *   - cathode_get_component(name)   → full spec (props, a11y, examples, …)
 *   - cathode_get_tokens(theme?)    → resolved color set + type/spacing/etc
 *   - cathode_search(query)         → fuzzy match against descriptions
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
// `dist/` is two levels down from repo root (packages/mcp-server/dist/).
const ROOT = resolve(__dirname, '../../..');

function readJSON(rel: string): any {
  return JSON.parse(readFileSync(resolve(ROOT, rel), 'utf8'));
}

function loadManifest() { return readJSON('cathode.manifest.json'); }
function loadTokens()   { return readJSON('tokens/tokens.json');    }

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
        'Fuzzy match a query against component names and summaries. Use when you have intent ("something that shows status", "level meter") but not a component name.',
      inputSchema: {
        type: 'object',
        properties: {
          query: { type: 'string', description: 'Free-text query, e.g. "level meter" or "notification".' },
        },
        required: ['query'],
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
        // small enough (<20 components) that real fuzzy matching is
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
