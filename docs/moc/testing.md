# Testing Map of Content (MOC)

> Mocking patterns, test setups, and coverage standards.

---

## Runner

- **Vitest 5** — `npm test` / `pnpm test` (config: `vitest.config.ts`, environment `node`).
- Tests are colocated with sources (`src/**/*.spec.ts`, `scripts/**/*.spec.mjs`).
- `npm run notices:check` 는 생성된 고지서가 최신인지 검증하며 `npm run build` 시 자동 실행된다.

## Test Suites

| Suite | File | Focus |
|---|---|---|
| Vault Use Cases | `src/core/application/use-cases/vault.use-case.spec.ts` | Vault creation, listing by recency, cascading deletion, starter note creation |
| File Node Use Cases | `src/core/application/use-cases/file-node.use-case.spec.ts` | .md extension normalization, renaming, recursive folder deletion, markdown content save & read |
| Licence Detection | `scripts/notices/detect-license.spec.mjs` | SPDX alias normalisation, license-field vs license-text fallback, copyright line extraction |
| Catalogue Merge | `scripts/notices/merge-catalog.spec.mjs` | Catalog overrides, unidentifiable licence as an error, missing copyright / stale entry as warnings |
| Notice Model | `scripts/notices/build-notice-model.spec.mjs` | Continuous numbering across sections, group ordering, per-licence text collection |
| Notice Rendering | `scripts/notices/render-notice.spec.mjs` | Standalone document shape, AGPL source offer, HTML escaping of package metadata, TOC anchors |
| Notice Integrity | `scripts/notices/notice-integrity.spec.mjs` | `notices/project.json` agrees with `LICENSE`, licence originals are canonical, and the committed `public/notice.html` / `THIRD-PARTY-NOTICES.txt` are up to date |
| Resource Bundles | `src/i18n/resources/resources.spec.ts` | Locale key parity, and that licence copy never claims a blanket commercial-use guarantee |

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
