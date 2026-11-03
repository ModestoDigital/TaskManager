# TaskManager

A full-stack task-management technical challenge built with Next.js App Router and tRPC. It supports creating, listing, editing, deleting, and incrementally loading tasks.

## Stack

- Next.js 16, React 19, and TypeScript strict mode
- tRPC 11 and Zod 4
- TanStack Query 5 for client cache, SSR hydration, and Infinite Scroll
- CSS and semantic HTML without a UI framework
- Vitest and Testing Library

## Requirements

- Node.js 24 or later
- npm 11 or later

## Installation and commands

```bash
npm install
npm run dev
```

Open `http://localhost:3000`. Use the following commands before delivery:

```bash
npm run lint
npm run typecheck
npm run test
npm run build
```

## Using the application

- `/` lists tasks, supports direct deletion, and loads later pages while scrolling.
- `/tasks/new` creates a task.
- `/tasks/:id/edit` loads and edits a task; a missing task is reported clearly.

The first list page is fetched in a Server Component and hydrated into TanStack Query. The client reuses the same infinite-query cache, avoiding an unnecessary initial browser request.

## tRPC procedures

| Procedure | Description |
| --- | --- |
| `task.create` | Creates a task with a server-generated UUID and UTC ISO timestamp. |
| `task.list` | Returns deterministic cursor-paginated task pages. |
| `task.getById` | Retrieves a task or returns `NOT_FOUND`. |
| `task.update` | Updates title and/or description while preserving immutable fields. |
| `task.delete` | Removes a task and returns structured success confirmation. |

## Storage and limitations

Tasks are held in a process-shared `Map<string, Task>`. This is a deliberate challenge constraint, not a production persistence strategy:

- Tasks disappear when the Node.js process restarts.
- State is not shared by multiple processes or instances.
- The application must run as one persistent Node.js process; it is not suitable for distributed/serverless deployment.
- A network replay after an uncertain create failure can create a duplicate task because no distributed idempotency key is required in this scope.

## Architecture and decisions

The project is a modular monolith: presentation calls tRPC, tRPC delegates to application services, and services use the in-memory repository. More detail is available in:

- [Architecture overview](docs/architecture/README.md)
- [Architecture Decision Records](docs/adr/README.md)
- [Build roadmap](docs/ROADMAP.md)
- [Testing architecture](docs/architecture/testing.md)
- [Concurrency analysis](docs/architecture/concurrency.md)
