# Testing Map of Content (MOC)

> Mocking patterns, test setups, and coverage standards.

---

## Runner

- **Vitest 5** — `npm test` / `pnpm test` (config: `vitest.config.ts`, environment `node`).
- Tests are colocated with sources under `src/` (`*.spec.ts`).

## Test Suites

| Suite | File | Focus |
|---|---|---|
| Vault Use Cases | `src/core/application/use-cases/vault.use-case.spec.ts` | Vault creation, listing by recency, cascading deletion, starter note creation |
| File Node Use Cases | `src/core/application/use-cases/file-node.use-case.spec.ts` | .md extension normalization, renaming, recursive folder deletion, markdown content save & read |

## Patterns

| Concern | Pattern |
|---|---|
| In-Memory Repository | Pure Map-backed implementation of port interface (`InMemoryVaultRepository`, `InMemoryFileRepository`) |
| Edge Case Validation | Table or isolated assertions on invalid input (empty vault name, non-existent file) |
| Cascading Deletion | Verify recursive collection of descendant folder/file IDs |

## Coverage Standard (Rule 5)

- 모든 use case·순수 함수·도메인 로직은 단위 테스트를 갖는다.
- Every use case and domain mapping must ship with a colocated `*.spec.ts`.
- 테스트는 `pnpm test` 또는 `npm test`로 실행되며, 완료 보고 전 전부 통과해야 한다.
