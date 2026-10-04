# ADR: 프론트엔드 HTTP API 클라이언트 및 엔드-투-엔드 동기화 파이프라인 구축

- **날짜**: 2026-10-04
- **상태**: Approved
- **작성자**: Antigravity Agent & User Pair

---

## 1. 배경 및 필요성 (Context & Motivation)

기존 클라이언트 환경은 브라우저 `IndexedDB`에 직접 데이터를 저장하고 있었습니다. 그러나 제품의 핵심 목표는 다음 두 가지 배포 모델을 단일 코드베이스로 완벽히 지원하는 것입니다:
1. **Cloudflare SaaS 배포**: D1 (메타데이터 및 FTS5 전문 검색) + R2 (마크다운 원문 스트리밍).
2. **독립형 오픈소스 셀프호스팅**: 로컬 SQLite + 로컬 파일 시스템 (FS) + Docker 컨테이너.

사용자는 볼트의 불변 고유 키(`key`, 예: `vlt_xxxx`)와 가변 표시 이름(`alias`)을 기반으로 클라우드 스토리지에 안정적으로 노트가 저장되고 색인되는 엔드-투-엔드 연동을 요청하였습니다.

---

## 2. 핵심 구현 내용 (Key Implementations)

### ① HTTP 저장소 어댑터 구현 (`src/infrastructure/storage/`)
- **`HttpVaultRepository`**:
  - `GET /api/vaults`: 볼트 목록 조회 및 클라이언트 메모리 캐시 갱신.
  - `POST /api/vaults`: 불변 `key` 생성 및 볼트 등록.
  - `PATCH /api/vaults/:key`: 볼트 이름(`alias`) O(1) 수정.
  - `DELETE /api/vaults/:key`: 볼트 삭제.
  - 네트워크 단절 및 오프라인 환경에 대비하여 `IndexedDbVaultRepository`를 Fallback으로 유지.
- **`HttpFileRepository`**:
  - `GET /api/vaults/:key/files`: 파일 노드 메타데이터 목록 조회.
  - `POST /api/vaults/:key/files`: 파일/폴더 생성 및 초기 본문 업로드.
  - `GET /api/vaults/:key/files/:id/content`: 파일 본문 지연 로딩(Lazy Fetching).
  - `PUT /api/vaults/:key/files/:id/content`: 300ms 디바운스 자동 저장 및 FTS5/위키링크 자동 재색인.
  - `PATCH /api/vaults/:key/files/:id`: 인라인 타이틀 및 탐색기 파일명 변경.
  - `DELETE /api/vaults/:key/files/:id`: 파일 및 하위 폴더 노드 재귀 삭제.

### ② Vite 개발 서버 미들웨어 (`vite.config.ts`)
- Vite 개발 환경(`pnpm dev`)에서 별도의 백엔드 프로세스를 띄울 필요 없이, Vite의 `server.ssrLoadModule`과 `@hono/node-server`의 `getRequestListener`를 활용한 `honoDevPlugin()`을 구현하였습니다.
- 개발 모드에서도 `/api/*` 요청이 Universal Hono 앱(로컬 SQLite + FS)과 투명하게 연동됩니다.

### ③ 모바일 UI 및 옵시디언 사용성 개선
- 모바일 드로워 메뉴에서 파일 선택 또는 새 파일 생성 시 드로워가 자동으로 닫히도록 개선하여 터치 즉시 에디터에 집중할 수 있도록 하였습니다.
- `ObsidianInlineTitle`에서 엔터 키 입력 시 즉시 CodeMirror 에디터 본문으로 포커스가 이동합니다.

---

## 3. 검증 결과 (Verification Results)

1. **단위 테스트**: 8개 테스트 스위트, 31개 단위 테스트 100% 통과 (`npm test`).
2. **프로덕션 빌드**:
   - `build:client`: Vite React SPA 번들 생성 완료.
   - `build:server`: Node 독립형 서버 번들 (14 kB) 생성 완료.
3. **독립형 엔드-투-엔드 검증**:
   - `PORT=3098 node dist-server/node-server.js` 구동 후 `curl`을 통한 볼트 생성, 파일 생성, 본문 스트리밍, 인라인 이름 변경(`PATCH`), FTS5 전문 검색 (`/api/vaults/:key/search?q=...`) 정상 동작 확인.
4. **파일 크기 제약**: 모든 변경 및 신규 파일이 200줄 제한을 엄격히 준수.
