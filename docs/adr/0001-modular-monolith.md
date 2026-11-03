# ADR 0001 — Adopt a modular monolith

- **Status:** Accepted
- **Date:** 2026-11-03

## Context

The challenge is one TaskManager running locally in a Node.js process, with no independent deployment or scaling requirements. The domain contains task management only.

## Decision

Implement a modular monolith in Next.js. Separate presentation, tRPC, application services, validation, and repository; keep them in the same process and repository.

## Alternatives

- **Microservices:** rejected because there are no independent deployment, scaling, or ownership boundaries; they would add networking, observability, and distributed consistency without benefit.
- **Logic directly in procedures/pages:** rejected because it harms unit testing and mixes transport, rules, and storage.

## Consequences

The project remains simple to run and test. Future extraction will be reconsidered only if a demonstrable independent business, operational, or scaling boundary emerges.
