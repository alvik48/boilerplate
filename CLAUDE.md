# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

This app is a Turborepo monorepo containing a NestJS backend API and a Next.js frontend dashboard. Uses pnpm as the package manager.

## Common Commands

```bash
# Development
pnpm dev                              # Start all dev servers
pnpm dev --filter=backend.core        # Start only backend (port 3000)
pnpm dev --filter=frontend.dashboard  # Start only dashboard (port 3100)

# Build
pnpm build                            # Build all packages
pnpm build --filter=backend.core      # Build specific app

# Linting & Type Checking
pnpm lint                             # Lint all packages
pnpm check-types                      # Type check all packages
pnpm format                           # Format with Prettier

# Backend Tests (run from apps/backend.core)
pnpm test                             # Unit tests
pnpm test:e2e                         # E2E tests
pnpm test:cov                         # Coverage report
pnpm test -- --testPathPattern=<pattern>  # Run specific test

# Database (run from apps/backend.core)
pnpm prisma:generate                  # Generate Prisma client
pnpm prisma:migrate:dev               # Run dev migrations
pnpm prisma:migrate:deploy            # Deploy migrations (production)
pnpm prisma:push                      # Push schema changes
pnpm prisma:studio                    # Open Prisma Studio UI

# Infrastructure
docker compose -f infra/docker-compose.yml up -d  # Start PostgreSQL & Redis
```

## Architecture

### Apps

| App | Framework | Port | Purpose |
|-----|-----------|------|---------|
| `apps/backend.core` | NestJS 11 | 3000 | Backend API server with Swagger docs at `/docs` |
| `apps/frontend.dashboard` | Next.js 16 | 3100 | Dashboard UI application |

### Shared Packages

| Package | Purpose |
|---------|---------|
| `@packages/config` | Shared configuration utilities (placeholder) |

### Key Patterns

- **Workspace dependencies**: Use `workspace:*` protocol, import via `@packages/*` prefix
- **Next.js App Router**: Frontend uses `/src/app` directory structure with React Compiler enabled
- **NestJS structure**: Standard Controllers/Services/Modules in `/src` with ConfigModule
- **TypeScript strict mode**: Enforced across all packages (ESM modules)
- **ESLint flat config**: Uses `eslint.config.mjs` format everywhere

## Tech Stack

- **Runtime**: Node.js >= 18, pnpm 9.0.0
- **Frontend**: React 19, Next.js 16, Tailwind CSS 4, React Compiler
- **Backend**: NestJS 11, Express, Prisma ORM
- **Database**: PostgreSQL (via Prisma with PrismaPg adapter)
- **Caching**: Redis
- **Testing**: Jest (unit + e2e)
- **Build**: Turborepo with task caching
- **Deployment**: PM2 process manager

## Database

Prisma schema located at `apps/backend.core/prisma/schema.prisma`. Uses PostgreSQL with ESM module format for generated client (output to `src/generated/prisma`).

Current models:
- **User**: id, email (unique), name, createdAt, updatedAt

## Infrastructure

Docker Compose (`infra/docker-compose.yml`) provides:
- **PostgreSQL**: localhost:5432 (user: `dev`, password: `qwerty`, db: `app_db`)
- **Redis**: localhost:6379

## Environment Variables

### Backend (`apps/backend.core/.env`)
```
DATABASE_URL=postgresql://dev:qwerty@localhost:5432/app_db?schema=public
API_HOST=0.0.0.0
API_PORT=3000
```

## Deployment

PM2 ecosystem config at `ecosystem.config.cjs`. Deployment scripts in `bin/`:

```bash
bin/update.sh      # Full deployment (git pull, install, migrate, build, restart)
bin/pm2.start.sh   # Start all PM2 apps
bin/pm2.stop.sh    # Stop all PM2 apps
bin/pm2.restart.sh # Restart all PM2 apps
bin/pm2.delete.sh  # Remove all PM2 apps
```

## Directory Structure

```
app/
├── apps/
│   ├── backend.core/          # NestJS API
│   │   ├── src/
│   │   │   ├── config/        # ConfigModule configuration
│   │   │   ├── prisma/        # PrismaService & PrismaModule
│   │   │   └── generated/     # Prisma client (generated)
│   │   ├── prisma/
│   │   │   └── schema.prisma  # Database schema
│   │   └── test/              # E2E tests
│   └── frontend.dashboard/    # Next.js Dashboard
│       └── src/app/           # App Router pages
├── packages/
│   └── config/                # Shared config package
├── infra/
│   └── docker-compose.yml     # PostgreSQL & Redis
├── bin/                       # Deployment scripts
├── turbo.json                 # Turborepo config
└── ecosystem.config.cjs       # PM2 config
```

## Feature development

When implementing new features or fixing bugs, do the following:

- Ensure API is running on port 3000 by requesting it. If not, run it via `pnpm run dev`.
- Ensure the frontend dashboard is running.
- Always use "context7" mcp server to access up-to-date docs if needed.
- When working with the frontend, use "next-devtools" and "playwright" mcp servers also.
