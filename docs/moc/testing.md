# Testing MOC

> Mocking patterns, test setups, and coverage standards.
> Target dirs: `src/**/*.spec.ts`.

## Runner

- **Vitest 5** — `pnpm test` (config: `vitest.config.ts`, environment `node`).
- Tests are colocated with sources under `src/` (`*.spec.ts`).

## Patterns

| Concern | Pattern |
|---|---|
| Use case logic | Build a fake `TailscaleStatusRepository` via object literal, assert mapped view model |
| Pure mapping (`toTailscaleStatusViewModel`) | Table-driven `it.each` over `BackendState` → `TailscaleStatusKind` |
| Server-side normalization | Import `normalizeTailscaleCliOutput` from the Vite plugin and feed raw CLI JSON |
| Failure paths | Repository that `throw`s → expect `kind: 'unavailable'` with empty `tailscaleIps` |

## Coverage Standard (Rule 5)

- Any new backend-state mapping or DTO field must be covered in `src/core/application/use-cases/get-tailscale-status.spec.ts`.
- Any new CLI output → payload normalization must be covered in `src/server/tailscale-status.plugin.spec.ts` (mirrors `server/` logic into `src/server/` for isolation).
- CI gate: all tests pass before reporting completion.