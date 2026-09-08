# Quality

## Formatting

Root Prettier config:

```json
{
  "printWidth": 120,
  "singleQuote": true,
  "bracketSpacing": true,
  "trailingComma": "all",
  "arrowParens": "always"
}
```

Run:

```sh
pnpm format
pnpm --filter <package> format
```

Formatting scripts write files.

Root `.prettierignore` excludes `.agents/skills` so repository-wide Prettier runs
preserve vendored skill contents and their recorded hashes. Review upstream skill
formatting as part of explicit skill maintenance rather than applying project
formatting to those files.

## Linting

Run:

```sh
pnpm lint
pnpm --filter <package> lint
```

Many package lint scripts currently include `--fix`, so lint may modify files.
Review changes after running lint.

Shared ESLint configs live in `packages/eslint-config`:

- `@packages/eslint-config/base`.
- `@packages/eslint-config/backend`.
- `@packages/eslint-config/next`.
- `@packages/eslint-config/react-library`.

## Typechecking

Run:

```sh
pnpm typecheck
pnpm --filter <package> typecheck
```

Shared TypeScript configs live in `packages/typescript-config`.

## Tests

Run:

```sh
pnpm test
pnpm --filter <package> test
```

Backend template uses Jest. DB template uses `node --test tests/*.test.mjs`.
Add tests proportionally to risk:

- Unit tests for pure logic and service behavior.
- Integration tests for database queries and migrations.
- E2E tests for critical HTTP/API flows.
- Browser verification for visible frontend changes.

## Build

Run:

```sh
pnpm build
pnpm --filter <package> build
```

Turbo build outputs include `dist/**` and `.next/**` while excluding
`.next/cache/**`.

## Pre-Commit And Commit Messages

Husky pre-commit runs:

```sh
pnpm build
pnpm lint
```

Commitlint extends conventional commits and requires a non-empty scope:

```text
feat(frontend.admin): add shell navigation
fix(backend.core): validate health config
chore(db-core): regenerate prisma client
```

## Definition Of Done

A code change is complete when:

- Relevant repository docs and local skills were consulted.
- Affected docs were checked against the final code and config, and any drift
  was fixed in the same change.
- The change stays inside the correct app/package boundary.
- New apps/packages were created from templates.
- Package names, ports, metadata, README files, and env examples were adapted.
- Cross-package dependencies are declared with `workspace:*`.
- Generated files were regenerated, not hand-edited.
- `.env` files and secrets were not committed.
- Relevant format, lint, typecheck, build, and test commands passed.
- Any skipped verification is explicitly reported with the reason.
- User-facing frontend changes were checked in a browser when a dev server can
  run.
