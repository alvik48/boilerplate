#!/usr/bin/env bash
#
# Author or re-derive a correction to a vendored skill as a patch under
# patches/skills/, so the change survives `pnpm skills:update`.
#
# The hard part this automates is the BASELINE. `git diff` compares the working
# tree to the index, which after the first patch lands already contains the
# corrected skill. Re-deriving a patch that way diffs corrected-vs-corrected
# instead of upstream-vs-correction, and degrades a little more on every update.
# So the baseline is captured as an explicit pristine copy, never the index.
#
# Usage:
#   bin/edit-skill.sh begin  <skill> [--refresh]
#   bin/edit-skill.sh finish <skill> <workdir>
#
# `--refresh` pulls new upstream first (with patching disabled, so the snapshot
# cannot become "upstream + old patch").

set -uo pipefail

repo_root="$(cd "$(dirname "${BASH_SOURCE[0]}")/.." && pwd)"
cd "$repo_root"

usage() {
  sed -n '2,20p' "${BASH_SOURCE[0]}" | sed 's/^# \{0,1\}//'
  exit 2
}

cmd="${1:-}"
skill="${2:-}"

if [ -z "$cmd" ] || [ -z "$skill" ]; then
  usage
fi

skill_dir=".agents/skills/$skill"
patch_file="patches/skills/$skill.patch"

case "$cmd" in
  begin)
    refresh=0
    [ "${3:-}" = "--refresh" ] && refresh=1

    if [ ! -d "$skill_dir" ]; then
      echo "No such vendored skill: $skill_dir" >&2
      exit 1
    fi

    # Step 1 — return the working tree to the previously vendored upstream.
    if [ -f "$patch_file" ]; then
      if git apply -p1 --reverse --check "$patch_file" 2>/dev/null; then
        git apply -p1 --reverse "$patch_file"
        echo "Reversed existing $patch_file; $skill_dir is now prior upstream."
      elif git apply -p1 --check "$patch_file" 2>/dev/null; then
        echo "Existing patch is not currently applied; $skill_dir is already upstream."
      else
        echo "Existing $patch_file neither applies nor reverses cleanly." >&2
        echo "Upstream has moved under it. Re-derive from scratch: rm $patch_file, then rerun." >&2
        exit 1
      fi
    fi

    # Step 2 — optionally fetch new upstream, with patching DISABLED. Using the
    # normal wrapper here would re-apply the old patch whenever upstream did not
    # touch the patched region, contaminating the very baseline this exists for.
    if [ "$refresh" -eq 1 ]; then
      bin/update-skills.sh --no-patch "$skill"
    fi

    workdir="$(mktemp -d -t "skill-patch-$skill-XXXXXX")"
    mkdir -p "$workdir/a/$skill_dir" "$workdir/b/$skill_dir"

    # Steps 3 and 4 — snapshot pristine upstream, then a second copy to edit.
    cp -R "$skill_dir/." "$workdir/a/$skill_dir/"
    cp -R "$skill_dir/." "$workdir/b/$skill_dir/"

    cat <<EOF

Baseline captured.

  pristine : $workdir/a/$skill_dir
  edit here: $workdir/b/$skill_dir

Make the correction in the 'b' copy only. Keep hunks minimal and tightly
anchored — Markdown prose patches break on any nearby rewording. Prefer deleting
or replacing a wrong example over rewriting a section.

Then:

  bin/edit-skill.sh finish $skill $workdir

EOF
    ;;

  finish)
    workdir="${3:-}"

    if [ -z "$workdir" ] || [ ! -d "$workdir/a" ] || [ ! -d "$workdir/b" ]; then
      echo "Missing or malformed workdir: ${workdir:-<none>}" >&2
      exit 1
    fi

    mkdir -p patches/skills

    # Step 5 — two trees already carrying the a/ and b/ roots, with --no-prefix,
    # is what produces a patch `git apply -p1` accepts from the repository root.
    # NOT --src-prefix/--dst-prefix: those PREPEND to the given paths rather than
    # replacing them, yielding doubled paths that fail to apply.
    #
    # `git diff --no-index` exits 1 when it finds differences. That is the
    # success path here, which is why this script does not run under bare `set -e`.
    (cd "$workdir" && git diff --no-index --no-prefix --binary --no-renames a b) > "$patch_file"
    status=$?

    if [ $status -gt 1 ]; then
      echo "git diff failed (exit $status)" >&2
      rm -f "$patch_file"
      exit 1
    fi

    if [ ! -s "$patch_file" ]; then
      echo "No differences found; nothing to patch." >&2
      rm -f "$patch_file"
      exit 1
    fi

    hunks=$(grep -c '^@@' "$patch_file")

    # Step 6 — verify the round trip against the pristine working tree.
    if ! git apply -p1 --check "$patch_file"; then
      echo "Generated patch does not apply to the working tree." >&2
      echo "Is $skill_dir still at pristine upstream? Re-run 'begin'." >&2
      exit 1
    fi

    git apply -p1 "$patch_file"

    if ! git apply -p1 --reverse --check "$patch_file"; then
      echo "Generated patch applied but does not reverse cleanly." >&2
      exit 1
    fi

    echo "Wrote $patch_file ($hunks hunk(s)) and applied it to $skill_dir."

    if [ "$hunks" -gt 2 ]; then
      cat >&2 <<EOF

WARNING: $hunks hunks. Past ~2, stop patching and fork the skill — drop it from
skills-lock.json and own it as a project skill. An ever-growing patch means the
upstream skill no longer matches this repository.
EOF
    fi

    echo "Commit the patched files, the patch, and skills-lock.json together."
    rm -rf "$workdir"
    ;;

  *)
    usage
    ;;
esac
