# ADR 0007 — Maintain single-process sequential consistency

- **Status:** Accepted
- **Date:** 2026-11-03

## Context

TaskManager uses an in-memory `Map`, runs locally in one Node.js process, and cannot use Redis, a database, or external persistence. There are mutations concurrent from the user's perspective, along with pagination and development HMR.

## Decision

Keep all repository and service mutations synchronous within the process, with no `await` between reading, validation, and writing/removal. Event-loop order defines update/delete conflicts; the permitted result is an update followed by removal or `NOT_FOUND` if removal occurred first.

Use a stable pagination cursor, an HMR-protected singleton, and UI-action blocking during a mutation. `task.create` does not have distributed idempotency; its client mutation declares `retry: false`. Details and required tests are in [concurrency](../architecture/concurrency.md).

## Alternatives

- **Redis and an idempotency key:** rejected now because they violate the in-memory-only/single-process scope and add infrastructure without a distributed-retry requirement.
- **Container:** rejected as a concurrency solution; it packages a process but does not coordinate multiple `Map`s or provide idempotency.
- **In-process asynchronous locks:** rejected because critical operations are synchronous and have no interleaving point.

## Consequences

The system has sequential consistency only in the single process. A replay after an uncertain failure can create another task; this limitation is explicit. The architecture is not valid for multiple instances.

## Reconsider when

Multiple instances, persistence, external/automatic retry, or an exactly-once creation requirement is introduced.
