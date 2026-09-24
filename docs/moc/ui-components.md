# UI Components MOC

> Component catalog, design tokens, and Lego assembly rules.
> Target dirs: `src/components/`, `src/ui/`.

## Catalog

| Component | File | Props | Purpose |
|---|---|---|---|
| `TailscaleStatusCard` | `src/components/tailscale-status-card.tsx` | `{ status: TailscaleStatusViewModel }` | Shows Tailscale agent run state in a bordered card |

## Lego Rules

- Components receive a **single prop object** or `children` (no prop drilling).
- No data fetching inside components — hooks or use cases live upstream.
- Pure presentational mapping (`STATUS_META`) is kept inside the card; business mapping (`BackendState` → kind) lives in the use case.

## Design Tokens (Tailwind v4)

- Background: `zinc-950` page / `zinc-900/60` cards, `zinc-800` borders.
- Status dots: emerald = running, amber = needs-login, sky = starting, rose = stopped, zinc = unavailable.
- Badges use `color-500/15` background + `color-300` text + `color-500/30` border.
- Accent: `sky-400`.