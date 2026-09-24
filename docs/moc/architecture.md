# Architecture MOC

> Layer rules, dependency graph, and interface contracts.
> Target dirs: `src/core/`, `src/infrastructure/`, `src/hooks/`, `src/components/`.

## Layer Boundaries

Unidirectional dependency flow (outer → inner only):

```
Presentation (components/) → Hooks → Application (use-cases/ports)
Infrastructure (adapters) → Application ports → Domain (DTOs/entities)
```

- **Domain** (`src/core/domain/`) — pure data shapes (DTOs). No framework imports.
- **Application** (`src/core/application/`) — repository *ports* (interfaces) and *use cases* (pure business logic). No DOM, no HTTP.
- **Infrastructure** (`src/infrastructure/`) — concrete adapters that implement ports (e.g. HTTP fetch wrapper).
- **Presentation** (`src/components/`, `src/hooks/`) — React components and data-fetching hooks only.

## Contracts

| Port | Port location | Adapter | Adapter location |
|---|---|---|---|
| `TailscaleStatusRepository` | `src/core/application/ports/tailscale-status.repository.ts` | `HttpTailscaleStatusRepository` | `src/infrastructure/tailscale/http.tailscale-status.repository.ts` |

## Tailscale Status Feature Map

| Layer | File | Responsibility |
|---|---|---|
| Route/server | `server/tailscale-status.plugin.ts` | Vite dev middleware: runs `tailscale status --json`, normalizes to `TailscaleStatusPayload` |
| Domain | `src/core/domain/tailscale-status.dto.ts` | `TailscaleStatusDto` shape |
| Application | `src/core/application/use-cases/get-tailscale-status.ts` | `BackendState` → `TailscaleStatusKind` mapping + `TailscaleStatusViewModel` |
| Infrastructure | `src/infrastructure/tailscale/http.tailscale-status.repository.ts` | fetches `/api/tailscale/status` with timeout, throws on non-OK |
| Hook | `src/hooks/use-tailscale-status.ts` | 10s polling of `getTailscaleStatus` |
| UI | `src/components/tailscale-status-card.tsx` | renders the status card (Lego block) |

### Runtime contract

- `GET /api/tailscale/status` → `200` with `TailscaleStatusPayload` (normalized from `tailscale status --json`).
- `502` with `{ message }` when the `tailscale` CLI is missing or fails → surfaced as `kind: 'unavailable'`.
- Browser → same-origin Vite dev middleware (no CORS). Static `build` output has no endpoint; card falls back to `unavailable`.