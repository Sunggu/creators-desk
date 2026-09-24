# UI Components MOC

> Component catalog, design tokens, and Lego assembly rules.
> Target dirs: `src/components/`, `src/ui/`.

## Catalog

| Component | File | Props | Purpose |
|---|---|---|---|
| _(empty — add components here)_ | | | |

## Lego Rules

- Components receive a **single prop object** or `children` (no prop drilling).
- No data fetching inside components — hooks or use cases live upstream.
- Pure presentational mapping is kept inside the component; business mapping lives in the use case.

## Design Tokens (Tailwind v4)

- Background: `zinc-950` page / `zinc-900/60` cards, `zinc-800` borders.
- Status should use a fixed token map per state (e.g. emerald = ok, amber = warn, rose = error, zinc = unavailable).
- Badges use `color-500/15` background + `color-300` text + `color-500/30` border.
- Accent: `sky-400`.