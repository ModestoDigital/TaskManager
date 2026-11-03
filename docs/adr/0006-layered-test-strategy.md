# ADR 0006 — Adopt risk-oriented layered testing

- **Status:** Accepted
- **Date:** 2026-11-03

## Context

The scope requires Vitest and tests for essential rules, but quality cannot rely solely on a final test run. The domain, tRPC boundary, cache, and SSR have different failure modes.

## Decision

Test schemas, repository, and service with unit tests; test the tRPC router through caller/context without HTTP; test critical form/list components; and verify the SSR/hydration invariant through the chosen official integration, build, and, when necessary, a reproducible manual check.

Every test uses isolated data. The service receives simple clock and UUID generators with production defaults to make tests deterministic. The minimum matrix and rules are in the [testing architecture](../architecture/testing.md).

## Alternatives

- **Tests only at the end of Phase 5:** rejected because it makes domain and contract regressions more expensive to diagnose.
- **Full E2E:** rejected in the current scope; it adds tooling, setup, and maintenance not required by the challenge. It can be reconsidered if critical flows grow or real-browser support becomes a requirement.
- **Component testing only:** rejected because it does not prove business rules or tRPC codes.

## Consequences

Implementation tasks carry their tests as part of the acceptance criteria. Coverage is driven by mandatory scenarios, not an arbitrary percentage target.

## Reconsider when

Authentication, persistence, complex navigation, or cross-browser compatibility requirements are added.
