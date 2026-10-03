# Architecture Map of Content (MOC)

> Layer rules, dependency graph, interface contracts, and feature index.

---

## Layers

```
Presentation (components, hooks)
       ↓
Infrastructure (adapters) → Application ports → Domain (DTOs/entities)
```

- **Domain** (`src/core/domain/`) — pure data shapes (DTOs). No framework imports.
- **Application** (`src/core/application/`) — repository *ports* (interfaces) and *use cases* (pure business logic). No DOM, no HTTP.
- **Infrastructure** (`src/infrastructure/`) — concrete adapters that implement ports (e.g. HTTP fetch wrapper, filesystem access).
- **Presentation** (`src/components/`, `src/hooks/`) — React components and data-fetching hooks only.

## Contracts

아직 정의된 포트 없음. 포트가 생길 때마다 아래 표에 Port / Adapter 위치를 함께 기록한다.

| Port | Port location | Adapter | Adapter location |
|---|---|---|---|

## Feature Map

구현된 기능 없음. Application 레이어가 채워지는 시점에 아래 표와 함께 갱신한다.
