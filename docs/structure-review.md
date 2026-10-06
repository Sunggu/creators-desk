# 프로젝트 구조 분석 및 개선 제안

> 2026-10-06 · 전반적인 흐름/구조 위주의 개괄 리뷰 (코드 세부 검토 아님)

## 1. 현재 구조 요약

```
Browser (Vite React SPA + CodeMirror 6)
  components/ hooks/ editor/ i18n/ utils/        ← Presentation
  infrastructure/di.ts                           ← 조립 지점 (Composition Root)
  infrastructure/storage/ (Http* → IndexedDB fallback, localStorage)
  core/application (use-cases, ports)            ← Application
  core/domain (DTO, 순수 로직)                    ← Domain
        │ HTTP /api/vaults
        ▼
Hono (src/server/) ── routes: vaults / files / search
  storage adapters: Cloudflare(D1+R2) | Local(SQLite+FS)
  진입점: functions/api/[[route]].ts (CF) · node-server.ts (Docker)
```

**잘하고 있는 점**
- Port/Adapter 분리가 명확하고 Dual-target(CF / Self-host)이 `server/storage`로 격리됨.
- DTO 단일 파일 규칙, 200줄 제한 준수 (최대 196줄), 테스트 colocate.
- 클라이언트 HTTP 어댑터 + IndexedDB 폴백으로 오프라인 대응.
- `test/`에 인메모리 포트 더블이 있어 유스케이스 테스트가 결정적임.
- 변경 이력(`docs/logs`)과 MOC가 존재.

## 2. 개선 필요 사항

### P1 — 아키텍처 규칙 위반 / 불일치

1. **서버가 Application 계층을 우회함**
   `src/server/routes/files.ts`가 스토리지 어댑터를 직접 호출하고 `parseWikilinksAndTags`(utils)를 라우트에서 실행. 파일/볼트 규칙(이름 검증, 중복, 인덱싱)이 클라이언트 use-case와 서버 route에 **이중화**될 위험이 있음(Rule 4).
   → 서버용 use-case(또는 클라이언트와 공유되는 core use-case)를 두고 라우트는 HTTP 매핑만 담당.
2. **Presentation → Infrastructure 직접 의존**
   `use-note-document.ts`, `use-active-workspace.ts`, `use-vaults.ts`가 `infrastructure/di`를 직접 import. 하위 계층 교체/테스트 시 모듈 모킹이 필요해짐.
   → React Context(`<AppServicesProvider>`)로 use-case를 주입하고 훅은 `useServices()`만 사용. 테스트에서 `src/test/*` 더블을 주입 가능.
3. **MOC 문서와 실제 의존 방향 불일치**
   `architecture.md`의 다이어그램은 Domain이 가장 아래(Infra가 Domain에 의존)로, AGENTS.md는 반대 방향 표기. 한 방향으로 통일 필요. 또한 `src/server/`, `src/editor/`, `src/utils/`가 레이어 구분 없이 존재하고, MOC 대상 디렉터리(`functions/`)만 언급됨.
4. **`docs/moc/domain-lore.md`, `domain-pipeline.md` 부재** (AGENTS.md MOC 표에 있으나 없음) — 현 로드맵상 미사용이면 AGENTS.md 표에서 제거하거나 "보류"로 표기.

### P2 — 구조 정리

5. **`src/utils/` 잡동사니화**: `wikilink-parser`, `tree-selection`, `tab-drop-position`은 순수 도메인/UI 로직이 섞여 있음. 서버와 클라이언트가 공유하는 `wikilink-parser`는 `core/domain/`(또는 `src/shared/`)로 이동.
6. **서버가 `src/` 안에 있으면서 클라이언트 번들과 tsconfig 공유**: `src/server`는 hono/node 의존이므로 클라이언트 빌드에 포함되지 않도록 경계를 보장(별도 tsconfig 혹은 `server/` 최상위 분리) 권장. ESLint `no-restricted-imports`로 `components → server`, `core → infrastructure` 금지 규칙 추가.
7. **컴포넌트 디렉터리가 UI 위치(sidebar/tabs/…) 기준**: 기능이 늘면 `features/<name>/{ui,hooks,model}` 구조가 응집도가 더 좋음. 지금은 시급하지 않으나 파일 수(컴포넌트 ~50개) 증가 시 전환.
8. **`use-active-workspace.ts`(172줄), `use-editor-grid.ts`(178줄)** 등 훅이 한도에 근접. 상태 전이 로직을 순수 reducer/use-case로 추출하면 Rule 4·5에도 부합.
9. **DB 스키마 관리**: `d1/schema.sql` 단일 파일 + `local-adapters`의 SQLite 스키마가 이중 정의될 가능성. 마이그레이션 번호 체계(`d1/migrations/`)와 공용 스키마 소스 단일화 필요.

### P3 — 품질/운영

10. **서버 오류 처리**: `console.error` 직접 사용(search 라우트). `AppError` 도메인 에러를 Hono `onError`에서 HTTP 상태로 매핑하는 단일 미들웨어로 통일.
11. **테스트 범위 공백**: 서버 라우트는 `app.spec.ts` 하나에 집중, `components/`는 일부만 테스트. CI(lint + test + notices:check) 파이프라인 문서화 필요. 로드맵의 체크박스도 실제 진행과 불일치(Phase 1이 "현재 목표"로 남음) → 갱신.
12. **동기화 정책 명시**: Http→IndexedDB 폴백 시 충돌/재동기화 전략이 코드에 암묵적. `docs/moc/architecture.md`에 오프라인 쓰기 후 복구 정책(last-write-wins 등)을 명문화.
13. **인증/멀티유저 경계 부재**: SaaS 타깃이면 Vault 소유자(user id) 개념과 API 인증 미들웨어 자리를 미리 설계.

## 3. 권장 실행 순서

| 순서 | 작업 | 효과 |
|---|---|---|
| 1 | MOC/AGENTS.md 방향 표기 통일, 로드맵 갱신 | 문서 신뢰도 |
| 2 | ESLint import 경계 규칙 추가 | 재발 방지 |
| 3 | `AppServicesProvider`로 DI 전환 | 테스트성, Rule 3 |
| 4 | 서버 use-case 계층 도입, 라우트 슬림화 | 로직 이중화 제거 |
| 5 | `utils/` 재배치, 공용 스키마/마이그레이션 | 구조 정리 |
| 6 | 에러 미들웨어, 동기화 정책 문서화 | 운영 안정성 |
