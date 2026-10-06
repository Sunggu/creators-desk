# Testing Map of Content (MOC)

> Mocking patterns, test setups, and coverage standards.

---

## Runner

- **Vitest 5** — `pnpm test` (config: `vitest.config.ts`).
- Two isolated projects so DOM-dependent specs never leak a `document` global into pure domain/application specs:

| Project | Environment | Include | Scope |
|---|---|---|---|
| `unit` | `node` | `src/**/*.spec.ts`, `scripts/**/*.spec.mjs` | domain, application, infrastructure, pure utils |
| `dom` | `jsdom` | `src/**/*.spec.tsx` | components, hooks, CodeMirror mounting |

- `src/test/setup-dom.ts` supplies the layout/observer APIs jsdom omits (`Range.getClientRects`, `ResizeObserver`, `IntersectionObserver`, `matchMedia`) so specs exercise real mount/unmount instead of mocking CodeMirror away.
- `pnpm run notices:check` 는 생성된 고지서가 최신인지 검증하며 `pnpm run build` 시 자동 실행된다.

## Test Suites

| Suite | File | Focus |
|---|---|---|
| Vault Use Cases | `src/core/application/use-cases/vault.use-case.spec.ts` | Vault creation, listing by recency, cascading deletion, starter note creation |
| File Node Use Cases | `src/core/application/use-cases/file-node.use-case.spec.ts` | .md extension normalization, renaming, recursive folder deletion, move guards |
| File Content Use Case | `src/core/application/use-cases/file-content.use-case.spec.ts` | Markdown body read/write, clock stamping, `file.notFound` |
| Note Editor Interactivity | `src/components/editor/editor-group-view.spec.tsx` | CodeMirror mounts editable, typed input reaches the doc, autosave fires, inline title rename works |
| Pane Overlay Contract | `src/components/editor/editor-group-view.spec.tsx` | No hit-test-intercepting overlay inside the editor pane; non-tab drags stay inert |
| Split Drop | `src/components/editor/split-drop.spec.tsx` | Edge thresholds, split direction per edge, centre drop ignored, preview double-click returns to edit |
| Editor Stats | `src/editor/editor-stats.spec.ts` | Word/char counting and cursor line/column derivation |
| Split Drop Edge | `src/utils/split-drop-edge.spec.ts` | Pure pointer→edge resolution, degenerate areas, threshold boundary |
| Wikilink Target | `src/utils/resolve-wikilink-target.spec.ts` | Case/`.md` tolerant matching, folders never resolve |
| Pane Handler Binding | `src/components/editor/editor-group-binding.spec.ts` | Group id injected into every grid callback, panes stay independent |
| Obsidian Syntax | `src/utils/obsidian-syntax.spec.ts` | `[[wikilinks]]`, `#tags`, marked output |
| Editor Grid Helpers | `src/hooks/use-editor-grid.spec.ts` | Split, collapse, reorder, ratio helpers |
| Licence Detection | `scripts/notices/detect-license.spec.mjs` | SPDX alias normalisation, license-field vs license-text fallback, copyright line extraction |
| Catalogue Merge | `scripts/notices/merge-catalog.spec.mjs` | Catalog overrides, unidentifiable licence as an error, missing copyright / stale entry as warnings |
| Notice Model | `scripts/notices/build-notice-model.spec.mjs` | Continuous numbering across sections, group ordering, per-licence text collection |
| Notice Rendering | `scripts/notices/render-notice.spec.mjs` | Standalone document shape, AGPL source offer, HTML escaping of package metadata, TOC anchors |
| Notice Integrity | `scripts/notices/notice-integrity.spec.mjs` | `notices/project.json` agrees with `LICENSE`, licence originals are canonical, and the committed `public/notice.html` / `THIRD-PARTY-NOTICES.txt` are up to date |
| Resource Bundles | `src/i18n/resources/resources.spec.ts` | Locale key parity, and that licence copy never claims a blanket commercial-use guarantee |

## Shared Test Doubles

| Helper | File | Purpose |
|---|---|---|
| `InMemoryFileRepository` | `src/test/in-memory-file.repository.ts` | Map-backed `FileRepository` |
| `InMemoryVaultRepository` | `src/test/in-memory-vault.repository.ts` | Map-backed `VaultRepository` |
| `InMemorySessionRepository` | `src/test/in-memory-session.repository.ts` | Map-backed `SessionRepository` |
| `T0` | `src/test/fixed-clock.ts` | Pinned instant shared by every use-case spec |
| `mountEditorPane` / `renderEditor` | `src/test/editor-pane-harness.tsx` | Pane/surface renderers with inert defaults and pinned geometry |
| `dispatchDrag` | `src/test/dispatch-drag.ts` | Real `dragover`/`drop` events; jsdom has no `DragEvent`/`DataTransfer` |
| `findHitTestOverlays` | `src/test/hit-test-overlay.ts` | Lists descendants that would intercept pointer input for a whole pane |

## Patterns

| Concern | Pattern |
|---|---|
| In-Memory Repository | Pure Map-backed implementation of a port interface, shared via `src/test/` |
| Edge Case Validation | Table or isolated assertions on invalid input (empty vault name, non-existent file) |
| Cascading Deletion | Verify recursive collection of descendant folder/file IDs |
| Infrastructure Stubbing | `vi.mock('../../infrastructure/di', importOriginal)` — swaps only the use case under test, keeps the rest real |
| Overlay Safety | Assert the structural invariant (nothing positioned over the pane may keep pointer events) rather than a pixel |
| Deferred State | `act()` around a dispatch so an armed drag edge is committed before the matching drop |

## Regression Guard: Editor Hit Testing

The note editor once became unclickable because a split-drop overlay rendered as a
`pointer-events-auto` absolute sibling on top of the whole pane, swallowing every
click, caret placement and selection inside CodeMirror.

`findHitTestOverlays` encodes the invariant that makes this unrepeatable:

> Any element positioned over the editor pane must declare `pointer-events: none`.

Reintroducing a full-bleed overlay fails `pane overlay contract` even though
jsdom has no layout engine. Decorative overlays declare `pointerEvents: 'none'`
as an **inline style**, not only as a Tailwind class, so the guarantee survives
utility purging and remains assertable.

## Coverage Standard (Rule 5)

- 모든 use case·순수 함수·도메인 로직은 단위 테스트를 갖는다.
- Every use case and domain mapping must ship with a colocated `*.spec.ts`.
- Presentation logic that can break interaction (mounting, pointer routing, focus) must ship a `*.spec.tsx` DOM spec.
- Any spec file stays under 200 lines; split by subject and share setup through `src/test/`.
- 테스트는 `pnpm test` 또는 `npm test`로 실행되며, 완료 보고 전 전부 통과해야 한다.