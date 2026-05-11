# @cathode-ui/mcp

Model Context Protocol server for [Cathode UI](https://github.com/cyphermadhan/cathode-ui).
Lets AI coding agents (Claude Code, Cursor, Copilot) discover and query
the 45-primitive Cathode design system without scraping React source.

## Install

Via npx (no install):

```json
{
  "mcpServers": {
    "cathode-ui": {
      "command": "npx",
      "args": ["-y", "@cathode-ui/mcp"]
    }
  }
}
```

Put that in your `.mcp.json` (Claude Code) or `.cursor/mcp.json` (Cursor).

## Tools

Five tools over stdio:

| Tool | Use |
|---|---|
| `cathode_list_components()` | Every component with a one-line summary. Discovery. |
| `cathode_get_component(name)` | Full spec for a named component — props, `whenToUse`, `vs` disambiguation, examples, a11y, feedback. |
| `cathode_get_tokens(theme?)` | Resolved color set for a theme + theme-independent tokens. |
| `cathode_search(query)` | Substring keyword match across names + summaries. |
| `cathode_suggest_component(intent)` | Natural-language intent → ranked components. Uses the manifest's `whenToUse` + `vs` fields with a weighted bag-of-words scorer. Call this when you know WHAT the user wants to do but not which component to use. |

## Example session

```
> cathode_suggest_component("show a confirmation before deleting")

suggestions: [
  { name: "Dialog", score: 3, whenToUse: "Block the UI until the user confirms…" },
  { name: "Toast",  score: 1, whenToUse: "Surface a short transient status…" },
  { name: "Loader", score: 1, whenToUse: "…"  }
]

> cathode_get_component("Dialog")

{ name: "Dialog",
  import: "import { Dialog } from '@cathode-ui/react';",
  whenToUse: "Block the UI until the user confirms, chooses, or dismisses…",
  vs: [{ component: "Drawer", picker: "Dialog for centered modal focus; Drawer for edge panel…" }, …],
  props: [{ name: "open", type: "boolean", required: true }, …],
  examples: [{ name: "confirm", snippet: "<Dialog open={…}>…" }, …],
  … }
```

## License

MIT.
