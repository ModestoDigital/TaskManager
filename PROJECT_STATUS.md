# Project Status

## Current phase

Pre-Phase 1 — initial architecture documented; there is still no application or installed dependency.

## Completed

- Repository inspected: it contains only `README.md`, `.gitignore`, and a license.
- Base architecture and seven initial ADRs created under `docs/`.
- Defined a modular monolith, in-memory repository, task contract, stable pagination, and SSR/hydration strategy.
- Build roadmap created in `docs/ROADMAP.md`, with 16 tasks, dependencies, and acceptance criteria.
- Layered testing strategy documented in `docs/architecture/testing.md` and incorporated into task acceptance criteria.
- Concurrency, pagination, and idempotency limits documented in `docs/architecture/concurrency.md`; Redis and a container were rejected for the current scope.

## Pending

- Check current official documentation and compatibility between Next.js App Router, tRPC, and TanStack Query.
- Create the project and configure TypeScript strict mode, ESLint, Vitest, and the minimum tRPC integration.
- Implement domain, backend, UI, SSR, and only after the CRUD is validated, Infinite Scroll.

## Key decisions

- [ADR 0001](docs/adr/0001-modular-monolith.md)
- [ADR 0002](docs/adr/0002-in-memory-repository.md)
- [ADR 0003](docs/adr/0003-task-contract-and-validation.md)
- [ADR 0004](docs/adr/0004-stable-cursor-pagination.md)
- [ADR 0005](docs/adr/0005-ssr-query-hydration.md)

## Latest validation

Not applicable: there is no code, dependency, test, lint, typecheck, or build configuration yet.

## Known issues

None. The concrete SSR integration will be defined after checking stable versions and official documentation in Phase 1.

## Recommended next action

Start Phase 1: select compatible stable versions, create the Next.js scaffold, and configure the minimum tRPC infrastructure without implementing the domain yet.
