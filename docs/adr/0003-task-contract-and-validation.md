# ADR 0003 — Define the Task contract, UTC timestamp, and layered validation

- **Status:** Accepted
- **Date:** 2026-11-03

## Context

Each task needs a server-created identifier, required title, optional description, and creation date. The UI needs early feedback, but the server is the trust boundary.

## Decision

Use `Task { id, titulo, descricao?, dataCriacao }`, with `id` created by `crypto.randomUUID()` and `dataCriacao` serialized as an ISO 8601 UTC string (`new Date().toISOString()`). Zod validates create and update inputs; titles are normalized for the rule that they cannot be empty or whitespace-only. The server creates and preserves `id` and `dataCriacao`.

The same schemas can support client-side validation, but only router/service validation ensures integrity. A missing task produces `TRPCError` `NOT_FOUND`; invalid input follows standard tRPC/Zod validation handling without internal details.

## Alternatives

- **`Date` as an external contract:** rejected to avoid serialization ambiguity across SSR, tRPC, and cache.
- **Client-side validation only:** rejected because it can be bypassed.

## Consequences

Transport dates are independent of local time zone; the UI is only responsible for formatting them for reading. The decision to normalize or preserve internal title spacing must be explicit in the implementation schema; the ban on blank titles is mandatory.
