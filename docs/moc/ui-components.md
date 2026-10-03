# UI Components Map of Content (MOC)

> Component catalog, design tokens, and Lego assembly rules.

---

## Catalog

| Component | File | Props | Purpose |
|---|---|---|---|
| `ObsidianShell` | `src/components/layout/obsidian-shell.tsx` | `{ vault, vaults, onSelectVault, onCreateVault, onDeleteVault }` | Master Obsidian responsive 3-pane & mobile drawer shell |
| `ObsidianMobileHeader` | `src/components/mobile/obsidian-mobile-header.tsx` | `{ vault, activeFile, onOpenSidebar, onOpenVaultModal, onNewNote }` | Compact mobile top bar with hamburger, title & actions |
| `ObsidianRibbon` | `src/components/ribbon/obsidian-ribbon.tsx` | `{ isSidebarOpen, onToggleSidebar, onOpenVaultModal }` | Desktop 44px icon action rail |
| `ObsidianSidebar` | `src/components/sidebar/obsidian-sidebar.tsx` | `{ vault, nodes, activeFileId, onOpenVaultModal, ... }` | Vault dropdown & hierarchical file explorer (drawer on mobile) |
| `FileTreeItem` | `src/components/sidebar/file-tree-item.tsx` | `{ node, depth, isActive, isExpanded, ... }` | Single file or folder row with inline rename/delete |
| `ObsidianTabBar` | `src/components/tabs/obsidian-tab-bar.tsx` | `{ activeFile, onNewNote, onCloseNote }` | Active note tabs with close & add tab buttons (desktop) |
| `ObsidianEditor` | `src/components/editor/obsidian-editor.tsx` | `{ activeFile, onSavingChange, onStatsChange, onNewNote }` | CodeMirror 6 markdown editor with auto-save & responsive padding |
| `ObsidianStatusBar` | `src/components/statusbar/obsidian-status-bar.tsx` | `{ stats, isSaving }` | Bottom bar: words, chars, cursor Ln/Col, save state |
| `ObsidianVaultModal` | `src/components/vault/obsidian-vault-modal.tsx` | `{ isOpen, activeVaultId, vaults, onClose, ... }` | Obsidian-style modal for switching and managing vaults |

## Lego Rules

- 컴포넌트는 **단일 props 객체** 또는 `children`만 받는다 (prop drilling 금지).
- 컴포넌트 안에서 데이터를 직접 가져오지 않는다 — hook과 use case는 상위 계층에 둔다.
- 순수 표시용 매핑은 컴포넌트 내부에 두고, 비즈니스 매핑은 use case에 둔다.

## Design Tokens (Obsidian Dark Theme)

- Ribbon: `#121215`
- Sidebar: `#18181b`
- Tab Bar: `#141417`
- Editor: `#1e1e22`
- Status Bar: `#121215`
- Borders: `#26262e`
- Accent: Obsidian Violet `#7c3aed` / `#a78bfa`