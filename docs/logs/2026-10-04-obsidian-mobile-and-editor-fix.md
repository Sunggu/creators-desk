# 의사결정 일지 (ADR): 모바일 반응형 드로워 및 마크다운 에디터 렌더링 정상화

> 일자: 2026-10-04  
> 상태: 승인 (Approved) 및 구현 완료  
> 참여자: 프로젝트 리더, 개발 에이전트  

---

## 1. 배경 및 문제 상황 (Context)

배포 사이트(`https://creator.binarygap.com/`)에서 다음 2가지 치명적인 사용자 경험 문제가 보고됨:
1. **모바일 뷰 미대응**: 모바일 환경에서 좌측 파일 트리/리본 메뉴가 상시 노출되거나 겹쳐서 본문 편집이 불가능했으며, 옵시디언 모바일처럼 드로워(슬라이드 인/아웃) 및 스와이프 제스처가 지원되지 않음.
2. **에디터 렌더링 및 편집 불가**: 마크다운 본문이 화면에 표시되지 않고 에디터 커서나 입력이 동작하지 않음. 또한 브라우저 프롬프트(`window.prompt`) 차단으로 파일 생성이 실패하거나 IndexedDB 트랜잭션이 비활성화되는 버그가 확인됨.

---

## 2. 근본 원인 분석 (Root Causes)

1. **CodeMirror Ref 라이프사이클 마운팅 결함**:
   - `ObsidianEditor` 내에서 `isLoaded`가 `false`일 때 로딩 `div`를 반환하고, `true`가 된 후 `<div ref={containerRef} />`를 렌더링함.
   - `useCodeMirror` 훅의 `useEffect`는 초기 마운트 시점에 이미 실행되어 `containerRef.current`가 `null`인 상태로 완료되었고, `isLoaded` 변경 시 ref 콜백이 트리거되지 않아 에디터가 빈 채로 남게 됨.
2. **IndexedDB 비동기 마이크로태스크 트랜잭션 소멸**:
   - `idb-database.ts`에서 트랜잭션 핸들러 호출 전 `Promise.resolve().then()` 지연이 발생하여, WebKit/Safari 및 모바일 브라우저에서 트랜잭션이 자동 커밋/비활성화(`TransactionInactiveError`)됨.
3. **모바일 차단형 `prompt()`**:
   - 파일/폴더 생성 시 브라우저 네이티브 `prompt()`를 사용하여 모바일 키보드 충돌 및 무반응 문제 유발.

---

## 3. 핵심 결정 및 해결책 (Decisions & Solutions)

### ① 독립 뷰 컴포넌트(`ObsidianMarkdownView`) 분리 및 Ref 생명주기 보장
- `src/components/editor/obsidian-markdown-view.tsx`를 신설하여 활성 파일 변경 시 `key={activeFile.id}`로 즉시 완전 마운트되도록 분리.
- 옵시디언 고유의 인라인 문서 타이틀(`# Note Title`) 및 CodeMirror 컨테이너가 무조건 DOM에 동기 렌더링되어 에디터 입력이 안정적으로 동작하도록 수정.

### ② 옵시디언 모바일 반응형 셸 및 제스처 도입
- **모바일 헤더(`ObsidianMobileHeader`)**: 햄버거 메뉴 버튼, 현재 노트명, 액션 버튼 탑재.
- **슬라이드인 드로워**: 좌측 리본+사이드바가 모바일에서 오버레이 드로워(`translate-x`)로 동작하며 백드롭 터치 시 닫힘.
- **터치 스와이프 제스처**: 좌측 가장자리에서 오른쪽으로 스와이프 시 드로워 열림, 드로워 영역에서 왼쪽으로 스와이프 시 드로워 닫힘.
- **선택 시 자동 닫힘**: 모바일에서 탐색기 노트를 터치하면 드로워가 즉시 닫히며 에디터에 집중.

### ③ 무중단(Frictionless) 파일 생성 및 데이터베이스 신뢰성 강화
- `prompt()` 차단 없이 "+" 버튼 클릭 즉시 `Untitled.md`, `Untitled 1.md`로 자동 넘버링 생성.
- IndexedDB 트랜잭션을 동기적으로 실행하고 실패 시 메모리 저장소로 폴백하여 데이터 유실 원천 방지.

---

## 4. 검증 결과
- Vitest 단위 테스트 9개 전체 통과 (`npm test`).
- TypeScript 타입 검사 및 Vite 프로덕션 빌드 무결성 확인 (`npm run build`).
- 모든 소스 코드 파일 200줄 이하 제약 준수 ([AGENTS.md](file:///home/horuru/Documents/projects/creators-desk/AGENTS.md)).
