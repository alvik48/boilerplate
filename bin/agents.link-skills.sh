#!/usr/bin/env bash
#
# Make the vendored skills in .agents/skills discoverable by agents that look in
# their own directory (Claude Code reads .claude/skills).
#
# Codex does not need this: it scans .agents/skills natively. Its link is kept
# for compatibility -- it costs nothing and covers tooling that still looks in
# .codex/skills. See docs/repository/skills.md#discoverability.
#
# .claude/ and .codex/ are gitignored, so the link is rebuilt locally on every
# clone rather than committed. Chained into the root `prepare` script, so
# `pnpm install` is enough.
#
# The `skills` CLI can do this itself (--agent '*', symlinks by default). An
# explicit script is preferred: one readable line, and no dependency on CLI
# internals that a version bump may change.
#
# Idempotent.

set -euo pipefail

repo_root="$(cd "$(dirname "${BASH_SOURCE[0]}")/.." && pwd)"
cd "$repo_root"

link_for() {
  local agent_dir="$1"
  local link="$agent_dir/skills"

  mkdir -p "$agent_dir"

  # Already correct.
  if [ -L "$link" ] && [ "$(readlink "$link")" = "../.agents/skills" ]; then
    return 0
  fi

  # A real directory here is someone's own skills, not ours to replace.
  if [ -d "$link" ] && [ ! -L "$link" ]; then
    echo "agents:link-skills — $link is a real directory; leaving it alone." >&2

    return 0
  fi

  rm -f "$link"

  if ln -s ../.agents/skills "$link" 2>/dev/null; then
    echo "agents:link-skills — $link -> ../.agents/skills"
  else
    # Windows needs Developer Mode or elevation to create symlinks.
    echo "agents:link-skills — could not symlink $link (on Windows, enable Developer Mode" >&2
    echo "                      or copy .agents/skills there manually)." >&2
  fi
}

link_for .claude
link_for .codex
