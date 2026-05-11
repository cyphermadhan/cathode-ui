# Cathode UI

Retro-future design system. Terminal aesthetics, pixel shapes, mono type,
with motion, haptics, sound, and AI-native surfaces baked in.

## Status

**v0.3.0** — 45 React primitives, docs site, companion Figma library,
MCP server for AI agents, full a11y gate.

Not yet shipped: npm publish, Swift package.

See [`plan.md`](./plan.md) for the design brief and
[`implemented.md`](./implemented.md) for the running shipped state.

## Repo layout

```
tokens/           — single source of truth (tokens.json)
scripts/          — code generators (CSS, manifest, AI docs)
packages/
  react/          — @cathode-ui/react
  mcp-server/     — @cathode-ui/mcp (AI-agent tool surface)
site/             — docs (Astro)
```

## License

MIT.
