# UI Components Map of Content (MOC)

> Component catalog, design tokens, and Lego assembly rules.

---

## Catalog

아직 구현된 컴포넌트 없음. `src/App.tsx`는 빈 셸.

| Component | File | Props | Purpose |
|---|---|---|---|

## Lego Rules

- 컴포넌트는 **단일 props 객체** 또는 `children`만 받는다 (prop drilling 금지).
- 컴포넌트 안에서 데이터를 직접 가져오지 않는다 — hook과 use case는 상위 계층에 둔다.
- 순수 표시용 매핑은 컴포넌트 내부에 두고, 비즈니스 매핑은 use case에 둔다.

## Design Tokens (Tailwind v4)

- Background: `zinc-950` 페이지 / `zinc-900/60` 카드, `zinc-800` 보더.
- 상태 점: emerald = running, amber = needs-login, sky = starting, rose = stopped, zinc = unavailable.
- 배지: `color-500/15` 배경 + `color-300` 텍스트 + `color-500/30` 보더.
- Accent: `sky-400`.