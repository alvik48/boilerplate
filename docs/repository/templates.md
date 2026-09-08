---
id: repository-templates
title: 'Templates'
description: 'Templates for contributors working in this monorepo.'
type: guide
audience: [developer, agent]
---

# Templates

New applications and database packages must be created by copying a template and
adapting it. Do not create new apps from a blank directory.

## Available Templates

- `templates/apps.backend` - NestJS backend service.
- `templates/apps.frontend` - Next.js App Router frontend.
- `templates/packages.db` - shared Prisma database package.

Templates are part of the workspace and should remain valid examples.

## General Copy Workflow

1. Copy the template directory to the target location.
2. Rename `package.json` `name` to the final workspace package name.
3. Replace placeholder README content.
4. Replace placeholder app metadata, branding, ports, package names, and env
   variable names.
5. Add or update `.env.example` for any required runtime variables.
6. Add workspace dependencies with `workspace:*`.
7. Run `pnpm install` from the repository root.
8. Run focused quality checks for the new package.

Example:

```sh
cp -R templates/apps.frontend apps/frontend.admin
pnpm install
pnpm --filter @apps/frontend.admin lint
pnpm --filter @apps/frontend.admin typecheck
pnpm --filter @apps/frontend.admin build
```

## Backend App

Copy:

```sh
cp -R templates/apps.backend apps/backend.<name>
```

Required adaptations:

- `package.json` name: `@apps/backend.<name>`.
- README title and description.
- `API_PORT` default in `src/main.ts` if the service needs a reserved port.
- Env examples for `API_PORT`, `API_HOST`, `DOCS_ORIGINS`, and service-specific variables.
- `apiContract.serviceId` in package metadata and `src/api.config.ts` identity/version.
- A service entry with guide mappings in `apps/frontend.docs/services.ts` and its
  `package#openapi:check` dependency in the docs generation task in `turbo.json`.
- Dependencies for shared DB packages, for example
  `"@packages/db-core": "workspace:*"`.
- Module names, controllers, and health routes if the template defaults are not
  sufficient.

Then run:

```sh
pnpm install
pnpm --filter @apps/backend.<name> lint
pnpm --filter @apps/backend.<name> typecheck
pnpm --filter @apps/backend.<name> build
```

See [backend.md](backend.md).

## Frontend App

Copy:

```sh
cp -R templates/apps.frontend apps/frontend.<name>
```

Required adaptations:

- `package.json` name: `@apps/frontend.<name>`.
- `dev` and `start` ports in `package.json`.
- `metadata` in `src/app/layout.tsx`.
- Placeholder `App name` copy in `src/app/page.tsx`.
- Global styles and theme imports according to the app design.
- Dependencies on `@packages/ui` when using shared UI.
- `.env.example` for app variables. Public browser variables must use
  `NEXT_PUBLIC_`.

Then run:

```sh
pnpm install
pnpm --filter @apps/frontend.<name> lint
pnpm --filter @apps/frontend.<name> typecheck
pnpm --filter @apps/frontend.<name> build
```

See [frontend.md](frontend.md).

## Database Package

Copy:

```sh
cp -R templates/packages.db packages/db-<name>
```

Required adaptations:

- `package.json` name: `@packages/db-<name>`.
- README title and command examples.
- `.env.example` `POSTGRES_URL` database name.
- `prisma/schema.prisma` models, enums, and table mappings.
- Generated Prisma import paths only if generator output changes.
- Package exports if adding new public modules.

Then run:

```sh
pnpm install
pnpm --filter @packages/db-<name> prisma:format
pnpm --filter @packages/db-<name> prisma:generate
pnpm --filter @packages/db-<name> typecheck
pnpm --filter @packages/db-<name> build
```

See [databases.md](databases.md).

## Template Maintenance

When a pattern becomes standard across two or more apps or packages, update the
relevant template. Keep templates minimal, but make sure new packages start with
correct lint, typecheck, env, and build behavior.
