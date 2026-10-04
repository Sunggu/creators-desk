# 의사결정 일지 (ADR): 옵시디언 인라인 타이틀(Inline Title) 기반 파일명 변경 및 생성 흐름 일치

> 일자: 2026-10-04  
> 상태: 승인 (Approved) 및 구현 완료  
> 참여자: 프로젝트 리더, 개발 에이전트  

---

## 1. 배경 및 문제 상황 (Context)

- 사용자가 에디터 상단의 제목(Title)을 클릭하여 파일명을 변경하려 했으나, 기존 화면의 제목이 단순 정적 `<h1>` 태그로 고정되어 수정할 수 없었음.
- 새 노트를 생성할 때 본문에 `# 제목`이 중복 생성되어, "파일 제목"과 "본문 마크다운 H1" 간의 역할 충돌과 혼란이 발생함.
- 옵시디언의 고유 UX:
  - 에디터 상단에 위치한 타이틀(Inline Title)은 노시디언의 실제 파일명(확장자 제외)과 1:1로 직결됨.
  - 새 노트를 만들면 타이틀에 즉시 포커스 및 텍스트 선택이 걸려 바로 파일명을 입력할 수 있고, Enter를 누르면 저장과 동시에 본문(에디터)으로 커서가 바로 이동함.

---

## 2. 핵심 결정 및 변경 사항 (Decisions)

### ① 에디터 인라인 타이틀 컴포넌트(`ObsidianInlineTitle`) 신설
- [`ObsidianInlineTitle`](file:///home/horuru/Documents/projects/creators-desk/src/components/editor/obsidian-inline-title.tsx)을 독립 레고 블록 컴포넌트로 분리.
- 기본 외형은 옵시디언 특유의 대형 H1 헤딩 폰트 및 투명 배경 유지.
- 호버 시 은은한 가이드라인 표시, 포커스 시 보라색(`violet-500`) 액센트 보더 활성화.
- **Enter 키**: 파일명 변경 사항 즉시 저장(`renameNode`) 후 에디터 본문(`view.focus()`)으로 포커스 자동 점프.
- **Escape 키**: 편집 취소 및 원래 파일명으로 원복.
- **Blur**: 포커스를 잃으면 변경된 파일명으로 자동 저장.
- 파일 시스템 금지 특수문자(`[\\/:*?"<>|]`) 자동 필터링.

### ② 새 노트 생성 시 Zero-Friction 파일명 작성 흐름
- 새 노트 생성 시 불필요한 본문 `# Untitled` 중복 주입을 제거하고 깔끔한 빈 본문으로 시작.
- 생성 즉시 상단 인라인 타이틀 입력 필드로 자동 포커스 및 텍스트 선택(`select()`).
- 사용자는 마우스 조작 없이 `새 노트 생성` → `원하는 파일명 입력` → `Enter` → `본문 즉시 작성`의 옵시디언 네이티브 키보드 워크플로우를 그대로 경험할 수 있음.

### ③ 유틸리티 분리 및 클린 아키텍처 준수
- 고유 파일/폴더 이름 생성 및 문자열 정제 로직을 [`src/utils/name-generator.ts`](file:///home/horuru/Documents/projects/creators-desk/src/utils/name-generator.ts)로 분리하고 독립 단위 테스트(`name-generator.spec.ts`)를 작성.
- 모든 파일 라인 수 175줄 이하 유지 ([AGENTS.md](file:///home/horuru/Documents/projects/creators-desk/AGENTS.md) 200줄 제한 완벽 충족).

---

## 3. 검증 결과
- Vitest 단위 테스트 13개 전체 통과 (`npm test`).
- TypeScript 및 Vite 프로덕션 빌드 성공 (`npm run build`).
