#!/usr/bin/env bash
#
# Build the CodeGraph index for this checkout, so the `codegraph` MCP server in
# .mcp.json has something to answer from. See docs/repository/mcp-servers.md.
#
# Deliberately NOT chained into the root `prepare` script, unlike
# agents.link-skills and agents.generate-subagents. Those are near-instant file
# operations; a full index walks every tracked file through tree-sitter, wants
# 6GB of RAM, and takes minutes. Paying that on every `pnpm install` -- including
# in CI, which never queries the index -- is not a trade worth making. It stays
# one explicit opt-in command.
#
# Run once per clone. Afterwards the daemon that `codegraph serve --mcp` spawns
# watches the tree and keeps the graph fresh for as long as an agent session
# holds the server, so re-running this is not part of any normal workflow.
#
# Idempotent.

set -euo pipefail

repo_root="$(cd "$(dirname "${BASH_SOURCE[0]}")/.." && pwd)"
cd "$repo_root"

# CodeGraph honors CODEGRAPH_DIR so one working tree shared by two environments
# (the WSL/Windows case) can hold two indexes. Honor it here too, or the
# already-indexed check below reports on a directory that is not the one in use.
data_dir="${CODEGRAPH_DIR:-.codegraph}"

if [ -f "$data_dir/codegraph.db" ]; then
  echo "codegraph:init — $data_dir/codegraph.db already exists; nothing to do."
  echo "                 An agent session keeps it current. Force a rebuild with:"
  echo "                 pnpm exec codegraph index --force"

  exit 0
fi

if ! pnpm exec codegraph --version >/dev/null 2>&1; then
  echo "codegraph:init — the codegraph binary is unavailable." >&2
  echo "                 It ships as a platform-specific optionalDependency; run" >&2
  echo "                 pnpm install, and check that this platform is supported." >&2

  exit 1
fi

echo "codegraph:init — indexing $repo_root (first run takes a few minutes)."
pnpm exec codegraph init
