# TaskManager Architecture

## Context

The project starts with no application code, dependencies, or build configuration. The defined scope is a task CRUD application running locally in one persistent Node.js process, using Next.js App Router, tRPC, Zod, TanStack Query, and in-memory storage only.

## Adopted architecture

A modular monolith separates presentation, the tRPC boundary, application logic, and storage. There is one business domain: **Task Management**. There is no justification for microservices, a database, a queue, or an external service in this challenge.

```text
Next.js App Router (Server Components and client UI)
  -> tRPC router (validation and error mapping)
    -> Task service (use cases and business rules)
      -> Task repository (contract)
        -> InMemoryTaskRepository (process-shared Map)
```

`Task` is the domain core. Input validation lives in shared Zod schemas; the non-empty-title rule is enforced by the server regardless of UI validation.

## Proposed module boundaries

| Module | Responsibility | Must not know about |
| --- | --- | --- |
| `app/` | routes, SSR composition, and layout | `Map` implementation details |
| `components/tasks/` | UI and client interaction | persistence rules |
| `trpc/routers/` | procedures, input/output, and `TRPCError` | React components |
| `server/services/` | `create`, `list`, `getById`, `update`, and `delete` use cases | HTTP and client cache |
| `server/repositories/` | data access and ordering | tRPC and UI |
| `schemas/` | Zod input contracts | infrastructure |
| `types/` | domain and pagination types | framework |

## Quality and testing

Tests are part of every delivery, not a later stage: schemas, repositories, and services receive unit tests; procedures receive integration tests through the tRPC caller; critical components receive behavior tests. SSR/hydration is verified through the selected official integration, the build, and, if needed, a reproducible manual check. The complete strategy is in the [testing architecture](testing.md).

## Concurrency and consistency

In the intended single Node.js process, synchronous mutations to the `Map` are serialized by the event loop. No read-validate-write operation may introduce `await` or I/O between those steps. The architecture offers neither cross-process coordination nor exactly-once creation after a network retry; the [concurrency analysis](concurrency.md) defines limits, UI mitigation, and objective conditions for adopting shared storage or idempotency in the future.

## Main flows

1. The `/` page produces the first page on the server and hydrates it into the TanStack Query cache.
2. Create, edit, and delete interactions call tRPC mutations.
3. The router validates input, delegates to the service, and converts an absent task into `NOT_FOUND`.
4. After a successful mutation, the UI invalidates or updates the list cache; it does not maintain a manual second source of truth.
5. If implemented after the mandatory CRUD, incremental loading uses the same list cursor contract.

## Deliberate operational limits

- Data is lost when the Node.js process restarts.
- State is not shared across processes, instances, or replicas.
- This solution is not suitable for distributed production.
- There is no authentication, authorization, auditing, or persistence because they are outside the scope.

The decisions recorded in [ADRs](../adr/README.md) are the source of truth for durable architectural choices.

The [build roadmap](../ROADMAP.md) turns these decisions into ordered tasks, dependencies, and acceptance criteria.
