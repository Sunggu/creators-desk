# 의사결정 일지 (ADR): Vite + Hono 기반 오픈소스 셀프호스팅 및 Cloudflare SaaS 듀얼 아키텍처 채택

> 일자: 2026-10-04  
> 상태: 승인 (Approved) 및 설계 확정  
> 참여자: 프로젝트 리더, 개발 에이전트  

---

## 1. 배경 및 문제 상황 (Context)

- 프로젝트 리더의 중장기 비즈니스 목표:
  1. **오픈소스 셀프호스팅(Self-hosting)**: 누구나 자신의 서버나 로컬(Docker)에 무료로 설치하여 데이터 소유권을 갖고 사용할 수 있도록 공개.
  2. **관리형 유료 SaaS (`creator.binarygap.com`)**: 복잡한 서버 설정 없이 구독료를 내고 글로벌 엣지 무설정 동기화, 영구 백업, AI 크레딧을 이용하는 상용 서비스 운영.
- 기술적 딜레마:
  - "이 모델로 가려면 풀스택 프레임워크인 Next.js로 전환해야 하는가?"
  - "클라우드플레어 전용 워커로 묶이면 오픈소스 사용자가 로컬에서 돌리기 어렵지 않은가?"
  - "오브젝트 스토리지(R2)에서 볼트 이름을 바꿀 때 파일 경로를 어떻게 처리해야 하는가?"
  - "파일 본체와 색인(Search/Linking)의 관계는 어떻게 정립해야 하는가?"

---

## 2. 대안 평가 및 검토 결과

### Next.js vs Vite + Hono 비교 분석

| 비교 항목 | Next.js | Vite + Hono (채택 ⭐) |
|---|---|---|
| **에디터 적합성** | CodeMirror 6와의 극심한 Hydration Mismatch 발생 (`ssr: false` 남발 필요) | 순수 브라우저 SPA로 Hydration 오버헤드 0, 극상의 에디터 반응성 |
| **Cloudflare 호환성** | `@cloudflare/next-on-pages` 어댑터가 불안정하고 버전 파편화 심각 | Cloudflare Pages Functions 네이티브 지원 (웹 표준 Request/Response) |
| **셀프호스팅 자원 소모** | Node.js 서버 구동 시 메모리 250MB~400MB 점유 | Hono + 경량 Docker 구동 시 **메모리 30MB 미만** (라즈베리파이/저가 VPS 최적) |
| **코드 재사용성** | Vercel 생태계 종속성 높음 | **단일 Hono API 코드**로 Cloudflare(SaaS)와 Docker/Node(오픈소스) 동시 구동 |

---

## 3. 핵심 아키텍처 결정 (Decisions)

### ① Vite (SPA) + Hono (Universal Backend API) 채택
- 프론트엔드는 현재의 **Vite React SPA**를 유지하여 데스크톱 앱 수준의 기민한 반응성을 보장.
- 백엔드 API 프레임워크로 **Hono**를 채택:
  - **SaaS 환경**: Cloudflare Pages Functions (`functions/api/[[route]].ts`)로 컴파일되어 D1 및 R2와 직접 바인딩.
  - **셀프호스팅 환경**: Node.js/Bun 런타임에서 로컬 SQLite 및 로컬 파일 디렉토리와 바인딩.

### ② 볼트 식별자: 불변 고유 키(Immutable Key) + 가변 표시 이름(Mutable Alias)
- S3/R2 오브젝트 스토리지에서는 폴더 이름을 바꾸려면 하위의 모든 객체를 복사하고 원본을 삭제해야 하는 O(N) 비용이 발생함.
- 따라서 모든 Vault는 생성 시 변경되지 않는 **불변 고유 키(`key`, 예: `vlt_k8s9d7f6`)**를 부여받아 스토리지 경로(`vaults/{key}/...`)로 사용.
- 사용자가 에디터에서 볼트 이름을 바꿀 때에는 데이터베이스의 **`alias` 컬럼만 O(1)로 즉시 갱신**.

### ③ 3단계 하이브리드 색인 (Hybrid Indexing) 파이프라인
1. **위키링크 & 백링크 (`links` 테이블)**: 마크다운 파일 저장 시 정규식 파서가 `[[Note]]`와 `#tag`를 D1/SQLite 테이블로 추출.
2. **전문 검색 (`notes_fts` 가상 테이블)**: SQLite 내장 FTS5 엔진 기반 BM25 전문 검색.
3. **AI 시맨틱 색인 (Cloudflare Vectorize)**: 본문 임베딩을 통한 RAG 지식 생성.

---

## 4. 기대 효과 및 로드맵
- **개발 생산성**: 동일한 API 코드베이스로 Cloudflare SaaS와 오픈소스 셀프호스팅을 동시에 지원.
- **클라우드 비용 최적화**: R2의 무제한 무료 Egress 및 D1의 넉넉한 무료 티어(일 500만 읽기)로 운영 마진 극대화.
- **수익화 모델 확보**: Obsidian Sync 및 Ghost(Pro)와 동일한 입증된 Open-Core 비즈니스 모델 전개.
