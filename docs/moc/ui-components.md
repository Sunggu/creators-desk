# UI Components Map of Content (MOC)

> Component catalog, design tokens, and Lego assembly rules.

---

## Catalog

| Component | File | Props | Purpose |
|---|---|---|---|
| `ObsidianShell` | `src/components/layout/obsidian-shell.tsx` | `{ vault, vaults, onSelectVault, onCreateVault, onDeleteVault }` | Master Obsidian responsive 3-pane & mobile drawer shell |
| `ObsidianMobileHeader` | `src/components/mobile/obsidian-mobile-header.tsx` | `{ vault, activeFile, onOpenSidebar, onOpenVaultModal, onNewNote }` | Compact mobile top bar with hamburger, title & actions |
| `ObsidianRibbon` | `src/components/ribbon/obsidian-ribbon.tsx` | `{ isSidebarOpen, onToggleSidebar, onOpenVaultModal }` | Desktop 44px icon action rail |
| `ObsidianSidebar` | `src/components/sidebar/obsidian-sidebar.tsx` | `{ vault, vaults, nodes, activeFileId, onSelectVault, onDeleteNodes, ... }` | Explorer toolbar, tree hierarchy lines, Shift/Ctrl multi-selection, and bottom VaultDropdown |
| `VaultDropdown` | `src/components/sidebar/vault-dropdown.tsx` | `{ activeVault, vaults, onSelectVault, onOpenVaultModal }` | Bottom sidebar dropdown showing up to 3 vaults with modal 'View All' launcher |
| `FileTreeItem` | `src/components/sidebar/file-tree-item.tsx` | `{ node, depth, isActive, isSelected, isExpanded, onMove, ... }` | Single file/folder row with DnD drag & drop move, tree guide lines, selection highlight, inline rename/delete |
| `FileTreeActions` | `src/components/sidebar/file-tree-actions.tsx` | `{ isFolder, onNewFile, onNewFolder, onRename, onDelete }` | Hover action buttons Lego block for quick file/folder addition and deletion |
| `ExplorerContextMenu` | `src/components/sidebar/explorer-context-menu.tsx` | `{ x, y, targetNode, onClose, onNewFile, onNewFolder, onRename, onDelete }` | VS Code/Code Server style right-click context menu with keyboard shortcuts |
| `ObsidianTabBar` | `src/components/tabs/obsidian-tab-bar.tsx` | `{ openFiles, activeFileId, viewMode, onToggleViewMode, onSelectTab, onCloseTab, onNewNote }` | Zero-margin multi-tab bar connected to editor with invisible active border, hidden scrollbars |
| `ObsidianEditor` | `src/components/editor/obsidian-editor.tsx` | `{ activeFile, viewMode, onSwitchToEdit, onSavingChange, ... }` | Master editor container switching between Live Edit, Reading Preview, and Code Server empty state |
| `ObsidianMarkdownView` | `src/components/editor/obsidian-markdown-view.tsx` | `{ fileId, fileName, initialContent, onDocChange, onStatsChange, ... }` | Distraction-free live editor centered with max-w-[840px] and consistent padding metrics |
| `ObsidianMarkdownPreview` | `src/components/editor/obsidian-markdown-preview.tsx` | `{ title, content, onSwitchToEdit, onNavigateWikilink }` | Reading View aligned with editor metrics (max-w-[840px] centered) |
| `ObsidianInlineTitle` | `src/components/editor/obsidian-inline-title.tsx` | `{ title, onRename, onEnter, autoFocus }` | Organic borderless document title heading synchronized with note file name |
| `SidebarPanelContainer` | `src/components/sidebar/sidebar-panel-container.tsx` | `{ activeMenu, onClose, vault, nodes, ... }` | Swappable primary side panel (explorer, search, outline, plugins) with drag-resizable width |
| `SearchPanel` | `src/components/sidebar/search-panel.tsx` | `{ nodes, onSelectFile }` | Fast live query filter searching file names and markdown contents |
| `OutlinePanel` | `src/components/sidebar/outline-panel.tsx` | `{ activeFile }` | Live markdown document outline parsing H1-H6 heading hierarchy |
| `PluginsPanel` | `src/components/sidebar/plugins-panel.tsx` | `{}` | Extensible plugin architecture and supported file formats status |
| `ResizableEditorGrid` | `src/components/editor/resizable-editor-grid.tsx` | `{ layout, nodes, viewMode, onSplit, onSelectTab, ... }` | 1 or 2 group grid editor with interactive splitter resizing |
| `EditorGroupView` | `src/components/editor/editor-group-view.tsx` | `{ group, nodes, viewMode, onSplit, ... }` | Editor group container hosting tab bar, editor instance, and drop zones |
| `GridSplitter` | `src/components/editor/grid-splitter.tsx` | `{ direction, onMouseDown, isResizing }` | Interactive horizontal/vertical divider handle for resizing editor groups |
| `EditorDropZone` | `src/components/editor/editor-drop-zone.tsx` | `{ onSplitDrop }` | Tab drag-and-drop overlay detecting right and bottom split zones |
| `SettingsModal` | `src/components/settings/settings-modal.tsx` | `{ isOpen, activeVault, onClose, onRenameVault }` | Project settings, editor preferences, and commercial MIT open-source license modal |
| `OpenSourceLicensesView` | `src/components/settings/open-source-licenses-view.tsx` | `{}` | 100% Permissive MIT/Apache-2.0 commercial allowance badges and OSS package catalog |

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