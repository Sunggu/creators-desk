# Creators Desk 로드맵 (Web Obsidian Editor)

> 2026-10-03 확정: 웹 기반 순수 옵시디언 에디터.
> 의사결정 상세: [2026-10-03-decision-obsidian-web-editor.md](file:///home/horuru/Documents/projects/creators-desk/docs/logs/2026-10-03-decision-obsidian-web-editor.md)

---

## 1. 제품 정의

**"옵시디언 에디터 기능을 웹으로 순수하고 쉽게 옮긴다."**

- 프로젝트의 기본 단위는 **Vault**이다.
- 복잡한 AI, 외부 백엔드 연동, 익스텐션 등 부가 요소를 배제하고, 마크다운 텍스트 중심의 순수한 집필·편집 경험에 집중한다.

---

## 2. 사용자 핵심 흐름 (User Flow)

```
[첫 접속 / 새로고침]
       │
       ▼
 `lastActiveVaultId` 확인 (localStorage)
   ├── 존재함 ──▶ 즉시 해당 Vault 작업 공간(Workspace) 진입
   └── 없음 ────▶ [Vault 선택기 (Launcher)]
                       │
                       ├─ 기존 Vault 목록에서 선택
                       └─ 새 Vault 생성 (+ 이름 지정)
```

1. **Vault 런처 (Launcher)**:
   - 사용자가 생성한 Vault 목록을 확인하고 진입하거나 새 Vault를 생성한다.
   - 언제든 작업 공간 상단/사이드바에서 Vault 선택기로 돌아갈 수 있다.
2. **세션 복구 (Auto Re-open)**:
   - 브라우저에 마지막으로 열어둔 Vault ID를 저장하여, 재접속 시 곧바로 작업 공간이 열린다.

---

## 3. 핵심 기술 아키텍처

- **에디터 코어**: **CodeMirror 6 (CM6)**
  - 실제 옵시디언 데스크톱/모바일 앱의 기반 엔진.
  - 마크다운 텍스트 원본이 Single Source of Truth로 유지됨.
  - Live Preview 인라인 장식 및 위키링크 확장 지원.
- **데이터 저장소 (Client-First)**:
  - **IndexedDB**: Vault 메타데이터, 폴더 구조, 마크다운 파일 내용 영속화.
  - **localStorage**: 마지막 활성 Vault ID (`lastActiveVaultId`), UI 세션 상태.

---

## 4. 단계별 세부 로드맵

### Phase 1: Vault 관리 & 세션 복구 (현재 목표)
- [ ] Vault 도메인 DTO 및 Repository 포트 정의 (`src/core/domain/`, `src/core/application/ports/`)
- [ ] IndexedDB 기반 Vault 저장소 어댑터 구현 (`src/infrastructure/storage/`)
- [ ] Vault 생성, 목록 조회, 삭제 Use Case 구현 및 단위 테스트
- [ ] 첫 화면 UI: Vault 선택기 (Launcher) & `localStorage` 기반 세션 자동 복원

### Phase 2: Vault 파일 트리 탐색기
- [ ] Vault 내 폴더 및 파일(`.md`) 엔티티/DTO 정의
- [ ] 파일 및 폴더 CRUD (생성, 이름 변경, 삭제, 이동)
- [ ] 좌측 사이드바: 계층형 파일 트리 뷰 컴포넌트
- [ ] 파일 선택 시 활성 문서(Active Document) 상태 전환

### Phase 3: 마크다운 에디터 코어 (CodeMirror 6)
- [ ] CodeMirror 6 기반 마크다운 에디터 컴포넌트 연동
- [ ] 기본 문법 하이라이팅 (헤더, 볼드, 이탤릭, 코드 블록, 리스트)
- [ ] 타이핑 실시간 자동 저장 (Debounce → IndexedDB)
- [ ] 기본 단축키 및 에디터 툴바

### Phase 4: 옵시디언 특화 기능
- [ ] Live Preview: 비활성 라인의 마크다운 기호 숨김 및 인라인 위지윅 렌더링
- [ ] `[[WikiLink]]` 문법 파싱 및 Vault 내 문서 간 링크 이동
- [ ] 마크다운 파일 로컬 내보내기/가져오기 (.md / .zip)