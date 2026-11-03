# ADR 0002 — Use a process-shared in-memory repository

- **Status:** Accepted
- **Date:** 2026-11-03

## Context

The scope forbids databases, ORMs, Redis, external services, and disk persistence. It requires a testable `Map<string, Task>` and one process-shared Node.js instance.

## Decision

Define a task repository contract and implement `InMemoryTaskRepository` over `Map<string, Task>`. Create one instance per process, protected from unnecessary recreation by HMR during development.

## Alternatives

- **Database or local file:** rejected by the scope.
- **React component state:** rejected because it does not meet tRPC, SSR, or cross-route sharing requirements.

## Consequences

Tasks disappear when the process restarts; multiple processes do not share data. This is acceptable only for the challenge's defined single-process local execution, not for distributed production.

## Reconsider when

Persistence, multiple instances, or retention after restart become requirements.
