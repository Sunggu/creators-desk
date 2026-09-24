# Testing MOC

> Mocking patterns, test setups, and coverage standards.
> Target dirs: `src/**/*.spec.ts`.

## Runner

- **Vitest 5** — `pnpm test` (config: `vitest.config.ts`, environment `node`).
- Tests are colocated with sources under `src/` (`*.spec.ts`).

## Patterns

| Concern | Pattern |
|---|---|
| Use case logic | Build a fake repository via object literal, assert mapped view model |
| Pure mapping | Table-driven `it.each` over input → expected output |
| Server-side normalization | Import the normalizer from its source and feed raw input |
| Failure paths | Repository that `throw`s → expect fallback/`unavailable` shape |

## Coverage Standard (Rule 5)

- Every use case and domain mapping must ship with a colocated `*.spec.ts`.
- Any new backend input → DTO normalization must be covered by a unit test.
- CI gate: all tests pass before reporting completion.