#!/usr/bin/env bash
#
# Update vendored skills from upstream, then re-apply this repository's
# corrections from patches/skills/.
#
# Why a wrapper instead of chaining in the package.json script field: npm and pnpm
# append user arguments to the END of the whole command string, so
#
#   "skills:update": "skills update --project && bin/apply-skill-patches.sh"
#
# invoked as `pnpm skills:update shadcn` would update EVERY skill and pass
# `shadcn` to the patch script. Forwarding "$@" explicitly is the fix.
#
# Usage:
#   bin/update-skills.sh [skill ...]
#   bin/update-skills.sh --no-patch [skill ...]   # patch authoring only

set -euo pipefail

repo_root="$(cd "$(dirname "${BASH_SOURCE[0]}")/.." && pwd)"
cd "$repo_root"

apply_patches=1

if [ "${1:-}" = "--no-patch" ]; then
  apply_patches=0
  shift
fi

pnpm exec skills update --project "$@"

if [ "$apply_patches" -eq 0 ]; then
  cat <<'EOF'

Skipped patch application (--no-patch).

The working tree now holds PRISTINE upstream. That is the only correct baseline
for authoring a patch — see docs/repository/skills.md#correcting-a-vendored-skill.
Do not commit this state on its own.
EOF
  exit 0
fi

bin/apply-skill-patches.sh
