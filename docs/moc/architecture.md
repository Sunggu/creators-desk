# Architecture Map of Content (MOC)

> Layer rules, dependency graph, interface contracts, dual-target infrastructure, and indexing pipeline.

---

## 1. Layers & Dependency Flow

```
Presentation Layer (React Components, Custom Hooks)
       ↓
Application Layer (Use Cases, Repository Ports)
       ↓
Infrastructure Layer (Storage Adapters: Cloudflare D1/R2, Docker SQLite/FS, Browser IndexedDB)
       ↓
Domain Layer (Pure DTOs, Entities, Invariants)
```

- **Domain** (`src/core/domain/`) — 순수 데이터 구조 및 엔티티 DTO. 프레임워크나 외부 SDK 의존성 없음.
- **Application** (`src/core/application/`) — 비즈니스 유스케이스 및 저장소 포트(인터페이스). DOM, HTTP 종속 없음.
- **Infrastructure** (`src/infrastructure/`, `functions/api/`) — 포트를 구현하는 콘크리트 어댑터 (D1, R2, SQLite, IndexedDB) 및 Hono API 엔드포인트.
- **Presentation** (`src/components/`, `src/hooks/`) — React UI 셸, CodeMirror 에디터 뷰, 상태 훅.
- **Editor Module** (`src/editor/`) — CodeMirror 전용 수명주기·테마·통계 계산. 컴포넌트와 훅이 공유하며, CodeMirror 구현이 두 벌로 분기하지 않도록 단일 진입점을 둔다.
- **Test Support** (`src/test/`) — 인메모리 포트 더블, DOM 하네스, 오버레이 계약 검사기. 프로덕션 번들에 포함되지 않는다.

---

## 2. Dual-Target Infrastructure Contracts

| Port | Description | SaaS Adapter (Cloudflare) | Self-Host Adapter (Docker) | Client HTTP Adapter | Offline Fallback |
|---|---|---|---|---|---|
| `VaultRepository` | 볼트 생성, 목록, Alias 변경, 삭제 | `CloudflareDbAdapter` (D1) | `LocalSqliteDbAdapter` (SQLite) | `HttpVaultRepository` | `IndexedDbVaultRepository` |
| `FileRepository` | 파일/폴더 트리 메타데이터 관리 | `CloudflareDbAdapter` (D1) | `LocalSqliteDbAdapter` (SQLite) | `HttpFileRepository` | `IndexedDbFileRepository` |
| `FileStoragePort` | 마크다운 원문 및 첨부파일 저장/스트리밍 | `CloudflareR2StorageAdapter` (R2) | `LocalFsStorageAdapter` (FS) | `HttpFileRepository` (`PUT/GET /content`) | Browser IndexedDB |
| `SessionRepository` | 활성 볼트 및 최근 파일 세션 보관 | `LocalSessionRepository` | `LocalSessionRepository` | `LocalSessionRepository` | `LocalSessionRepository` |

---

## 3. Core Invariants

### ① Vault Identity: Immutable Key vs Mutable Alias
- **`key` (불변 고유 키)**: `vlt_xxxx` 형태의 영구 식별자. R2 및 디스크 파일 경로(`vaults/{key}/...`)의 루트로 사용.
- **`alias` (가변 표시 이름)**: 사용자가 에디터에서 자유롭게 수정하는 이름. R2 객체 복사 없이 DB의 `alias` 컬럼만 O(1)로 갱신.

### ② 3단계 하이브리드 색인 파이프라인
1. **위키링크 & 백링크 (`links` 테이블)**: 마크다운 파싱 시 `[[Note]]`와 `#tag`를 D1/SQLite 관계형 테이블에 색인.
2. **전문 검색 (`notes_fts` 가상 테이블)**: SQLite 내장 FTS5 엔진 기반 BM25 전문 검색.
3. **AI 시맨틱 색인 (Cloudflare Vectorize)**: 노트 본문 벡터 임베딩을 통한 RAG 지식 생성.

### ③ 상태 소유권은 하나뿐이다

| 상태 | 유일한 소유자 | 비고 |
|---|---|---|
| 열린 탭 목록, 그룹 분할, 활성 파일(그룹별) | `useEditorGrid` | 탭 UI의 단일 진실 원천 |
| 파일 트리(`nodes`)와 세션 복원 | `useActiveWorkspace` | 활성 파일은 grid와 동기화되는 미러일 뿐 |
| 뷰 모드(edit/preview), 사이드바/패널 열림 상태, 모바일 드로워 열림 상태 | `ObsidianShell` | 드로워 상태는 데스크톱 패널 상태와 **분리**되어 있으므로 폰이 데스크톱 상태를 상속하지 않는다 |
| 노트 본문 로드/저장 | `useNoteDocument` → `FileContentUseCase` | 컴포넌트가 저장소를 직접 호출하지 않는다 |

두 훅이 같은 값을 들고 있으면 한쪽 갱신이 다른 쪽에서 덮인다. 동기화 규칙은
`useWorkspaceCommands` 한 곳에만 존재한다(`docs/moc/ui-components.md` 참고).

### ④ 에디터 상호작용을 막는 오버레이 금지

에디터 pane 위에 겹치는 요소는 반드시 `pointer-events: none`이어야 한다.
드래그 핸들러는 오버레이가 아닌 pane 컨테이너에 바인딩한다.
이 불변식은 `src/test/hit-test-overlay.ts`와 `pane overlay contract` 테스트가 강제한다.

### ⑤ 개발/프로덕션 런타임 투명성
- **로컬 개발 (`pnpm dev`)**: Vite 개발 서버 내부에서 `honoDevPlugin()`을 통해 `/api/*` 요청을 Hono 앱으로 직접 바인딩 (Local SQLite + FS 연동).
- **독립형 셀프호스팅 (`pnpm serve` / Docker)**: `@hono/node-server` 단일 프로세스에서 React 정적 빌드 및 Universal Hono API 동시 서빙 (<30MB RAM).
- **클라우드 SaaS (Cloudflare Pages)**: `functions/api/[[route]].ts`를 통해 Cloudflare Edge에서 D1 및 R2와 직접 통신.

---

## 4. Feature Map

| Feature | Use Cases | Primary Components / Adapters |
|---|---|---|
| Vault Management | `ManageVaultUseCase`, `ListVaultsUseCase` | `ObsidianShell`, `ObsidianVaultModal`, `HttpVaultRepository` |
| Inline Title & Explorer | `ManageFileNodeUseCase` | `ObsidianInlineTitle`, `ObsidianSidebar`, `HttpFileRepository` |
| Primary Sidebar Panels | `SidebarPanelContainer` | `SidebarPanelBody`, `SearchPanel`, `ObsidianSidebar` |
| Mobile Drawer | — | `MobileDrawer`, `ObsidianMobileHeader`, `useDrawerGesture`, `resolveDrawerSwipe` |
| Icon System | — | `MonochromeIcon`, `ICON_PATHS` |
| Resizable Grid Editor | `useEditorGrid`, `useResizable`, `useSplitDropTarget` | `ResizableEditorGrid`, `EditorGroupPane`, `EditorGroupView`, `GridSplitter`, `SplitDropOverlay` |
| Settings & Open-Source Notice | `scripts/generate-notices.mjs` (build-time) | `SettingsModal`, `OpenSourceLicensesView`, `LicenseNoticeCard`, `SourceCodeOffer`, `public/notice.html` |
| CodeMirror Markdown | `FileContentUseCase` | `src/editor/use-markdown-editor.ts`, `src/editor/editor-stats.ts`, `src/editor/obsidian-editor-theme.ts`, `ObsidianMarkdownView`, `ObsidianEditor`, `HttpFileRepository` |
| Hono Universal API | `/api/vaults`, `/api/files`, `/api/search` | `src/server/app.ts`, `src/server/routes/*`, `functions/api/[[route]].ts` |

