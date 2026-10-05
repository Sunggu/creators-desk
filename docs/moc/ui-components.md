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
| `ObsidianTabBar` | `src/components/tabs/obsidian-tab-bar.tsx` | `{ openFiles, activeFileId, viewMode, onMoveTab, onSelectTab, onCloseTab, onNewNote, ... }` | Zero-margin multi-tab strip connected to editor with invisible active border, hidden scrollbars; maps open files to `TabItem` and owns `TabContextMenu` |
| `TabItem` | `src/components/tabs/tab-item.tsx` | `{ fileId, title, isActive, canReorder, onSelect, onClose, onContextMenu, onMove }` | Single tab Lego block: drag source for pane splitting and drag target for in-strip reordering with a violet insertion caret |
| `TabBarActions` | `src/components/tabs/tab-bar-actions.tsx` | `{ activeFileId, viewMode, canCloseGroup, onSplitHorizontal, onSplitVertical, onToggleViewMode, onToggleRightPanel, onCloseGroup }` | Right-hand tab bar action cluster (split right/down, view mode, outline, close split pane) |
| `TabContextMenu` | `src/components/tabs/tab-context-menu.tsx` | `{ x, y, fileId, onClose, onSplitRight, onSplitDown, onCloseTab, onCloseOtherTabs }` | Right-click context menu for editor tabs providing split horizontal/vertical and tab closing actions |
| `ObsidianEditor` | `src/components/editor/obsidian-editor.tsx` | `{ activeFile, viewMode, onSwitchToEdit, onSavingChange, ... }` | Master editor container switching between Live Edit, Reading Preview, and Code Server empty state |
| `ObsidianMarkdownView` | `src/components/editor/obsidian-markdown-view.tsx` | `{ fileId, fileName, initialContent, onDocChange, onStatsChange, ... }` | Distraction-free live editor centered with max-w-[840px] and consistent padding metrics |
| `ObsidianMarkdownPreview` | `src/components/editor/obsidian-markdown-preview.tsx` | `{ title, content, onSwitchToEdit, onNavigateWikilink }` | Reading View aligned with editor metrics (max-w-[840px] centered) |
| `ObsidianInlineTitle` | `src/components/editor/obsidian-inline-title.tsx` | `{ title, onRename, onEnter, autoFocus }` | Organic borderless document title heading synchronized with note file name |
| `SidebarPanelContainer` | `src/components/sidebar/sidebar-panel-container.tsx` | `{ activeMenu, onClose, vault, nodes, ... }` | Swappable primary side panel (explorer, search) with drag-resizable width |
| `SearchPanel` | `src/components/sidebar/search-panel.tsx` | `{ nodes, onSelectFile }` | Fast live query filter searching file names and markdown contents |
| `RightSidebarPanel` | `src/components/sidebar/right-sidebar-panel.tsx` | `{ isOpen, onClose, activeFile }` | Right-anchored resizable secondary panel hosting live document outline |
| `OutlinePanel` | `src/components/sidebar/outline-panel.tsx` | `{ activeFile }` | Live markdown document outline parsing H1-H6 heading hierarchy |
| `PluginsView` | `src/components/settings/plugins-view.tsx` | `{}` | Extensible plugin architecture and supported file formats status inside SettingsModal |
| `ResizableEditorGrid` | `src/components/editor/resizable-editor-grid.tsx` | `{ layout, nodes, viewMode, onSplit, onSelectTab, isRightPanelOpen, onToggleRightPanel, ... }` | 1 or 2 group grid editor with interactive splitter resizing and outline toggle |
| `EditorGroupView` | `src/components/editor/editor-group-view.tsx` | `{ group, nodes, viewMode, onSplit, isRightPanelOpen, onToggleRightPanel, ... }` | Editor group container hosting tab bar, editor instance, and drop zones |
| `GridSplitter` | `src/components/editor/grid-splitter.tsx` | `{ direction, onMouseDown, isResizing }` | Interactive horizontal/vertical divider handle for resizing editor groups |
| `EditorDropZone` | `src/components/editor/editor-drop-zone.tsx` | `{ onSplitDrop }` | Tab drag-and-drop overlay detecting right and bottom split zones |
| `SettingsModal` | `src/components/settings/settings-modal.tsx` | `{ isOpen, activeVault, onClose, onRenameVault }` | Project settings, editor preferences, extensible plugins, and open-source notice modal |
| `OpenSourceLicensesView` | `src/components/settings/open-source-licenses-view.tsx` | `{}` | AGPL-3.0 product licence summary, source-code offer, and entry point to the full generated notice |
| `LicenseNoticeCard` | `src/components/settings/license-notice-card.tsx` | `{ className }` | Product name, version, licence badge and copyright row; also exports `NoticePageLink` |
| `SourceCodeOffer` | `src/components/settings/source-code-offer.tsx` | `{ className }` | AGPL-3.0 section 13 source-code offer with the repository link |
| (static) Open Source Notice | `public/notice.html` (generated) | — | Standalone self-contained notice page: search, table of contents, per-library copyright, full licence texts |

## Lego Rules

- 컴포넌트는 **단일 props 객체** 또는 `children`만 받는다 (prop drilling 금지).
- 컴포넌트 안에서 데이터를 직접 가져오지 않는다 — hook과 use case는 상위 계층에 둔다.
- 순수 표시용 매핑은 컴포넌트 내부에 두고, 비즈니스 매핑은 use case에 둔다.
- 드래그 앤 드롭 계약은 `src/core/domain/tab-drag.dto.ts`의 `TAB_DRAG_MIME` / `TabDropPosition`을 사용한다.
  탭 드롭 위치 계산(`resolveTabDropPosition`)은 `src/utils/tab-drop-position.ts`의 순수 함수,
  탭 순서 변경은 `useEditorGrid`의 `reorderTabsHelper`가 담당한다.

## Design Tokens (Obsidian Dark Theme)

- Ribbon: `#121215`
- Sidebar: `#18181b`
- Tab Bar: `#141417`
- Editor: `#1e1e22`
- Status Bar: `#121215`
- Borders: `#26262e`
- Accent: Obsidian Violet `#7c3aed` / `#a78bfa`