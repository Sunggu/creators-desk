# Architecture MOC

> Layer rules, dependency graph, and interface contracts.
> Target dirs: `src/core/`, `src/infrastructure/`, `src/hooks/`, `src/components/`.

## Layer Boundaries

Unidirectional dependency flow (outer → inner only):

```
Presentation (components/) → Hooks → Application (use-cases/ports)
Infrastructure (adapters) → Application ports → Domain (DTOs/entities)
```

- **Domain** (`src/core/domain/`) — pure data shapes (DTOs). No framework imports.
- **Application** (`src/core/application/`) — repository *ports* (interfaces) and *use cases* (pure business logic). No DOM, no HTTP.
- **Infrastructure** (`src/infrastructure/`) — concrete adapters that implement ports (e.g. HTTP fetch wrapper).
- **Presentation** (`src/components/`, `src/hooks/`) — React components and data-fetching hooks only.

## Contracts

No feature contracts registered yet — add a row here for each new port/adapter pair.