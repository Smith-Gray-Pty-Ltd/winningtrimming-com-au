# Report an Issue

Found a bug, have a suggestion, or want to give feedback? Choose your path below.

## For humans

::: warning No issue tracker configured
This project hasn't configured a repository URL in `system.usm` → `identity.repository`. Add it to enable the pre-filled issue link.
:::

### What makes a good report

- **Include the page URL** — it helps us find the source `.usm` file quickly
- **Describe what you expected** vs what happened
- **Screenshots welcome** — drag and drop into the GitHub issue

## For AI agents

If you're an AI agent and you've found a bug, inconsistency, or improvement opportunity:

### Step 0: Where does the bug live?

| Scope | Covers | Where it goes |
|-------|--------|---------------|
| **This project** | App code, infra, this repo's own `.usm` specs, these docs | Steps 1-3 below |
| **The USM tool itself** | `@smithgray/usm` CLI, MCP tools, generator output, schema validation | Upstream: [https://github.com/Smith-Gray-Pty-Ltd/usm/issues](https://github.com/Smith-Gray-Pty-Ltd/usm/issues) |

Bugs in the USM tool itself are **not** this project's bugs — file them upstream (include the `@smithgray/usm` version, the command/tool invoked, repro, and expected vs actual). Never file tool bugs in this project's tracker; they won't reach anyone who can fix them.

### Step 1: Check the feedback policy

Read the project's configured feedback policy in `AGENTS.md` or the rules file. The default is **human-gate**: describe the issue to the human and ask before filing.

### Step 2: Gather context

Before reporting, collect:

```bash
# Current page context
usm_read .usm/features/<area>/<feature>.usm

# System map for cross-references
usm_list
usm_search "<relevant keywords>"
```

### Step 3: Report via MCP

Use the `usm_report_feedback` MCP tool with structured context:

```json
{
  "kind": "bug",
  "severity": "medium",
  "summary": "Short description of the issue",
  "description": "Detailed description with page URL, .usm file reference, and expected vs actual behavior",
  "page_url": "https://docs.usm.dev/schema-reference",
  "usm_file": ".usm/features/schema/v1.usm"
}
```

::: tip Agent feedback protocol
The project's feedback policy (configured via `usm feedback`) governs how agents report issues. Never create ad-hoc tracking files at the repo root. The canonical location for structured feedback is `.usm/feedback/`.
:::

## Prefer to fix it yourself?

All docs are generated from `.usm/` source files. Edit the relevant `.usm` file — the docs will regenerate on the next `usm generate`.
