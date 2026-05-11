# @cathode-ui/mcp

Model Context Protocol server for [Cathode UI](https://cyphermadhan.github.io/cathode-ui/) — a retro-future React design system with 45 primitives. This MCP lets AI coding agents (Claude Code, Cursor, Copilot, Codex, Windsurf) discover components, fetch props + usage, and get intent-ranked suggestions without scraping React source.

By [Madhan Raj](https://www.linkedin.com/in/cyphermadhan/).

**[Docs →](https://cyphermadhan.github.io/cathode-ui/)** · **[React package →](https://www.npmjs.com/package/@cathode-ui/react)**

## Install

The server runs locally over stdio, fetched on demand with `npx` — nothing to clone, nothing to keep up-to-date.

All snippets below install at **user scope** (configured once, available in every project).

### Claude Code

```bash
claude mcp add --scope user cathode-ui -- npx -y @cathode-ui/mcp
```

Writes to `~/.claude.json`. Verify with `claude mcp list`.

### Claude Desktop

Edit `~/Library/Application Support/Claude/claude_desktop_config.json` (macOS) or `%APPDATA%\Claude\claude_desktop_config.json` (Windows):

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

Restart Claude Desktop after saving.

### Cursor

Edit `~/.cursor/mcp.json` (create if missing):

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

Restart Cursor. Confirm under **Settings → MCP**.

### Windsurf

Edit `~/.codeium/windsurf/mcp_config.json` (create if missing):

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

Restart Windsurf.

### VS Code (GitHub Copilot)

The one-liner:

```bash
code --add-mcp '{"name":"cathode-ui","command":"npx","args":["-y","@cathode-ui/mcp"]}'
```

Or add manually to your user `settings.json`:

```json
"chat.mcp.servers": {
  "cathode-ui": {
    "command": "npx",
    "args": ["-y", "@cathode-ui/mcp"]
  }
}
```

Requires VS Code 1.102+ with the GitHub Copilot Chat extension.

### Codex CLI

Edit `~/.codex/config.toml`:

```toml
[mcp_servers.cathode-ui]
command = "npx"
args = ["-y", "@cathode-ui/mcp"]
```

Verify with `codex mcp list`.

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

## Author

Built by **[Madhan Raj](https://www.linkedin.com/in/cyphermadhan/)**.

## License

MIT.
