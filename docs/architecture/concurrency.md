# Concurrency, consistency, and idempotency

## Operational scope

The challenge runs in **one persistent Node.js process**, with one shared in-memory `Map`. In this model, JavaScript executes synchronous code serially on the event loop: synchronous `Map` operations do not have simultaneous thread writes. This guarantee is limited to that process and is not distributed consistency.

## Risk assessment

| Risk | Current severity | Adopted handling |
| --- | --- | --- |
| Two procedures change the same `Map` | Low | read-validate-write/remove operations remain synchronous, with no `await` between stages |
| `update` races `delete` for the same task | Low | event-loop order defines the result: update before delete is removed; delete before update returns `NOT_FOUND` |
| Double click/duplicate submission | Medium UX impact | disable the button during the mutation and use a create mutation with no automatic retry; the server still validates input |
| Request replay by client/network | Medium, outside the current guarantee | `create` is not idempotent without an idempotency key; document the limit without trying to infer duplicates from content |
| New task during pagination | Low | the `(dataCriacao, id)` cursor avoids duplicates/unstable ordering; a new task before the cursor may appear only after a refetch, which is acceptable eventual behavior |
| Multiple processes/instances | High if it occurs, outside the scope | prohibited by the intended execution model; each process would have its own `Map` |
| HMR recreates storage | Medium in development | global-process-protected singleton |

There is no critical or high finding within the required environment. The high multiple-instance risk is a declared limitation, not something in-memory code can fix.

## Implementation invariants

1. Mutable repository and service methods must not contain `await`, I/O, or an external callback between finding a task and applying `set`/`delete` to the `Map`.
2. `update` changes only `titulo` and `descricao`; `id` and `dataCriacao` remain immutable, so edits do not move pagination ordering.
3. The router makes a single use-case call per mutation. The UI disables the corresponding action while the mutation is pending.
4. `task.create` must explicitly declare `retry: false` in mutation integration so an error cannot silently cause a client retry.
5. After create/update/delete, invalidate or update the list query; the UI cache is not a concurrency-control mechanism.

## Why Redis or a container are not needed now

Redis, durable idempotency keys, and multiple replicas solve a different problem: cross-process coordination and distributed request replay. They contradict in-memory-only storage, the explicit ban on Redis/external services, and the challenge's single-process requirement. A container only packages a process; it neither shares a `Map` between replicas nor makes an operation idempotent.

## Conditions for reassessment

Replace this decision only if at least one requirement appears:

- more than one process, container/replica, or serverless execution;
- persistence after restart;
- a client with automatic retry or an external integration requiring exactly-once creation;
- asynchronous work in the read-modify-write flow;
- an explicit requirement for strong consistency across users.

In that case, introduce shared transactional storage and an idempotency key in the `create` contract; choose Redis only if its TTL and deduplication semantics meet the requirement. The change requires revisiting ADRs 0002, 0004, and 0007.
