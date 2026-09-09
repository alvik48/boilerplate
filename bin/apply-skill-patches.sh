#!/usr/bin/env bash
#
# Re-apply every committed correction under patches/skills/ to .agents/skills/.
#
# Vendored skills are committed to Git, so their checked-in state is already
# "upstream + patch" and a fresh clone needs no bootstrap. This script exists for
# the one operation that overwrites them: `skills update`.
#
# Deliberately NOT `set -e`: `git apply --check` returning non-zero is a normal
# branch here, not a failure.

set -uo pipefail

repo_root="$(cd "$(dirname "${BASH_SOURCE[0]}")/.." && pwd)"
cd "$repo_root"

patch_dir="patches/skills"

if [ ! -d "$patch_dir" ]; then
  echo "No $patch_dir directory; nothing to apply."
  exit 0
fi

shopt -s nullglob
patches=("$patch_dir"/*.patch)
shopt -u nullglob

if [ ${#patches[@]} -eq 0 ]; then
  echo "No skill patches to apply."
  exit 0
fi

failed=()

for patch in "${patches[@]}"; do
  skill="$(basename "$patch" .patch)"

  # `git apply` without --index/--cached touches only the working tree, so these
  # probes are unaffected by what is currently staged.
  if git apply -p1 --reverse --check "$patch" 2>/dev/null; then
    echo "  = $skill (already applied)"
    continue
  fi

  if git apply -p1 --check "$patch" 2>/dev/null; then
    if git apply -p1 "$patch"; then
      echo "  + $skill (applied)"
    else
      echo "  ! $skill (apply failed after a clean --check)" >&2
      failed+=("$skill")
    fi
    continue
  fi

  echo "  ! $skill (does not apply)" >&2
  failed+=("$skill")
done

if [ ${#failed[@]} -gt 0 ]; then
  cat >&2 <<EOF

Skill patches could not be applied: ${failed[*]}

Upstream rewrote the region a correction targets. This failure is the point:
the correction is not silently lost. Re-derive it against the new upstream with

  bin/edit-skill.sh begin <skill>

and read docs/repository/skills.md#correcting-a-vendored-skill before editing.
If a patch has grown past ~2 hunks, stop patching and fork the skill instead.
EOF
  exit 1
fi
