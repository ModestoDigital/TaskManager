# ADR 0005 — Render the first page on the server and hydrate the cache

- **Status:** Accepted
- **Date:** 2026-11-03

## Context

The initial `/` list must be produced on the server, avoid an unnecessary second request after hydration, and must not become statically stale when data changes.

## Decision

The home page fetches the first page during server rendering and places it in TanStack Query's `QueryClient` for client hydration. The client query reuses the same key and contract as paginated listing. The route is configured not to serve a stale static response indefinitely.

The exact tRPC, App Router, and TanStack Query integration is selected in Phase 1 after checking official documentation and compatible stable versions, without changing these invariants.

## Alternatives

- **Fetch only in `useEffect`:** rejected because it does not satisfy initial SSR.
- **SSR without cache hydration:** rejected because it causes duplicate requests and disconnected state sources.

## Consequences

Mutations must invalidate or update the list query consistently. Infinite Scroll follows the mandatory CRUD and must reuse this strategy, avoiding concurrent pages or duplicate items.
