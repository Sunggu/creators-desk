# ADR: 에디터 중심 개편 - 읽기 뷰(Live Preview) 신설 및 몰입형 타이포그래피 전환

- **날짜**: 2026-10-04
- **상태**: Approved
- **작성자**: Antigravity Agent & User Pair

---

## 1. 배경 및 문제 진단 (Context & Problem)

사용자 피드백을 통해 기존 에디터 환경의 핵심 문제점이 도출되었습니다:
1. **IDE식 딱딱한 UI**: CodeMirror의 줄 번호(`lineNumbers()`)와 코드 거터 세로줄로 인해 글쓰기 도구가 아닌 개발용 코드 에디터(VS Code)처럼 차갑고 경직된 느낌을 줌.
2. **타이틀과 파일명의 중복 및 어색함**:
   - 인라인 타이틀에 폼 필드 밑줄 및 구분선(`<div className="border-b" />`)이 존재하여 문서의 일부가 아닌 입력 폼처럼 보임.
   - 기본 템플릿에서 상단 타이틀 `Welcome` 바로 밑에 본문 첫 줄로 `# Welcome to Creators Desk`가 중복 출력되어 시각적 혼란을 야기함.
3. **원시 마크다운 노출**: 옵시디언 특유의 읽기 모드(Reading View)가 없어 `# `, `**`, `*` 등 원시 마크다운 문법 기호가 그대로 노출되는 문제.

---

## 2. 핵심 설계 및 개선 내용 (Design Decisions)

### ① 문서 중심 유기적 타이틀 (Organic Document Title)
- `ObsidianInlineTitle`에서 인위적인 테두리선과 구분선을 전면 제거하고, 문서의 자연스러운 H1 헤딩 역할을 수행하도록 타이포그래피(`text-3xl md:text-4xl font-extrabold text-white`)를 적용하였습니다.
- 신규 볼트 및 스타터 노트 템플릿에서 중복 `# Heading`을 제거하여 타이틀과 본문이 유기적으로 흐르도록 개선하였습니다.

### ② 줄 번호 제거 및 타이포그래피 확장
- CodeMirror 설정에서 `lineNumbers()`와 거터 테두리를 제거하여 군더더기 없는 순수 집필 캔버스를 구현하였습니다.
- 에디터 내 마크다운 헤딩(`.cm-header-1`, `.cm-header-2`, `.cm-header-3`), 볼드(`.cm-strong`), 이탤릭(`.cm-em`), 링크(`.cm-link`)의 크기 및 색상 스타일을 대폭 강화하였습니다.

### ③ 읽기 뷰(Reading View / Preview) 신설 (`ObsidianMarkdownPreview`)
- `marked` 라이브러리와 `processObsidianSyntax` 변환 엔진을 도입하여:
  - 원시 마크다운 기호가 사라진 완전 렌더링된 고품질 읽기 뷰를 제공합니다.
  - `[[위키링크]]`는 클릭 가능한 퍼플 링크로, `#태그`는 둥근 뱃지 캡슐로 렌더링합니다.
  - 읽기 뷰 영역을 더블 클릭하면 즉시 편집 모드로 전환됩니다.

### ④ 뷰 모드 토글 (Mode Switcher)
- 데스크톱 상단 탭바(`ObsidianTabBar`)와 모바일 상단 바(`ObsidianMobileHeader`)에 `[📖 읽기 뷰]` ↔ `[✏️ 편집 뷰]` 전환 버튼을 배치하여 언제든 읽기와 쓰기 상태를 손쉽게 오갈 수 있도록 하였습니다.

---

## 3. 검증 결과 (Verification Results)

1. **단위 테스트**: 9개 테스트 스위트, 34개 단위 테스트 100% 통과 (`npm test`).
2. **프로덕션 빌드**: 클라이언트 SPA 및 독립형 Node 서버 번들 정상 빌드 완료.
3. **파일 크기 제약 (Rule 1)**: 모든 소스 파일이 188줄 이하로 철저히 유지됨.
