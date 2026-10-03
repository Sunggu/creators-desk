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
- **Infrastructure** (`src/infrastructure/`) — concrete adapters that implement ports (IndexedDB, localStorage).
- **Presentation** (`src/components/`, `src/hooks/`) — React components and data-fetching hooks only.

## Contracts

| Port | Port location | Adapter | Adapter location |
|---|---|---|---|
| `VaultRepository` | `src/core/application/ports/vault.repository.ts` | `IndexedDbVaultRepository` | `src/infrastructure/storage/indexeddb-vault.repository.ts` |
| `FileRepository` | `src/core/application/ports/file.repository.ts` | `IndexedDbFileRepository` | `src/infrastructure/storage/indexeddb-file.repository.ts` |
| `SessionRepository` | `src/core/application/ports/session.repository.ts` | `LocalSessionRepository` | `src/infrastructure/storage/local-session.repository.ts` |

## Feature Map

| Feature | Use Cases | Primary Components / Hooks |
|---|---|---|
| Vault Management | `CreateVaultUseCase`, `ListVaultsUseCase`, `DeleteVaultUseCase` | `useVaults`, `VaultLauncher`, `VaultCard`, `CreateVaultDialog` |
| Workspace Session | `ManageSessionUseCase` | `useVaults`, `useActiveWorkspace`, `WorkspaceTopbar` |
| File Explorer | `ManageFileNodeUseCase` | `useActiveWorkspace`, `FileExplorer`, `FileTreeItem`, `FileExplorerToolbar` |
| Markdown Editor | `FileContentUseCase` | `useCodeMirror`, `MarkdownEditor`, `WorkspaceLayout` |
