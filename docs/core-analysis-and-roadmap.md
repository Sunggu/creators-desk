# 코어 아키텍처 현황 분석 및 기술 개발 명세 (Core Gap Analysis & Specs)

> **문서 목적**: 현재 코어 개발 단계의 목표(클라우드 마크다운 에디터 + 파일 탐색기/창 분할/DnD + 마크다운 노드 연결 + 다중 모니터/브라우저 탭 포커스 자동 동기화) 대비 구축 현황을 진단하고, 구현해야 할 기술 과업을 정의한다. 모든 코딩 에이전트는 코어 작업 전 본 문서를 기준으로 삼는다.

---

## 1. 코어 단계의 본질과 설계 철학

1. **마크다운 기반 노드 에디터 (Beyond Obsidian Clone)**
   - 옵시디언은 UI/UX의 레퍼런스일 뿐이다. 본질은 **마크다운 파일 편집**, **직관적인 파일 탐색기**, 그리고 **마크다운 문서 간의 유기적인 노드 연결(Links/Backlinks/Graph)**이다.
2. **창 분할과 드래그 앤 드롭(DnD) 중심의 워크스페이스**
   - 오픈소스 에디터 엔진(CodeMirror 6) 위에서 에디터 본연의 기능에 집중한다.
   - 파일 탐색기와 탭/창 분할(Split View), 드래그 앤 드롭을 통해 사용자가 원하는 위치에 자유롭게 문서를 배치하고 비교·편집할 수 있는 레이아웃이 핵심이다.
3. **웹의 강점 극대화: 다중 모니터/탭 & 포커스 기반 무새로고침 동기화**
   - 데스크톱 앱과 달리 웹은 **여러 브라우저 탭/창을 띄워 다중 모니터에 배치**하고 각기 다른 문서나 경로를 동시에 편집할 수 있다.
   - 각 영역에서 작업한 내용은 서버를 통해 영속화되며, **사용자가 특정 브라우저 탭(화면)에 포커스할 때 새로고침(F5) 없이도 서버로부터 최신 변경사항을 자동 동기화**해야 한다.

---

## 2. 현재 코어 구축 현황 진단 (As-Is vs. Gap)

### 2.1 마크다운 에디터 코어 (`src/editor/`, `src/components/editor/`)
- **구축 완료**:
  - CodeMirror 6 기반 편집 뷰(`useMarkdownEditor`) 및 `marked` 기반 읽기 프리뷰(`ObsidianMarkdownPreview`) 분리.
  - 300ms 디바운스 자동 저장 및 탭 전환/언마운트 시 미저장 텍스트 즉시 플러시(flush-on-unmount).
  - 인라인 타이틀(`ObsidianInlineTitle`) 수정을 통한 실시간 파일명 변경.
- **한계 및 미구현 (Gap)**:
  - **전역 `viewMode` 결합**: `viewMode`(`edit` | `preview`)가 `ObsidianShell`에 단일 상태로 묶여 있어, 좌측 창은 편집 모드·우측 창은 읽기 모드로 띄우는 분할 활용이 불가능함.
  - **동일 파일 다중 창 동기화 부재**: 같은 파일을 두 분할 창에 동시에 열었을 때 각 창이 독립적인 `useNoteDocument` 상태를 가져 실시간 버퍼 공유가 안 됨.

### 2.2 파일 탐색기 & 창 분할 / 드래그 앤 드롭 (`src/hooks/use-editor-grid.ts`)
- **구축 완료**:
  - 계층형 폴더/파일 트리, `Shift`/`Ctrl` 다중 선택(`useTreeSelection`), 폴더 간 DnD 이동, 컨텍스트 메뉴.
  - 단일 그룹 내 탭 순서 변경(`reorderTabsHelper`) 및 우측/하단 가장자리 탭 드롭 분할(`useSplitDropTarget`).
  - 오버레이가 에디터 클릭을 막지 않도록 `pointer-events: none` 불변식 및 테스트(`hit-test-overlay.ts`) 구축.
- **한계 및 미구현 (Gap)**:
  - **최대 2분할(2-Pane) 고정 한계**: `ResizableEditorGrid`가 `const [first, second] = layout.groups`만 렌더링하며, 이미 2분할된 상태에서 추가 분할 시 새 창이 열리지 않고 기존 창에 탭만 추가됨(`splitGroupHelper`). 수평+수직 중첩 분할(Nested Split Grid) 불가.
  - **분할 창 간 탭 드래그 이동(Cross-Pane Move) 미동작**: A 그룹의 탭을 B 그룹 탭 바로 드래그할 때 `reorderTabsHelper`가 단일 그룹 내부 재배열만 처리하여 그룹 간 탭 이동이 작동하지 않음.
  - **드롭 엣지 방향 부족**: 우측(`right`)·하단(`bottom`) 분할만 존재하며, 좌측(`left`)·상단(`top`) 분할 및 중앙(`center`, 해당 창으로 탭 합치기) 드롭존이 없음.
  - **파일 탐색기 → 에디터 DnD 단절**: 탐색기 아이템(`FileTreeItem`)은 `text/plain`만 전달하고 에디터 드롭존은 `TAB_DRAG_MIME`만 허용하여, 탐색기에서 파일을 끌어 에디터 탭이나 분할 창으로 여는 기능이 없음.

### 2.3 마크다운 파일 간 노드 연결 (`src/utils/wikilink-parser.ts`, `src/server/routes/files.ts`)
- **구축 완료**:
  - 본문 저장 시(`PUT /:key/files/:id/content`) `[[WikiLink]]`를 파싱하여 DB `links` 테이블에 적재하고 FTS5(`notes_fts`)에 색인.
  - 읽기 뷰(`ObsidianMarkdownPreview`)에서 `[[WikiLink]]` 클릭 시 대상 노트로 이동(`useWikilinkNavigation`).
- **한계 및 미구현 (Gap)**:
  - **노드 연결 조회 API 및 백링크/그래프 UI 전무**: 서버가 `links` 테이블에 쓰기만 할 뿐, 백링크(이 문서를 참조하는 문서 목록)나 아웃고잉 링크, 전체 노드 그래프를 반환하는 `GET` API와 우측 사이드바 백링크/그래프 패널이 없음.
  - **편집 모드 내 위키링크 경험 부재**: CodeMirror 편집 모드에서 `[[` 입력 시 파일명 자동완성 팝업, 에디터 내 링크 클릭 이동, 미생성 노트(`[[새 노트]]`) 클릭 시 즉시 파일 생성 후 이동(Click-to-Create)이 없음.
  - **파일명 변경 시 링크 리팩토링 부재**: 파일 이름 변경 시 다른 문서 본문의 `[[기존이름]]`이나 `links` 테이블의 참조가 자동 갱신되지 않음.
  - **검색 패널의 로컬 캐시 한계**: 서버에 FTS5 검색 API(`GET /:key/search`)가 있으나 프론트엔드 `SearchPanel`은 이를 호출하지 않고 메모리에 캐시된 일부 파일만 검색함.

### 2.4 다중 브라우저 탭/모니터 & 서버 포커스 동기화 (`src/infrastructure/storage/http-file.repository.ts`)
- **구축 완료**:
  - Hono API 기반 D1/R2(SaaS) 및 SQLite/FS(Self-host) 엔드-투-엔드 CRUD 연동.
- **한계 및 미구현 (Gap) — 핵심 병목**:
  - **URL 라우팅 부재 및 `localStorage` 세션 충돌**: URL에 볼트/파일 경로가 반영되지 않고 `localStorage` 단일 키(`creators_desk_active_file_*`)만 사용하여, 다중 모니터에 여러 브라우저 탭을 띄우면 각 탭의 세션이 서로를 덮어씀.
  - **`HttpFileRepository` 인메모리 캐시 고착화**: `this.cache`에 한 번 `content`가 적재되면 이후 `findById`나 `findByVaultId` 호출 시에도 서버의 최신 본문을 다시 가져오지 않고 구버전 메모리 캐시를 영구 반환함(`http-file.repository.ts` L30-31, L47).
  - **포커스(`focus` / `visibilitychange`) 및 탭 간 자동 동기화 전무**: 다른 모니터/탭에서 수정한 뒤 현재 브라우저 탭으로 포커스를 옮겨도 파일 트리나 열린 문서 본문을 서버에 재요청(Revalidate)하지 않음.
  - **CodeMirror 비파괴적 동기화 미지원**: `useMarkdownEditor`가 `initialContent` 변경 시 에디터 인스턴스를 `destroy()` 후 재생성하도록 되어 있어, 외부 동기화 시 커서/스크롤/히스토리가 초기화될 위험이 있음.

---

## 3. 코어 완성을 위한 기술 개발 과업 (To-Be Engineering Roadmap)

### Track 1: 다중 모니터/탭 라우팅 & 포커스 기반 무새로고침 동기화 (구현 완료)
- [x] **T1-1. URL 상태 라우팅 및 탭별 독립 세션** (`src/utils/workspace-url.ts`, `src/infrastructure/storage/local-session.repository.ts`):
  - URL 쿼리(`/?vault={vaultId}&file={fileId}`)와 브라우저 히스토리를 연동하여 새 탭/새 창으로 원하는 노트를 독립적으로 띄울 수 있도록 구현.
  - 탭 고유 세션은 URL 쿼리 → `sessionStorage`(탭 격리) → `localStorage` 폴백 순으로 분리 저장.
- [x] **T1-2. `HttpFileRepository` 스마트 캐시 무효화 (`updatedAt` 기반)** (`src/infrastructure/storage/http-file.repository.ts`):
  - `findByVaultId`로 받은 서버의 `updatedAt`이 캐시된 노드의 `updatedAt`과 다르면 캐시된 `content`를 즉시 무효화(`undefined`)하여 재요청하도록 구현.
  - `invalidateContent(id)` 메서드를 통한 명시적 캐시 무효화 지원.
- [x] **T1-3. 포커스(`window.focus` / `visibilitychange`) 및 `BroadcastChannel` 동기화 훅** (`src/hooks/use-workspace-sync.ts`, `src/utils/workspace-sync-channel.ts`):
  - 다른 모니터/탭에서 작업 후 화면을 포커스할 때 자동으로 파일 트리(`refreshNodes`)와 현재 열린 문서를 백그라운드 재검증.
  - 동일 브라우저 내 다중 탭 간에는 `BroadcastChannel('creators_desk_sync')`로 파일 저장(`file-saved`) 및 트리 변경(`tree-changed`) 이벤트를 즉시 브로드캐스트.
- [x] **T1-4. CodeMirror 무새로고침 본문 핫스왑 (Non-Destructive Dispatch)** (`src/editor/use-markdown-editor.ts`, `src/components/editor/use-note-document.ts`):
  - `useMarkdownEditor`에서 원격 본문 갱신 시 에디터를 파괴하지 않고, 미저장 디바운스가 없을 때 `view.dispatch({ changes, selection })`로 커서와 스크롤을 유지한 채 본문만 교체.

### Track 2: 창 분할(Split View) & 드래그 앤 드롭(DnD) 워크스페이스 완성 (구현 완료)
- [x] **T2-1. 그룹 간 탭 이동(Cross-Pane Tab Move)**:
  - `useEditorGrid`의 `reorderTabsHelper`에서 다른 분할 그룹으로부터 드래그해 온 탭을 목표 위치에 삽입하고, 원본 그룹이 비면 자동 축소(collapse)하도록 구현.
- [x] **T2-2. 파일 탐색기 → 에디터 탭/분할 영역 직접 드래그 앤 드롭** (`src/components/sidebar/file-tree-item.tsx`):
  - 탐색기 파일 드래그 시 `TAB_DRAG_MIME`을 함께 부여하여, 탭 바에 놓으면 탭 열기/이동, 에디터 가장자리에 놓으면 즉시 분할 창으로 열기 지원.
- [x] **T2-3. 다중 창 분할(`MAX_SPLIT_GROUPS = 4`) 및 그룹별 독립 `viewMode`** (`src/hooks/use-editor-grid.ts`, `src/components/editor/resizable-editor-grid.tsx`):
  - `EditorGroupDto`에 `viewMode`를 추가하고 `setGroupViewMode`를 지원하여 분할 창마다 편집/읽기 모드를 개별 전환 가능하도록 확장.
  - 2분할 한계를 넘어 최대 4개 분할 그룹 렌더링 지원.

### Track 3: 마크다운 노드 연결 (Node Graph & Backlinks Core) (구현 완료)
- [x] **T3-1. 백링크·아웃고잉 링크·노드 그래프 API 및 파일명 변경 시 링크 리팩토링** (`src/server/routes/links.ts`, `src/server/routes/files.ts`):
  - `GET /api/vaults/:key/files/:id/links` (백링크 및 나가는 링크 목록) 및 `GET /api/vaults/:key/links` (전체 파일 노드 및 엣지) 엔드포인트 추가.
  - 파일 이름 변경(`PATCH /:key/files/:id`) 시 `links` 테이블의 `target_file_name` 참조 자동 갱신.
- [x] **T3-2. 우측 사이드바 노드 연결(Backlinks) 패널** (`src/components/sidebar/backlinks-panel.tsx`, `src/components/sidebar/right-sidebar-panel.tsx`, `src/utils/compute-node-connections.ts`):
  - `RightSidebarPanel`에 탭(`Outline` / `Links`)을 구성하여 현재 문서의 백링크(Incoming)와 나가는 링크(Outgoing)를 탐색 및 클릭 이동.
- [x] **T3-3. 미생성 노트 클릭 시 즉시 생성(Click-to-Create) & FTS5 검색 연동** (`src/components/layout/use-wikilink-navigation.ts`, `src/components/sidebar/search-panel.tsx`):
  - 미생성 `[[노트]]` 클릭 시 자동으로 마크다운 파일을 생성하며 열기 지원.
  - `SearchPanel`을 서버 FTS5 API(`GET /api/vaults/:key/search`)와 연결하여 본문 전문 검색 결과 병합.
