# TaskManager Build Roadmap

## Goal and execution order

This roadmap turns the scope and ADRs into implementable tasks. Phases are sequential until the CRUD is validated. Infinite Scroll is a bonus and must not delay or compromise the mandatory acceptance criteria.

**Required references:** [architecture overview](architecture/README.md) and [ADRs](adr/README.md). If they conflict, the challenge scope takes precedence; new durable decisions or changes to ADRs must be recorded before implementation.

## Rules for every task

- Do not add persistence, seed data, external services, a full UI kit, authentication, or distributed infrastructure.
- Do not expose secrets, stack traces, or internal details.
- Keep TypeScript strict and dependencies on compatible stable versions.
- Preserve single-process consistency: do not introduce `await`, I/O, or external callbacks between reading and writing/removing from the `Map`. See [concurrency](architecture/concurrency.md).
- Validate changes at the lowest suitable level before moving forward: unit test for a domain rule, integration test for a procedure, and build for framework integration. See the [testing architecture](architecture/testing.md).
- Update `PROJECT_STATUS.md` at the end of each phase.

## Dependency overview

```text
F1 Foundation -> F2 Domain and backend -> F3 UI and SSR -> F5 Quality/documentation
                                            -> F4 Infinite Scroll (bonus)
```

---

## Phase 1 — Foundation and minimum integration

**Outcome:** Next.js application with reachable App Router and tRPC, plus quality tooling; no CRUD implementation is required yet.

### T-01 — Confirm versions and integration pattern

- **Depends on:** none.
- **Do:** consult current official Next.js, tRPC, and TanStack Query documentation; select mutually compatible stable versions and define the SSR/hydration pattern.
- **Developer needs to know:** the choice must preserve server rendering of the first list page and reuse its cache on the client. Do not copy outdated App Router recipes without confirming compatibility.
- **Done when:** selected versions and the pattern are recorded in `package.json`, documentation, and, if needed, the relevant ADR.

### T-02 — Create the scaffold and quality configuration

- **Depends on:** T-01.
- **Do:** create the application with `src/`, configure TypeScript strict mode, ESLint, Vitest, a component-test environment when needed, and `dev`, `lint`, `typecheck`, `test`, and `build` scripts.
- **Developer needs to know:** do not relax `strict` to work around integration types; do not create `.env`; preserve the existing `.gitignore`. Configure test isolation and a DOM dependency only for component tests.
- **Done when:** the empty project starts, `lint`, `typecheck`, `test`, and `build` succeed, and a smoke test proves the test runner is active.

### T-03 — Build the minimum tRPC infrastructure

- **Depends on:** T-02.
- **Do:** configure initialization/context, root router, HTTP adapter at `app/api/trpc/[trpc]/route.ts`, and the Query Client provider selected in T-01. Create a temporary health procedure or router test, then remove it if it is not part of the final API.
- **Developer needs to know:** the router is a transport boundary; it must not contain the `Map`, React components, or ordering rules.
- **Done when:** a test procedure is called in a type-safe way and the infrastructure has a test or equivalent validation.

---

## Phase 2 — Domain and backend

**Outcome:** a CRUD API available through tRPC, independent from HTTP, and covered by essential tests.

### T-04 — Define domain types and schemas

- **Depends on:** T-02.
- **Do:** create `Task`, page/cursor types, and Zod schemas for create and update.
- **Developer needs to know:** `id` and `dataCriacao` are server controlled; `dataCriacao` is an ISO 8601 UTC string. A whitespace-only title is invalid. The client may reuse schemas but cannot replace server validation.
- **Done when:** schema tests accept a valid title, reject empty/whitespace input, and types do not permit editing `id` or `dataCriacao`.

### T-05 — Implement the in-memory repository

- **Depends on:** T-04.
- **Do:** define a repository contract and implement `InMemoryTaskRepository` with `Map<string, Task>` and a process-shared instance, compatible with HMR when needed. Keep every mutation synchronous, without I/O/`await` between locating and changing an item.
- **Developer needs to know:** do not use a file, ORM, database, or Redis. The repository handles storage and queries, not `TRPCError` or UI. State is lost on restart and is not shared between processes.
- **Done when:** isolated tests cover save, fetch, update, remove, and list without starting HTTP or sharing state between cases; the production instance is not recreated by HMR.

### T-06 — Implement the task service

- **Depends on:** T-04, T-05.
- **Do:** create the `create`, `list`, `getById`, `update`, and `delete` use cases; generate `crypto.randomUUID()` and the timestamp on the server.
- **Developer needs to know:** business rules live here, keeping the repository simple. Update preserves `id` and `dataCriacao`. Absence must be represented so the tRPC boundary can map it to `NOT_FOUND`. Do not introduce `await` between fetching and changing/removing a task.
- **Done when:** deterministic unit tests cover valid creation, controlled UUID/timestamp, update, delete, absent-task behavior, and both valid update/delete concurrent orders.

### T-07 — Implement deterministic pagination

- **Depends on:** T-05, T-06.
- **Do:** implement opaque composite-key `(dataCriacao, id)` cursor listing, descending ordering for both keys, and server-side default and maximum limits.
- **Developer needs to know:** the secondary `id` order is mandatory for equal timestamps. Do not use offset. The cursor points to the last returned item; `nextCursor` exists only when there is another page. Inserts after a cursor may appear only after refetch, but cannot duplicate loaded pages.
- **Done when:** a test proves no duplicates or gaps, including equal timestamps, deletion between pages, and blocked invalid limits.

### T-08 — Expose the `task` router

- **Depends on:** T-06, T-07, T-03.
- **Do:** create `task.create`, `task.list`, `task.getById`, `task.update`, and `task.delete` with Zod inputs and coherent outputs; map an absent task to `TRPCError` `NOT_FOUND`.
- **Developer needs to know:** expected validation and errors must be safe for the client; never return stack traces. `delete` returns structured success confirmation.
- **Done when:** procedure tests cover creation, invalid title, listing, update, delete, `NOT_FOUND`, and pagination.

---

## Phase 3 — UI, SSR, and CRUD behavior

**Outcome:** all three required routes provide accessible CRUD, with the first list produced on the server and client state synchronized.

### T-09 — Prepare visual composition and client provider

- **Depends on:** T-03, T-08.
- **Do:** create the base layout, simple CSS/CSS Modules, the required provider, and shared feedback/form components without excessive generic abstractions.
- **Developer needs to know:** use a simple, responsive UI without a full UI library. Inputs need labels, visible focus, and understandable messages.
- **Done when:** layout and components are accessible and contain no repository logic or domain rules.

### T-10 — Render and hydrate the first list at `/`

- **Depends on:** T-08, T-09.
- **Do:** fetch the first page in a Server Component, dehydrate/hydrate the same TanStack Query cache, and render the list, readable date, and empty state.
- **Developer needs to know:** do not use `useEffect` alone. The route must not serve indefinitely stale static HTML after mutations. Use the same query key on server and client to avoid an unnecessary first refetch.
- **Done when:** an integration test for the selected strategy—or the build plus a reproducible manual check if it cannot be isolated—demonstrates first-list SSR and cache reuse; the empty list has a clear message.

### T-11 — Implement creation at `/tasks/new`

- **Depends on:** T-09, T-10.
- **Do:** build title/description form, client validation based on the same contract, `task.create` mutation with `retry: false`, duplicate-submission prevention, feedback, and redirect to `/`.
- **Developer needs to know:** the server remains the final validation source. After success, update/invalidate the cache so the list reflects the new task. There is no idempotency key: external replay after an uncertain failure may create another task.
- **Done when:** a component test proves invalid submission is not sent, pending submission is blocked, and failure is not retried automatically; valid creation returns to an updated list with feedback.

### T-12 — Implement editing at `/tasks/[id]/edit`

- **Depends on:** T-09, T-10.
- **Do:** load with `task.getById`, prefill the form, handle loading and absence, submit `task.update`, and return to the updated list.
- **Developer needs to know:** the screen does not edit `id` or `dataCriacao`; `NOT_FOUND` is an expected condition, not an internal error.
- **Done when:** a component test covers loading, absence, and submission; editing preserves immutable fields, shows the correct states, and updates the list.

### T-13 — Implement deletion from the list

- **Depends on:** T-10.
- **Do:** add an accessible delete action, operation state, success/failure feedback, and list-query update.
- **Developer needs to know:** treat an attempt against an already removed item as recoverable `NOT_FOUND`; do not leave an item visually removed after a failed mutation without restoring or invalidating the cache.
- **Done when:** a component test covers success and failure; deletion updates the UI correctly and failures are visible to the user.

---

## Phase 4 — Infinite Scroll (bonus)

**Outcome:** subsequent pages load incrementally without compromising the CRUD.

### T-14 — Integrate infinite query and loading sentinel

- **Depends on:** T-07, T-10, T-11, T-12, T-13.
- **Do:** connect the cursor contract to `useInfiniteQuery` (or the selected integration's official equivalent) and use `IntersectionObserver` on a sentinel.
- **Developer needs to know:** the first page still comes from SSR. Do not fetch when there is no `nextCursor`, a request is pending, or the same page was already loaded. Flatten pages while preserving unique keys by `id`.
- **Done when:** subsequent pages are added once, the end of the list triggers no additional call, and mutations maintain a consistent experience.

---

## Phase 5 — Quality, documentation, and delivery

**Outcome:** reproducible repository ready for evaluation.

### T-15 — Consolidate tests and delivery checks

- **Depends on:** T-08 through T-13; T-14 if the bonus is delivered.
- **Do:** run the scenario matrix in the [testing architecture](architecture/testing.md), including [concurrency](architecture/concurrency.md) scenarios; review isolation and flakiness; run `lint`, `typecheck`, `test`, and `build`; fix identified failures.
- **Developer needs to know:** this task consolidates evidence; it does not replace the tests required in previous task acceptance criteria. Prefer service/procedure tests over tests requiring HTTP.
- **Done when:** the minimum matrix is met and all required commands pass with no known errors.

### T-16 — Finalize README and project status

- **Depends on:** T-15.
- **Do:** complete the root README with purpose, stack, installation, scripts, usage, procedures, SSR, in-memory storage, limitations, and relevant ADRs; update `PROJECT_STATUS.md` with actual validation results.
- **Developer needs to know:** explicitly state the limits of in-memory storage and the lack of persistence across restarts/processes. Do not document secrets or claim validation that was not performed.
- **Done when:** an evaluator can clone, install, run, test, and understand the limitations without additional context.

## Ready-to-start checklist

- Task dependencies completed and validated.
- Impacted ADRs read; any decision change has been recorded.
- Task scope limited to the described outcome, without implementing later phases early.
- Acceptance criterion understood and a way to verify it defined.
