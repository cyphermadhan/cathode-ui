#!/usr/bin/env node
/**
 * Cathode UI — Model Context Protocol server.
 *
 * Exposes five tools over stdio so AI coding agents (Claude Code,
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
 *   - cathode_list_components({framework?})         → name + summary + adapter import per component
 *   - cathode_get_component({name, framework?})     → full spec for the target framework
 *   - cathode_get_tokens({theme?})                  → resolved color set + type/spacing/etc
 *   - cathode_search({query, framework?})           → substring match across names+summaries
 *   - cathode_suggest_component({intent, framework?}) → ranked list of primitives matching a
 *                                                      free-form "what should I use for X?"
 *                                                      question, leveraging each component's
 *                                                      `whenToUse` + `vs` fields
 *
 * `framework` defaults to `"react"`. Valid values come from the
 * manifest's top-level `adapters` array; current ships include only
 * `"react"`. Phase 4 adds `"vue" | "svelte" | "solid"`; Phase 5 adds
 * `"compose"`. Old clients that don't pass `framework` see the same
 * output as 0.3.x — the flat `import` + `examples` on each component
 * are a React backwards-compat mirror.
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
  { name: 'cathode-ui', version: '0.4.0' },
  { capabilities: { tools: {} } }
);

/** Default adapter when the caller doesn't specify a `framework`. */
const DEFAULT_FRAMEWORK = 'react';

/**
 * Resolve the adapter view for a component given the requested
 * framework. Returns `{ import, examples }` from `component.adapters[framework]`
 * if present, else from the flat `component.import` + `component.examples`
 * (the React backwards-compat mirror). If the framework is listed in
 * the manifest's top-level `adapters` but this specific component
 * doesn't have an entry, still fall through to the flat fields — some
 * adapters may document N-1 components.
 */
function resolveAdapter(component: any, framework: string) {
  const adapter = component?.adapters?.[framework];
  if (adapter && adapter.import && adapter.examples) {
    return { import: adapter.import, examples: adapter.examples };
  }
  return {
    import: component.import,
    examples: component.examples,
    fallbackFrom: framework === DEFAULT_FRAMEWORK ? undefined : 'react',
  };
}

/** Normalize + validate the `framework` arg. Returns the default and a
 *  warning note if the requested framework isn't shipped in this
 *  manifest — the caller can surface it in the response. */
function resolveFramework(manifest: any, raw: unknown): { framework: string; warning?: string } {
  const requested = typeof raw === 'string' && raw.length > 0 ? raw.toLowerCase() : DEFAULT_FRAMEWORK;
  const supported: string[] = Array.isArray(manifest.adapters) ? manifest.adapters : [DEFAULT_FRAMEWORK];
  if (!supported.includes(requested)) {
    return {
      framework: DEFAULT_FRAMEWORK,
      warning: `Framework "${requested}" is not shipped in this manifest (supported: ${supported.join(', ')}). Falling back to "${DEFAULT_FRAMEWORK}".`,
    };
  }
  return { framework: requested };
}

const FRAMEWORK_PROP = {
  type: 'string' as const,
  description:
    'Target framework adapter ("react" | "vue" | "svelte" | "solid" | "compose"). Determines which `import` and `examples` shape the response uses. Defaults to "react". If the manifest doesn\'t ship the requested adapter, the server falls back to the React adapter and includes a warning.',
};

server.setRequestHandler(ListToolsRequestSchema, async () => ({
  tools: [
    {
      name: 'cathode_list_components',
      description:
        'Returns every Cathode UI component with a one-line summary and its framework-specific import line. Use this to discover what primitives exist before composing UI.',
      inputSchema: {
        type: 'object',
        properties: { framework: FRAMEWORK_PROP },
        additionalProperties: false,
      },
    },
    {
      name: 'cathode_get_component',
      description:
        'Returns the full spec for a named component — props, motion states, a11y notes, and framework-specific import + examples. Call after cathode_list_components.',
      inputSchema: {
        type: 'object',
        properties: {
          name:      { type: 'string', description: 'Component name (case-sensitive, e.g. "Pill", "TerminalFrame").' },
          framework: FRAMEWORK_PROP,
        },
        required: ['name'],
      },
    },
    {
      name: 'cathode_get_tokens',
      description:
        'Returns the resolved color set for a theme plus the theme-independent type/spacing/size/motion/sound/haptic tokens. Framework-independent — tokens are the same across every adapter.',
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
          query:     { type: 'string', description: 'Free-text query, e.g. "level meter" or "notification".' },
          framework: FRAMEWORK_PROP,
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
          intent:    { type: 'string', description: 'One-sentence description of what the UI needs to accomplish.' },
          limit:     { type: 'number', description: 'Max number of suggestions to return. Default 5.' },
          framework: FRAMEWORK_PROP,
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
        const { framework, warning } = resolveFramework(manifest, args.framework);
        const items = manifest.components.map((c: any) => {
          const a = resolveAdapter(c, framework);
          return {
            name: c.name,
            summary: c.summary,
            import: a.import,
          };
        });
        const payload: Record<string, unknown> = { framework, components: items };
        if (warning) payload.warning = warning;
        return { content: [{ type: 'text', text: JSON.stringify(payload, null, 2) }] };
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
        const { framework, warning } = resolveFramework(manifest, args.framework);
        const a = resolveAdapter(match, framework);
        // Shape the response so `import` + `examples` reflect the
        // requested framework. Keep every framework-agnostic field
        // (props, whenToUse, vs, a11y, feedback, motionStates) intact.
        const { adapters: _a, import: _i, examples: _e, ...agnostic } = match;
        const payload: Record<string, unknown> = {
          framework,
          component: { ...agnostic, import: a.import, examples: a.examples },
        };
        if (a.fallbackFrom) {
          payload.note = `Component "${match.name}" doesn't define an adapter for "${framework}"; returning the "${a.fallbackFrom}" adapter instead.`;
        }
        if (warning) payload.warning = warning;
        return { content: [{ type: 'text', text: JSON.stringify(payload, null, 2) }] };
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
        const { framework, warning } = resolveFramework(manifest, args.framework);
        // Cheap substring match across name + summary. The corpus is
        // small enough (<50 components) that real fuzzy matching is
        // overkill; substring covers 95% of the intent.
        const hits = manifest.components
          .filter((c: any) => (c.name + ' ' + c.summary).toLowerCase().includes(q))
          .map((c: any) => {
            const a = resolveAdapter(c, framework);
            return { name: c.name, summary: c.summary, import: a.import };
          });
        const payload: Record<string, unknown> = { framework, query: q, hits };
        if (warning) payload.warning = warning;
        return { content: [{ type: 'text', text: JSON.stringify(payload, null, 2) }] };
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

        const { framework, warning } = resolveFramework(manifest, args.framework);
        const hits = scored
          .filter((s: any) => s.score > 0)
          .sort((a: any, b: any) => b.score - a.score)
          .slice(0, limit)
          .map((s: any) => {
            const a = resolveAdapter(s.component, framework);
            return {
              name: s.component.name,
              score: s.score,
              matchedTokens: s.matchedTokens,
              whenToUse: s.component.whenToUse,
              summary: s.component.summary,
              import: a.import,
              // Include vs entries so the agent sees the disambiguation
              // context without a follow-up cathode_get_component call.
              vs: s.component.vs ?? [],
            };
          });

        const payload: Record<string, unknown> = {
          framework,
          intent,
          intentTokens,
          suggestions: hits,
          note: hits.length === 0
            ? 'No component matched any intent token. Call cathode_list_components to browse the full set.'
            : 'Results ranked by keyword overlap against name/summary/whenToUse/vs. Check each `vs` entry to disambiguate near matches.',
        };
        if (warning) payload.warning = warning;
        return { content: [{ type: 'text', text: JSON.stringify(payload, null, 2) }] };
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
