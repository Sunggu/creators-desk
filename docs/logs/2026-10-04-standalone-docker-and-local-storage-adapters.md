# 의사결정 일지 (ADR): Cloudflare 무의존 로컬 독립 실행(Standalone) 및 Docker 셀프호스팅 어댑터 구축

> 일자: 2026-10-04  
> 상태: 승인 (Approved) 및 구현 완료  
> 참여자: 프로젝트 리더, 개발 에이전트  

---

## 1. 배경 및 문제 상황 (Context)

- 프로젝트 리더의 원격(Headless/SSH) 접속 환경에서는 웹 브라우저가 뜨지 않아 `wrangler login` OAuth 인증을 수행하기 어려움.
- 오픈소스 셀프호스팅 사용자에게 Cloudflare 가입 및 D1/R2 설정을 강제하면 안 되며, 인터넷/외부 클라우드 연결 없이도 **완전히 독립적으로 동작하는 로컬 실행 환경(Docker / Node)**이 필수적임.
- 사용자는 자체 서버에서 로컬로 구동하면서 필요에 따라 `cloudflared`(Cloudflare Tunnel)를 통해 외부 도메인에 연결할 수 있어야 하고, 운영자는 Cloudflare Pages/D1/R2 상용 서비스를 지속할 수 있어야 함.

---

## 2. 핵심 아키텍처 결정 (Decisions)

### ① 범용 스토리지 포트 추상화 (`DbAdapter` & `FileStorageAdapter`)
- [`src/server/storage/db-adapter.ts`](file:///home/horuru/Documents/projects/creators-desk/src/server/storage/db-adapter.ts) 및 [`file-storage-adapter.ts`](file:///home/horuru/Documents/projects/creators-desk/src/server/storage/file-storage-adapter.ts) 신설.
- Hono 라우터(`/api/vaults`, `/api/files`, `/api/search`)는 구체적인 Cloudflare D1이나 R2 객체에 직접 의존하지 않고, [`getContextStorage(c)`](file:///home/horuru/Documents/projects/creators-desk/src/server/storage/get-context-storage.ts)를 통해 환경에 맞는 어댑터를 자동으로 주입받음:
  - **Cloudflare 환경**: D1 및 R2 어댑터 자동 바인딩.
  - **Docker / Node 환경**: 로컬 SQLite(`node:sqlite`) 및 로컬 파일 시스템(`node:fs`) 어댑터 자동 바인딩.

### ② 무설치 초경량 로컬 어댑터 (`src/server/storage/local-adapters.ts`)
- 외부 무거운 C++ 컴파일 라이브러리 없이, Node 22 내장 SQLite 엔진(`node:sqlite`)과 내장 `node:fs` 모듈만 사용하여 구현.
- 최초 실행 시 `./data/creators.db`에 D1 스키마(Vaults, Files, Links, FTS5)를 자동 생성.
- 파일 본문은 `./data/vaults/{vault_key}/files/{file_id}.md` 경로의 순수 마크다운 파일로 영구 보관.

### ③ 12kB 초경량 스탠드얼론 서버 (`src/server/node-server.ts`)
- Vite SSR 번들러를 통해 전체 Hono 백엔드 서버를 단 **12.64 kB** 단일 파일(`dist-server/node-server.js`)로 컴파일.
- 백엔드 API와 프론트엔드 React SPA 정적 파일을 단일 Node 프로세스에서 동시 서빙 (`@hono/node-server/serve-static`).

### ④ 멀티 스테이지 Dockerfile 및 docker-compose.yml 구축
- Node Alpine 기반 멀티 스테이지 빌드로 **런타임 RAM 점유율 30MB 미만**의 초경량 컨테이너 완성.
- 단 한 줄(`docker compose up -d`)로 `./data` 볼륨을 마운트하여 외부 클라우드 의존성 0의 완벽한 셀프호스팅 제공.
- 필요 시 Cloudflare Tunnel(`cloudflared`) 컨테이너를 함께 띄워 포트포워딩 없이 공인 HTTPS 도메인 연결 가능.

---

## 3. 검증 결과
- Vitest 단위 테스트 **22개 전체 통과** (`npm test`).
  - 로컬 SQLite CRUD 및 파일 시스템 어댑터 테스트 2종 통과.
  - Hono API 듀얼 타깃(로컬 모드 + Cloudflare 모드) 테스트 3종 통과.
- 로컬 스탠드얼론 서버(`http://localhost:3099`) 기동 후 `/api/health`, `/api/vaults` 생성 및 프론트엔드 HTML 동시 서빙 실증 검증 완료.
- [AGENTS.md](file:///home/horuru/Documents/projects/creators-desk/AGENTS.md)의 모든 규칙(파일당 175줄 이하, 클린 아키텍처) 완벽 충족.
