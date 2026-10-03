# UI Components Map of Content (MOC)

> Component catalog, design tokens, and Lego assembly rules.

---

## Catalog

| Component | File | Props | Purpose |
|---|---|---|---|
| `VaultLauncher` | `src/components/vault/vault-launcher.tsx` | `{ vaults, isLoading, onSelectVault, onCreateVault, onDeleteVault }` | First-landing Vault selection & creation screen |
| `VaultCard` | `src/components/vault/vault-card.tsx` | `{ vault, onSelect, onDelete }` | Individual Vault item card with action buttons |
| `CreateVaultDialog` | `src/components/vault/create-vault-dialog.tsx` | `{ isOpen, onClose, onSubmit }` | Modal dialog to name and create a new Vault |
| `WorkspaceLayout` | `src/components/workspace/workspace-layout.tsx` | `{ vault, onExitVault }` | Shell integrating Topbar, File Explorer, and Editor |
| `WorkspaceTopbar` | `src/components/workspace/workspace-topbar.tsx` | `{ vault, activeFileName, onExitVault, isSaving }` | Top navigation with Vault switch & save status |
| `FileExplorer` | `src/components/sidebar/file-explorer.tsx` | `{ nodes, activeFileId, onSelectFile, ... }` | Hierarchical file/folder tree explorer |
| `FileTreeItem` | `src/components/sidebar/file-tree-item.tsx` | `{ node, depth, isActive, isExpanded, ... }` | Single file or folder row with inline actions |
| `FileExplorerToolbar` | `src/components/sidebar/file-explorer-toolbar.tsx` | `{ onNewFile, onNewFolder, onRefresh }` | Toolbar with quick actions for files/folders |
| `MarkdownEditor` | `src/components/editor/markdown-editor.tsx` | `{ activeFile, onSavingChange }` | CodeMirror 6 markdown editor with auto-save |

## Lego Rules

- 컴포넌트는 **단일 props 객체** 또는 `children`만 받는다 (prop drilling 금지).
- 컴포넌트 안에서 데이터를 직접 가져오지 않는다 — hook과 use case는 상위 계층에 둔다.
- 순수 표시용 매핑은 컴포넌트 내부에 두고, 비즈니스 매핑은 use case에 둔다.

## Design Tokens (Tailwind v4)

- Background: `zinc-950` 페이지 / `zinc-900/60` 카드, `zinc-800` 보더.
- 상태 점: emerald = saved, amber = saving, sky = active.
- Accent: `sky-400`.