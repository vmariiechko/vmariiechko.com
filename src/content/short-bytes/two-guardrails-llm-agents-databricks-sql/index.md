---
title: "Two Guardrails for Letting LLM Agents Query Your Databricks Tables"
date: 2026-05-19
description: "Hand `databricks experimental aitools tools query` to an LLM agent raw and two things go wrong: it can write, and JSON output bloats your context window. Here's the open-source wrapper I built to fix both."
tags: ["Databricks", "LLM Agents", "Open Source"]
---

Hand `databricks experimental aitools tools query` to an LLM agent and two things go wrong.

First, nothing stops the agent from running a `DROP TABLE` if it gets confused. The CLI runs whatever SQL you pass. Second, the default JSON output bloats your context window: `[{"col_0":"1"}]` for a count the agent has to parse instead of reading `1`.

So I built a small wrapper. Single file, no dependencies, open-sourced inside my [databricks-bundle-template](https://github.com/vmariiechko/databricks-bundle-template) repo as a drop-in skill. The rest of this post: the two principles it enforces and how I wire it into my agents.

## Two principles, one file

Validate read-only first. Format for tokens second.

The wrapper allow-lists six prefixes: `SELECT`, `WITH`, `SHOW`, `DESCRIBE`, `DESC`, `EXPLAIN`. The first non-whitespace token of the cleaned statement must be one of these or the call is refused before it reaches the warehouse. It also block-lists every destructive verb anywhere in the statement: `INSERT`, `UPDATE`, `DELETE`, `MERGE`, `DROP`, `TRUNCATE`, `GRANT`, `COPY INTO`, and the rest of the usual list. Full block-list and the implementation are in the source.

The safety-critical step before any of that is stripping block comments, line comments, and quoted strings. Without it, `SELECT '/* DROP TABLE foo */ 1'` would slip past the block-list because `DROP` is hiding inside a string. With it, the wrapper sees the cleaned form for inspection and the smuggling attempt fails. `SELECT 1; DROP TABLE foo` still has `DROP` bare, matches the block-list, rejected.

Then output is shaped to row geometry: 1 cell becomes a scalar value, 1 column becomes lines, anything wider becomes TSV. The agent reads `1` instead of `[{"col_0":"1"}]`.

## Why TSV by default

Tab-separated values isn't a glamorous choice, but it's the right one for what the agent is doing here. For flat tabular data, delimited text avoids a lot of the structural overhead JSON carries around: quotes, braces, repeated keys for every row. For the agent's read-and-respond loop on query outputs, plain delimited text wins on tokens.

I did check the newer entrant. TOON (Token-Oriented Object Notation) has been getting attention for compressing structured data, and the headline claim against JSON is real on its own benchmarks. But this wrapper already defaults to TSV for flat query results, which is a different baseline and a better fit for the dominant shape `dbx-ro-query` emits. I'm sticking with TSV. If the wrapper ever needs to ship VARIANT or STRUCT columns into agent context routinely, that's the moment to revisit. References at the bottom of the post.

The honest tradeoff worth knowing: heavily compressed formats can cost some reasoning accuracy on long flat outputs (the model occasionally loses track of which column a value belongs to in row 5000 of a dump). For most evidence-capture queries this doesn't matter; for thousand-row dumps you should sanity-check.

## How I use it

One CLI command, drops into any project that uses the Databricks CLI:

```bash
databricks bundle init https://github.com/vmariiechko/databricks-bundle-template \
  --template-dir assets/dbx-ro-query
```

It prompts for a `target_dir`. The default is `.agents`, vendor-neutral, and that's what I use because I run more than one runtime. If you only use one and want native auto-discovery, override to `.claude`, `.codex`, `.cursor`, and the install message prints the exact wiring line per agent.

I personally run this in Claude Code, Codex, and Cursor IDE. The `.agents/skills/<name>/SKILL.md` layout is generic enough that Gemini CLI, Antigravity, OpenCode, and most modern agent runtimes pick it up the same way; you just add their wiring line.

For wiring, I keep instructions in `AGENTS.md` rather than per-agent files, since Codex reads it natively and several other runtimes do too. One line is enough:

```
Use the skill at .agents/skills/dbx-ro-query/SKILL.md when running read-only SQL.
```

:::callout-info
**Claude Code tip:** instead of duplicating that line in both `AGENTS.md` and `CLAUDE.md`, put `@AGENTS.md` on the first line of `CLAUDE.md`. Claude loads the contents of `AGENTS.md` first in every session, and anything Claude-specific goes underneath. No duplication, no drift.
:::

Try it on `samples.nyctaxi.trips`, the public Databricks dataset that ships with every workspace:

```bash
python .agents/skills/dbx-ro-query/scripts/dbx-ro-query.py \
  "SELECT COUNT(*) FROM samples.nyctaxi.trips" \
  "<your-profile>" "scalar"
```

Returns `21932`. One line, no JSON wrapper. The same query in `json` format would come back as `[{"count(1)":"21932"}]`: extra structure the agent does not need.

The asset also ships per-agent runtime tips under `references/` (Claude Code, Codex, Cursor) for things like cold-warehouse timeouts, Codex sandbox network access, and the Cursor `.cursor/rules/` quirk. They are not loaded by default; pull them in only when you hit a specific runtime hiccup.

## What about Databricks AI Dev Kit?

It exists, and it ships an `execute_sql` MCP tool. I read the source: no read-only guard, no allow-list or block-list, no comment or string sanitizer. It's a general SQL execution tool, not a read-only one. Different problem. The wrapper occupies the unfilled safety slot.

The Dev Kit also ships a `get_best_warehouse()` helper. I don't use it. I set `DATABRICKS_WAREHOUSE_ID` once in my shell config and every agent inherits it through the environment. The Dev Kit's helper is there if you want auto-selection; I prefer not to reinvent something an established library already does.

## Caveats

A few honest ones, not optional:

- **`aitools tools query` is in the experimental namespace.** Databricks may promote it. If they do, the wrapper's argv list needs a one-line update.
- **The block-list is verb-based, not parser-based.** A read-only statement that uses a forbidden verb as a column alias (`SELECT 1 AS drop`) is rejected. Rename the alias rather than weakening the guard.
- **Leading line comments do not work.** `-- comment\nSELECT 1` is rejected by the upstream CLI's argv parser before it reaches the wrapper. Workarounds: move the comment after the leading verb (`SELECT 1 -- comment`), or use a block comment (`/* comment */ SELECT 1`). The wrapper's own line-comment stripping works fine on every other position.
- **The whole result buffers in memory.** For multi-million-row queries, push a `LIMIT`. Not a problem for evidence captures, which is the primary use case.
- **It is not a substitute for warehouse RBAC.** It is a defense-in-depth layer. Run your agent's profile under a service principal with read-only permissions too.

## Grab it

The asset lives at [github.com/vmariiechko/databricks-bundle-template](https://github.com/vmariiechko/databricks-bundle-template/tree/main/assets/dbx-ro-query). Install command above. If you find a destructive prefix slipping through or a verb the block-list misses, open an issue. I want to know.

## References

- [TOON specification and Flat-Only benchmark suite (github.com/toon-format/toon)](https://github.com/toon-format/toon)
- [TOON benchmark detail (toonformat.dev/guide/benchmarks)](https://toonformat.dev/guide/benchmarks)
- [InfoQ: TOON reduces LLM token costs (Nov 2025)](https://www.infoq.com/news/2025/11/toon-reduce-llm-cost-tokens/)
- [Independent critical analysis of TOON benchmark methodology (dev.to/ikaganacar)](https://dev.to/ikaganacar/toon-benchmarks-a-critical-analysis-of-different-results-5h66)
