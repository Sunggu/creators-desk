# 다중 AI 코딩 에이전트 협업 프로토콜 (Multi-Agent Collaboration Guide)

> **문서 목적**: `.gemini`, `.antigravity`, `.cursor` 등 특정 도구의 숨김 폴더에 컨텍스트가 고립되는 것을 방지하고, **모든 코딩 에이전트(Claude Code, Cursor, Codex, Windsurf, Antigravity 등)가 `docs/` 폴더를 단일 진실 원천(Single Source of Truth)으로 삼아 소통·협업하는 표준 절차**를 정의한다.

---

## 1. 핵심 원칙: 벤더 중립적 컨텍스트 공유 (Vendor-Neutral SSOT)

1. **전용 숨김 폴더에 프로젝트 지식 저장 금지**
   - 아키텍처 결정, 로드맵, 작업 진행 상태, 기술 분석을 `.gemini/`, `.antigravity/`, `.cursor/` 내부에만 기록하지 않는다.
   - 모든 에이전트가 공통으로 읽을 수 있는 `AGENTS.md`와 `docs/` 하위 마크다운 문서에 기록해야 다음 에이전트가 끊김 없이 작업을 이어받을 수 있다.
2. **문서 진입점(Entrypoint) 단일화**
   - 모든 에이전트는 세션 시작 시 루트의 [`AGENTS.md`](file:///home/horuru/Documents/Writer/creators-desk/AGENTS.md)를 읽고, 그 안에 연결된 `docs/` 하위 문서를 탐색한다.

---

## 2. `docs/` 디렉터리 구조 및 역할 분담

```
AGENTS.md                                  ← [필수 진입점] 8대 불변 규칙 & 문서 지도(MOC)
docs/
 ├── core-analysis-and-roadmap.md          ← [현재 핵심 과업] 코어 현황 분석 및 Track 1~3 개발 백로그
 ├── agent-collaboration.md                ← [협업 프로토콜] 에이전트 간 컨텍스트 공유 및 인수인계 규칙
 ├── roadmap.md                            ← 제품 전체 마일스톤 요약 (Phase 1 ~ Phase 4)
 ├── structure-review.md                   ← 코드베이스 구조 리뷰 및 리팩토링 백로그 (P1 ~ P3)
 ├── moc/                                  ← 도메인·계층별 상세 지도 (코드 수정 시 반드시 동기화)
 │    ├── architecture.md                  ← 레이어 경계, 포트/어댑터 계약, 상태 소유권 불변식
 │    ├── ui-components.md                 ← UI 컴포넌트 카탈로그, DnD/오버레이 안전 규칙, 디자인 토큰
 │    └── testing.md                       ← 단위/통합 테스트 전략 및 인메모리 더블 가이드
 └── logs/                                 ← 의사결정 기록 (ADR: YYYY-MM-DD-topic.md)
      └── README.md                        ← ADR 인덱스 테이블
```

---

## 3. 에이전트 작업 수행 및 인수인계(Hand-off) 워크플로우

새로운 코딩 에이전트가 투입되었을 때 반드시 아래 **4단계 사이클**을 따른다.

### Step 1: 컨텍스트 파악 (Read Before Code)
1. [`AGENTS.md`](file:///home/horuru/Documents/Writer/creators-desk/AGENTS.md)를 읽어 **200줄 제한(Rule 1)**, **단일 DTO 파일(Rule 2)**, **클린 아키텍처 단방향 의존(Rule 3)** 등 핵심 제약사항을 숙지한다.
2. [`docs/core-analysis-and-roadmap.md`](file:///home/horuru/Documents/Writer/creators-desk/docs/core-analysis-and-roadmap.md)의 **Section 3 (Track 1 ~ Track 3)**에서 현재 체크되지 않은(`[ ]`) 목표 과업(예: `T1-1`, `T2-1`)을 확인한다.
3. 작업 대상 계층에 맞춰 [`docs/moc/architecture.md`](file:///home/horuru/Documents/Writer/creators-desk/docs/moc/architecture.md) 및 [`docs/moc/ui-components.md`](file:///home/horuru/Documents/Writer/creators-desk/docs/moc/ui-components.md)의 불변식(상태 소유권, 오버레이 `pointer-events: none`, 단색 아이콘 규칙 등)을 확인한다.

### Step 2: 구현 및 단위 테스트 작성 (Execute & Verify)
1. 도메인/유스케이스 로직을 먼저 구현하고 colocate된 단위 테스트(`*.spec.ts` / `*.spec.tsx`)를 작성한다.
2. 파일당 200줄을 초과하지 않도록 작은 훅, 순수 유틸 함수, 하위 컴포넌트로 분리한다.
3. `pnpm run test` 및 `pnpm run build`(또는 타입체크/린트)를 실행하여 기존 불변식이 깨지지 않았는지 검증한다.

### Step 3: 문서 동기화 및 상태 갱신 (Sync Docs)
코드를 수정한 에이전트는 세션을 종료하기 전 **반드시 아래 문서를 함께 갱신**해야 다른 에이전트가 최신 상태를 알 수 있다:
1. **과업 체크리스트 갱신**: [`docs/core-analysis-and-roadmap.md`](file:///home/horuru/Documents/Writer/creators-desk/docs/core-analysis-and-roadmap.md) 및 [`docs/roadmap.md`](file:///home/horuru/Documents/Writer/creators-desk/docs/roadmap.md)에서 완료한 항목을 `[x]`로 체크하고, 후속 과업이나 주의사항이 생겼다면 하위 불릿으로 명시한다.
2. **MOC 카탈로그 갱신**:
   - 새 컴포넌트/훅/유틸을 추가했다면 [`docs/moc/ui-components.md`](file:///home/horuru/Documents/Writer/creators-desk/docs/moc/ui-components.md)의 표에 즉시 등록한다.
   - 새 포트/어댑터/API 라우트/상태 소유권을 추가했다면 [`docs/moc/architecture.md`](file:///home/horuru/Documents/Writer/creators-desk/docs/moc/architecture.md)에 반영한다.
3. **의사결정 로그(ADR) 기록**: 중요한 설계 결정(예: URL 라우팅 스키마 확정, 분할 트리 자료구조 변경, 동기화 충돌 정책 등)을 내렸다면 `docs/logs/YYYY-MM-DD-<slug>.md` 파일을 생성하고 [`docs/logs/README.md`](file:///home/horuru/Documents/Writer/creators-desk/docs/logs/README.md) 목록에 추가한다.

---

## 4. 다른 에이전트 도구별 연동 팁 (선택 사항)

사용자가 여러 AI 도구(Claude Code, Cursor, Windsurf 등)를 번갈아 사용할 때, 각 도구가 루트의 `AGENTS.md`와 `docs/`를 즉시 읽도록 하려면 아래 방식을 활용할 수 있다:

- **Claude Code (`CLAUDE.md`)**: 루트에 `CLAUDE.md`가 필요할 경우 별도 내용을 중복 작성하지 말고 `@AGENTS.md` 및 `@docs/core-analysis-and-roadmap.md`를 참조하도록 3줄짜리 포인터 파일만 두거나 심볼릭 링크(`ln -s AGENTS.md CLAUDE.md`)를 사용한다.
- **Cursor / Windsurf**: 프로젝트 루트의 `AGENTS.md`를 기본 인식하며, 작업 지시 시 `"@docs/core-analysis-and-roadmap.md 의 T1-2 과업을 진행해줘"`처럼 과업 ID(`T1-1` ~ `T3-3`)로 명령하면 에이전트 간 문맥 손실 없이 정확히 소통할 수 있다.
