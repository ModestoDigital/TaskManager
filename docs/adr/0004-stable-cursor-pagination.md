# ADR 0004 — Paginate tasks by cursor with stable ordering

- **Status:** Accepted
- **Date:** 2026-11-03

## Context

`task.list` must support Infinite Scroll and deterministic ordering, including when two tasks have the same timestamp.

## Decision

Order tasks by descending `dataCriacao` and, on ties, descending `id`. Pagination has a server-defined default and maximum limit. The cursor is opaque to the client and represents the last received composite key `(dataCriacao, id)`. The response contains `items` and `nextCursor`, which is omitted when there is no next page.

## Alternatives

- **Offset/limit:** rejected because inserts and removals between pages cause shifting and make Infinite Scroll less consistent.
- **Order only by timestamp:** rejected because equal timestamps make the order unstable and can cause duplicates or gaps.

## Consequences

The repository must compare the composite key when fetching the next page. This contract enables the bonus without changing the public listing API.

## Reconsider when

The domain requires another user-visible ordering or persistence offers a native cursor with different semantics.
