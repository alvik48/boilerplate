# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

This app is a Turborepo monorepo containing multiple Next.js frontend applications and a NestJS backend. Uses pnpm as the package manager.

## Common Commands

```bash
# Development
pnpm dev                              # Start all dev servers
pnpm dev --filter=backend.core        # Start only backend
pnpm dev --filter=frontend.dashboard  # Start only dashboard

# Build
pnpm build                            # Build all packages
pnpm build --filter=web               # Build specific app

# Linting & Type Checking
pnpm lint                             # Lint all packages
pnpm check-types                      # Type check all packages
pnpm format                           # Format with Prettier

# Backend Tests (run from apps/backend.core)
pnpm test                             # Unit tests
pnpm test:e2e                         # E2E tests
pnpm test:cov                         # Coverage report
pnpm test -- --testPathPattern=<pattern>  # Run specific test
```

## Architecture

### Apps

| App | Framework | Port | Purpose |
|-----|-----------|------|---------|
| `apps/backend.core` | NestJS 11 | 3000 | Backend API server |
| `apps/frontend.dashboard` | Next.js 16 | 3000 | Dashboard UI |
| `apps/web` | Next.js 16 | 3000 | Main web application |
| `apps/docs` | Next.js 16 | 3001 | Documentation site |

### Shared Packages

- `@repo/ui` - React component library (Button, Card, Code components)
- `@repo/eslint-config` - Shared ESLint configs (base, next-js, react-internal)
- `@repo/typescript-config` - Shared TypeScript configs (base, nextjs, react-library)

### Key Patterns

- **Workspace dependencies**: Use `workspace:*` protocol, import via `@repo/*` prefix
- **Next.js App Router**: All frontend apps use `/app` directory structure
- **NestJS structure**: Standard Controllers/Services/Modules in `/src`
- **TypeScript strict mode**: Enforced across all packages
- **ESLint flat config**: Uses `eslint.config.mjs` format

## Tech Stack

- **Runtime**: Node.js >= 18
- **Frontend**: React 19, Next.js 16, Tailwind CSS 4
- **Backend**: NestJS 11, Express
- **Testing**: Jest
- **Build**: Turborepo with task caching
