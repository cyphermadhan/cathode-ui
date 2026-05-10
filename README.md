# Cathode UI

Retro-future design system. Terminal aesthetics, pixel shapes, mono type,
with motion, haptics, sound, and AI-native surfaces baked in.

Lifted from [Klick](https://github.com/cyphermadhan/Klick)'s UI layer, now
standalone and multi-platform.

## Status

**Phase 1: in progress.** React package + AI infrastructure.

Phases 2–4 (Figma kit, docs site, Swift package, other frameworks) land
after Phase 1 ships.

See `/Users/mraj/.claude/plans/lucky-riding-valley.md` for the full plan
(local reference; not yet published).

## Repo layout

```
tokens/           — single source of truth (tokens.json)
scripts/          — code generators (CSS, Swift, manifest)
packages/
  react/          — @cathode-ui/react (Phase 1)
  mcp-server/     — @cathode-ui/mcp (AI-agent tool surface)
  swift/          — Phase 3
figma/            — Phase 2
site/             — docs (Astro, Phase 2)
```

## License

MIT.
