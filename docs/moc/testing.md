# Testing Map of Content (MOC)

> Mocking patterns, test setups, and coverage standards.

---

## Runner

- **Vitest 5** — `npm test` / `pnpm test` (config: `vitest.config.ts`, environment `node`).
- Tests are colocated with sources under `src/` (`*.spec.ts`).

## Patterns

아직 확립된 패턴 없음. 첫 use case 추가 시 아래 표에 패턴을 확정한다.

| Concern | Pattern |
|---|---|
| Use case logic | Build a fake repository via object literal, assert mapped view model |
| Pure mapping | Table-driven `it.each` over input → expected output |
| Server-side normalization | Import the normalizer from its source and feed raw input |
| Failure paths | Repository that `throw`s → expect fallback/`unavailable` shape |

## Coverage Standard (Rule 5)

- 모든 use case·순수 함수·도메인 로직은 단위 테스트를 갖는다.
- Every use case and domain mapping must ship with a colocated `*.spec.ts`.
- 테스트는 `pnpm test` 또는 `npm test`로 실행되며, 완료 보고 전 전부 통과해야 한다.
