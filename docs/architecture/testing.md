# Testing Architecture

## Scope decision

TaskManager uses a small, risk-oriented testing pyramid. Vitest is mandatory; tests live close to the module under test and do not require an HTTP server for domain rules or procedures. Full E2E automation will not be added to this challenge: it adds setup and execution time without being required. The build and a guided manual route check cover final framework integration.

## Layers and responsibilities

| Layer | Target | Isolation | What it proves |
| --- | --- | --- | --- |
| Schema | Zod | no I/O | input contracts and non-empty title |
| Unit | service and repository | new in-memory repository per test | CRUD rules, generation/immutability, and ordering |
| Application integration | tRPC router through caller | test context, no HTTP | inputs, outputs, and `TRPCError` mapping |
| Component | forms and list | controlled tRPC client mocks | visible validation, loading, feedback, and user actions |
| Framework | SSR/hydration | build and minimal integration test when supported | first page produced on the server and reusable initial cache |

## Proposed organization

```text
src/
  schemas/task.test.ts
  server/repositories/in-memory-task-repository.test.ts
  server/services/task-service.test.ts
  trpc/routers/task.test.ts
  components/tasks/*.test.tsx
```

Names and locations may follow the scaffold convention, as long as each test remains colocated with its module or in a clearly equivalent mirror structure.

## Testing rules

- Every test receives a fresh repository; never depend on the production singleton or test execution order.
- To test time and IDs without flakiness, the service should accept simple clock and UUID generators as explicit dependencies, with `new Date` and `crypto.randomUUID` as production defaults. Do not create a DI framework.
- Fix equal timestamps in pagination tests and assert the `(dataCriacao, id)` composite key; test limits, end of list, invalid cursors, and no duplicates between pages.
- Exercise update/delete operations in simulated concurrent orders with `Promise.all`; because the critical path is synchronous, the result must follow one of the two valid orders and must never produce a partially changed task. Verifying that no `await` exists in the mutation path does not require a lock: code review guarantees that invariant.
- Test the router directly through its caller/test context, without starting HTTP. An absent resource must yield `NOT_FOUND`; invalid input must preserve tRPC/Zod validation behavior.
- Component tests focus on accessible behavior: labels, messages, disabled buttons during a mutation, and UI updates. Do not test internal hook details or styles.
- The SSR test must follow the official integration selected in Phase 1. If that version offers no stable isolated test surface, record the limitation and verify the invariant through the build plus a reproducible manual check; do not simulate SSR with `useEffect`.

## Minimum coverage matrix

| Requirement | Primary layer |
| --- | --- |
| Create a valid task and generate server fields | Service |
| Empty or whitespace-only title | Schema and router |
| List and order tasks | Repository/service |
| Stable pagination, cursor, and limit | Service/repository |
| Update/delete existing and absent tasks | Service and router |
| `NOT_FOUND` without internal details | Router |
| Empty state, validation, and form loading | Component |
| First SSR page and no duplicated request | Framework/integration |
| Update/delete and pagination during mutations | Service/repository and component |

## Required delivery commands

```text
npm run lint
npm run typecheck
npm run test
npm run build
```

The final command names may vary with the scaffold, but the README must expose equivalents. No phase is complete based on numeric coverage alone: the matrix scenarios must pass.
