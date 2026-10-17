# Creators Desk 로드맵 (Cloud Markdown & Node Workspace)

> **현재 단계**: 코어 고도화 단계 (노드 연결 · 창 분할/DnD · 다중 모니터/탭 포커스 자동 동기화)
> - 상세 현황 분석 및 기술 개발 과업(Track 1~3): [core-analysis-and-roadmap.md](file:///home/horuru/Documents/Writer/creators-desk/docs/core-analysis-and-roadmap.md)
> - 다중 코딩 에이전트 협업 규칙: [agent-collaboration.md](file:///home/horuru/Documents/Writer/creators-desk/docs/agent-collaboration.md)

---

## 1. 제품 정의

**"마크다운 에디터와 파일 탐색기, 마크다운 파일 간 노드 연결을 클라우드/웹 워크스페이스로 구현한다."**

- 옵시디언은 UI/UX의 예시일 뿐이며, 핵심 본질은 **마크다운 에디터 + 계층형 파일 시스템 + 문서 간 노드 연결(Links/Backlinks/Graph)**이다.
- **웹페이지의 강점 극대화**:
  - 여러 경로로 브라우저 탭/창을 띄워 **다중 모니터**에서 원하는 문서들을 자유롭게 배치·편집할 수 있다.
  - 각 영역에서 작업한 내용은 서버(Cloudflare D1/R2 또는 Self-Host SQLite/FS)를 통해 동기화되며, **포커스한 화면에서 새로고침(F5) 없이도 최신 데이터가 자동 반영**된다.

---

## 2. 핵심 기술 아키텍처

- **에디터 코어**: **CodeMirror 6 (CM6)** + **marked (Reading Preview)**
  - 마크다운 텍스트 원본이 Single Source of Truth로 유지됨.
  - 300ms 디바운스 자동 저장 및 탭 전환/언마운트 시 즉시 플러시(flush-on-unmount).
- **듀얼 타깃 스토리지 & 서버 동기화**:
  - **Hono Universal API** (`/api/vaults`, `/api/files`, `/api/search`): Cloudflare D1+R2(SaaS) 및 SQLite+로컬 FS(Docker 셀프호스팅) 동시 지원.
  - **Client Adapter**: `HttpVaultRepository` / `HttpFileRepository` + 오프라인 `IndexedDB` 폴백.

---

## 3. 단계별 진행 현황 및 로드맵

### Phase 1: Vault 관리 & 듀얼 스토리지 기반 (완료)
- [x] Vault 도메인 DTO(`key` 불변 식별자 / `alias` 가변 표시명) 및 Repository 포트 정의
- [x] Hono 백엔드(D1/R2 & SQLite/FS) + HTTP 클라이언트 어댑터 + IndexedDB 오프라인 폴백 구축
- [x] Vault 생성, 목록 조회, 이름 변경, 삭제 Use Case 및 단위 테스트
- [x] Vault 선택기 모달 & `localStorage` 기반 초기 세션 복원

### Phase 2: 파일 트리 탐색기 & 기본 워크스페이스 셸 (완료)
- [x] Vault 내 폴더 및 파일(`.md`) 엔티티/DTO 및 계층형 CRUD 구현
- [x] 좌측 사이드바 계층형 파일 트리 뷰, 다중 선택(`Shift`/`Ctrl`), 폴더 간 드래그 앤 드롭 이동
- [x] 인라인 타이틀(`ObsidianInlineTitle`) 기반 파일명 실시간 변경
- [x] 데스크톱 3-Pane 셸 및 모바일 반응형 오프캔버스 드로워(`MobileDrawer`)

### Phase 3: 마크다운 에디터 코어 & 기초 창 분할 (완료)
- [x] CodeMirror 6 기반 마크다운 에디터 연동 및 상태바 통계(단어/문자/줄/커서) 계산
- [x] 타이핑 실시간 자동 저장(Debounce 300ms + Flush on Unmount)
- [x] 편집 모드(Edit) / 읽기 프리뷰(Preview) 전환 및 기초 2-Pane 창 분할(`useEditorGrid`)
- [x] 탭 순서 드래그 변경 및 우측/하단 가장자리 탭 드롭 분할(`SplitDropOverlay`)

### Phase 4: 클라우드 워크스페이스 코어 완성 (완료)
> 세부 기술 명세 및 체크리스트는 [core-analysis-and-roadmap.md](file:///home/horuru/Documents/Writer/creators-desk/docs/core-analysis-and-roadmap.md)에서 관리합니다.

- [x] **Track 1 (다중 모니터 & 포커스 동기화)**:
  - URL 라우팅/쿼리 기반 다중 브라우저 탭 독립 세션 지원 (`workspace-url.ts`, `local-session.repository.ts`)
  - `HttpFileRepository`의 `updatedAt` 기반 캐시 무효화
  - `window.focus` / `visibilitychange` 및 `BroadcastChannel` 기반 무새로고침 자동 동기화 (`useWorkspaceSync`)
  - CodeMirror 비파괴적(Non-destructive `view.dispatch`) 원격 본문 핫스왑
- [x] **Track 2 (창 분할 & 드래그 앤 드롭 고도화)**:
  - 분할 창 간 탭 드래그 이동(Cross-Pane Tab Move) 및 빈 그룹 자동 축소
  - 파일 탐색기 → 에디터 탭/분할 영역 직접 드래그 앤 드롭(`TAB_DRAG_MIME`)
  - 최대 4분할 그리드 확장 및 분할 그룹별 독립 `viewMode` 지원
- [x] **Track 3 (마크다운 파일 노드 연결 코어)**:
  - 백링크(Backlinks) / 아웃고잉 링크 / 노드 그래프 조회 API (`links.ts`) 및 우측 사이드바 연결 패널 (`BacklinksPanel`)
  - 미생성 `[[위키링크]]` 클릭 시 노트 자동 생성(Click-to-Create) 및 파일명 변경 시 링크 자동 갱신
  - `SearchPanel`과 서버 FTS5 전문 검색 API 연동