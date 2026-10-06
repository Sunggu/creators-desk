# UI Components Map of Content (MOC)

> Component catalog, design tokens, and Lego assembly rules.

---

## Catalog

| Component | File | Props | Purpose |
|---|---|---|---|
| `ObsidianShell` | `src/components/layout/obsidian-shell.tsx` | `{ vault, vaults, onSelectVault, onCreateVault, onDeleteVault }` | Responsive 3-pane shell; owns chrome state only, delegates every action to `useWorkspaceCommands` |
| `ObsidianMobileHeader` | `src/components/mobile/obsidian-mobile-header.tsx` | `{ vault, activeFile, viewMode, isDrawerOpen, isOutlineOpen, onToggleDrawer, onToggleViewMode, onToggleOutline, onOpenVaultModal, onNewNote }` | Compact mobile top bar. The hamburger is a **two-way** drawer toggle (`aria-expanded`); it also carries the view-mode and outline toggles that the desktop-only tab bar owns, so a phone is not missing editor controls |
| `ObsidianRibbon` | `src/components/ribbon/obsidian-ribbon.tsx` | `{ activeMenu, onSelectMenu, onOpenVaultModal, onOpenSettingsModal }` | Desktop 44px icon action rail |
| `ObsidianSidebar` | `src/components/sidebar/obsidian-sidebar.tsx` | `{ vault, vaults, nodes, activeFileId, onSelectVault, onDeleteNodes, ... }` | Explorer toolbar, tree hierarchy lines, Shift/Ctrl multi-selection, and bottom VaultDropdown |
| `VaultDropdown` | `src/components/sidebar/vault-dropdown.tsx` | `{ activeVault, vaults, onSelectVault, onOpenVaultModal }` | Bottom sidebar dropdown showing up to 3 vaults with modal 'View All' launcher |
| `FileTreeItem` | `src/components/sidebar/file-tree-item.tsx` | `{ node, depth, isActive, isSelected, isExpanded, onMove, ... }` | Single file/folder row with DnD drag & drop move, tree guide lines, selection highlight, inline rename/delete |
| `FileTreeActions` | `src/components/sidebar/file-tree-actions.tsx` | `{ isFolder, onNewFile, onNewFolder, onRename, onDelete }` | Hover action buttons Lego block for quick file/folder addition and deletion |
| `ExplorerContextMenu` | `src/components/sidebar/explorer-context-menu.tsx` | `{ x, y, targetNode, onClose, onNewFile, onNewFolder, onRename, onDelete }` | VS Code/Code Server style right-click context menu with keyboard shortcuts |
| `ObsidianTabBar` | `src/components/tabs/obsidian-tab-bar.tsx` | `{ openFiles, activeFileId, viewMode, onMoveTab, onSelectTab, onCloseTab, onNewNote, ... }` | Zero-margin multi-tab strip connected to editor with invisible active border, hidden scrollbars; maps open files to `TabItem` and owns `TabContextMenu` |
| `TabItem` | `src/components/tabs/tab-item.tsx` | `{ fileId, title, isActive, canReorder, onSelect, onClose, onContextMenu, onMove }` | Single tab Lego block: drag source for pane splitting and drag target for in-strip reordering with a violet insertion caret |
| `TabBarActions` | `src/components/tabs/tab-bar-actions.tsx` | `{ activeFileId, viewMode, canCloseGroup, onSplitHorizontal, onSplitVertical, onToggleViewMode, onToggleRightPanel, onCloseGroup }` | Right-hand tab bar action cluster (split right/down, view mode, outline, close split pane) |
| `TabContextMenu` | `src/components/tabs/tab-context-menu.tsx` | `{ x, y, fileId, onClose, onSplitRight, onSplitDown, onCloseTab, onCloseOtherTabs }` | Right-click context menu for editor tabs providing split horizontal/vertical and tab closing actions |
| `ObsidianEditor` | `src/components/editor/obsidian-editor.tsx` | `{ activeFile, viewMode, onSwitchToEdit, onNavigateWikilink, autoFocusTitle, onSavingChange, ... }` | Chooses the note surface: empty state, loading, Reading Preview, or live edit |
| `ObsidianMarkdownView` | `src/components/editor/obsidian-markdown-view.tsx` | `{ fileId, fileName, initialContent, onDocChange, onStatsChange, ... }` | Layout only: inline title, divider, CodeMirror mount point |
| `ObsidianMarkdownPreview` | `src/components/editor/obsidian-markdown-preview.tsx` | `{ title, content, onSwitchToEdit, onNavigateWikilink }` | Reading View aligned with editor metrics (max-w-[840px] centered) |
| `ObsidianInlineTitle` | `src/components/editor/obsidian-inline-title.tsx` | `{ title, onRename, onEnter, autoFocus }` | Organic borderless document title heading synchronized with note file name |
| `EditorEmptyState` | `src/components/editor/editor-empty-state.tsx` | `{ onNewNote }` | "No note is open" screen with new-note action and gesture legend |
| `ShortcutHint` | `src/components/editor/shortcut-hint.tsx` | `{ hint, label }` | One "gesture: what it does" row of the empty-state legend |
| `SplitDropOverlay` | `src/components/editor/split-drop-overlay.tsx` | `{ edge }` | **Decorative** right/bottom split affordance; inline `pointer-events: none`, renders nothing until armed |
| `ResizableEditorGrid` | `src/components/editor/resizable-editor-grid.tsx` | `{ layout, nodes, viewMode, autoFocusFileId, onSplit, onSelectTab, onSplitRatioChange, isRightPanelOpen, ... }` | Layout only: pane sizing, splitter, and ratio sync into the grid layout |
| `EditorGroupPane` | `src/components/editor/editor-group-pane.tsx` | `{ group, ...allSharedProps }` | Binds grid-scoped handlers to one pane. **Every shared prop is declared exactly once, here** |
| `EditorGroupView` | `src/components/editor/editor-group-view.tsx` | `{ group, nodes, viewMode, autoFocusFileId, onSwitchToEdit, onNavigateWikilink, ... }` | Single pane: tab bar, note surface, pane-level drag handlers, split overlay |
| `GridSplitter` | `src/components/editor/grid-splitter.tsx` | `{ direction, onMouseDown, isResizing }` | Interactive horizontal/vertical divider handle for resizing editor groups |
| `SidebarPanelBody` | `src/components/sidebar/sidebar-panel-body.tsx` | `{ activeMenu, vault, vaults, nodes, activeFileId, onSelectVault, ... , onCloseMobile? }` | Chrome-free, sizeless explorer/search switch. **Composed unchanged by both the desktop container and the mobile drawer** — the extraction that stopped the two hosts drifting (they previously disagreed on `onCloseMobile`) |
| `SidebarPanelContainer` | `src/components/sidebar/sidebar-panel-container.tsx` | `{ activeMenu, onClose, ...SidebarPanelBodyProps }` | Desktop-only chrome for the primary panel: drag-resizable width, header, close. `hidden md:flex` |
| `MobileDrawer` | `src/components/layout/mobile-drawer.tsx` | `{ isOpen, activeMenu, onSelectMenu, onClose, onOpenVaultModal, onOpenSettingsModal, panelGestureProps, ...SidebarPanelBodyProps }` | Off-canvas mobile drawer. Stays mounted for the slide transition and is `inert` + `pointer-events-none` while closed. Also the only mobile route to **search** and **settings**, which the `hidden md:flex` ribbon otherwise denied phones |
| `SearchPanel` | `src/components/sidebar/search-panel.tsx` | `{ nodes, onSelectFile }` | Fast live query filter searching file names and markdown contents |
| `RightSidebarPanel` | `src/components/sidebar/right-sidebar-panel.tsx` | `{ isOpen, onClose, activeFile }` | Live document outline. Resizable **docked column** at `md+`, full-width **overlay** below, so it can never squeeze the editor on a phone |
| `OutlinePanel` | `src/components/sidebar/outline-panel.tsx` | `{ activeFile }` | Live markdown document outline parsing H1-H6 heading hierarchy |
| `PluginsView` | `src/components/settings/plugins-view.tsx` | `{}` | Extensible plugin architecture and supported file formats status inside SettingsModal |
| `SettingsModal` | `src/components/settings/settings-modal.tsx` | `{ isOpen, activeVault, onClose, onRenameVault }` | Project settings, editor preferences, extensible plugins, and open-source notice modal |
| `OpenSourceLicensesView` | `src/components/settings/open-source-licenses-view.tsx` | `{}` | AGPL-3.0 product licence summary, source-code offer, and entry point to the full generated notice |
| `LicenseNoticeCard` | `src/components/settings/license-notice-card.tsx` | `{ className }` | Product name, version, licence badge and copyright row |
| `SourceCodeOffer` | `src/components/settings/source-code-offer.tsx` | `{ className }` | AGPL-3.0 section 13 source-code offer with the repository link |
| (static) Open Source Notice | `public/notice.html` (generated) | — | Standalone self-contained notice page: search, table of contents, per-library copyright, full licence texts |

## Editor Module (`src/editor/`)

CodeMirror-specific logic lives outside `components/` so components stay presentational
and the CodeMirror surface has a single implementation.

| Module | File | Purpose |
|---|---|---|
| `useMarkdownEditor` | `src/editor/use-markdown-editor.ts` | Mount/unmount lifecycle, stats reporting, debounced autosave, **flush-on-unmount** so tab switches never drop the last keystrokes |
| `computeEditorStats` / `countWords` | `src/editor/editor-stats.ts` | Pure status-bar derivation |
| `obsidianEditorTheme` | `src/editor/obsidian-editor-theme.ts` | `EditorView.theme` token styling |

Supporting hooks and utils:

| Module | File | Purpose |
|---|---|---|
| `useNoteDocument` | `src/components/editor/use-note-document.ts` | Loads/saves a note body through `FileContentUseCase`; readiness is derived, never reset in an effect |
| `useSplitDropTarget` | `src/hooks/use-split-drop-target.ts` | Arms the split edge from handlers bound to the **pane**, not to an overlay |
| `bindEditorPaneHandlers` | `src/components/editor/editor-group-binding.ts` | Pure group-id → handler binding |
| `resolveSplitDropEdge` | `src/utils/split-drop-edge.ts` | Pure pointer → edge resolution |
| `resolveWikilinkTarget` | `src/utils/resolve-wikilink-target.ts` | Pure `[[wikilink]]` → file resolution |
| `useWorkspaceCommands` | `src/components/layout/use-workspace-commands.ts` | Single place composing the file tree, the tab grid, and the view mode |
| `useWikilinkNavigation` | `src/components/layout/use-wikilink-navigation.ts` | Turns a wikilink activation into an open-file action |
| `useSidebarPanelData` | `src/components/layout/use-sidebar-panel-data.ts` | Assembles the shared panel bundle once so the desktop panel and the mobile drawer always receive identical handlers |
| `useDrawerGesture` | `src/hooks/use-drawer-gesture.ts` | Binds the pure swipe rules to React touch events. One binding per zone: `edgeProps` can only open, `panelProps` can only close |
| `resolveDrawerSwipe` | `src/utils/drawer-swipe.ts` | Pure gesture → action resolution (edge/drawer/content origin, vertical-intent rejection) |
| `MonochromeIcon` | `src/ui/icon/monochrome-icon.tsx` | The **only** icon primitive. `fill="none"`, `stroke="currentColor"`, one stroke weight for the whole app, `aria-hidden`. Never emoji |
| `ICON_PATHS` / `IconName` | `src/ui/icon/icon-paths.ts` | Single-source glyph registry on a shared 24x24 grid |

## Lego Rules

- 컴포넌트는 **단일 props 객체** 또는 `children`만 받는다 (prop drilling 금지).
- 컴포넌트 안에서 데이터를 직접 가져오지 않는다 — hook과 use case는 상위 계층에 둔다.
- 순수 표시용 매핑은 컴포넌트 내부에 두고, 비즈니스 매핑은 use case에 둔다.
- 드래그 앤 드롭 계약은 `src/core/domain/tab-drag.dto.ts`의 `TAB_DRAG_MIME` / `TabDropPosition`을 사용한다.
  탭 드롭 위치 계산(`resolveTabDropPosition`)은 `src/utils/tab-drop-position.ts`의 순수 함수,
  창 분할 엣지 계산(`resolveSplitDropEdge`)은 `src/utils/split-drop-edge.ts`의 순수 함수,
  탭 순서 변경은 `useEditorGrid`의 `reorderTabsHelper`가 담당한다.

### Overlay Safety (editing must never be blocked)

- 에디터 위에 겹치는 오버레이는 **반드시 `pointer-events: none`**이어야 한다. `SplitDropOverlay`는 이를 인라인 스타일로 선언한다.
- 드래그 핸들러는 오버레이가 아니라 **pane 컨테이너**에 붙인다 (`[data-editor-pane]`). 자식에서 올라오는 `dragover`/`drop` 버블링을 사용하므로 에디터는 영구적으로 상호작용 가능하다.
- 탭 드래그가 아닌 드래그는 무시한다 — `dataTransfer.types`에 `TAB_DRAG_MIME`이 없으면 `preventDefault`도 하지 않는다.
- 이 불변식은 `pane overlay contract` 테스트(`src/test/hit-test-overlay.ts`)가 강제한다.

### Icons are monochrome and emoji-free (enforced, not reviewed)

- **All** glyphs come from `MonochromeIcon` + `ICON_PATHS`. No inline `<svg>` literals in feature components.
- One colour only: `currentColor`. One stroke weight: `ICON_STROKE_WIDTH`. Sizing is a Tailwind class passed by the caller.
- **No emoji anywhere** — not in markup, not in translation bundles, not in console output. Settings-tab glyphs live in `SettingsTabRail`'s `TAB_META` map rather than inside `settings.tab*` strings, which is why they can be styled and reached by role at all.
- `src/ui/icon/monochrome-icon.spec.tsx` fails the build if a glyph carries a literal colour, or an emoji/arrow code point.

### Stable Hook Identity (effects must not re-arm themselves)

- `useEditorGrid`, `useActiveWorkspace`, and `useWorkspaceCommands` return **fresh objects each render**. Listing those objects in an effect dependency array re-runs the effect every render, and any `setState` inside it mints a new value, so the shell can never settle. This is what made the editor appear dead.
- Depend on the individual `useCallback` (`grid.openFile`), never on the returned object.
- `mobile-drawer.spec.tsx` mounts the real shell, so this class of regression is caught by a test rather than by a browser.

### Responsive Ownership (mobile is a first-class surface)

- Desktop chrome is `hidden md:flex`; its mobile counterpart is the drawer, not a shrunken desktop column.
- Both sidebars overlay the editor on narrow viewports instead of competing with it for horizontal space.
- Drawer behaviour rules live in `src/utils/drawer-swipe.ts` and are unit-tested there; `resolveDrawerSwipe` returns `null` for any mostly-vertical gesture so scrolling and text selection are never hijacked.
- Breakpoints must be real Tailwind sizes. `xs:` is **not** defined and silently compiles to nothing.

### Single Wiring Path (features must not overwrite each other)

- pane에 전달되는 공통 prop은 `EditorGroupPane`에서 **한 번만** 선언한다. 렌더 경로가 여러 개여도 새 기능이 빠지지 않는다.
- grid 수준 `(groupId, ...)` 콜백 → pane 수준 `(...)` 콜백 변환은 순수 함수 `bindEditorPaneHandlers` 한 곳에서만 happens.
- 탭 목록의 소유자는 `useEditorGrid` 단 하나다. `useActiveWorkspace`는 파일 트리(`nodes`)와 활성 파일 미러만 맡는다.

## Design Tokens (Obsidian Dark Theme)

- Ribbon: `#121215`
- Sidebar: `#18181b`
- Tab Bar: `#141417`
- Editor: `#1e1e22`
- Status Bar: `#121215`
- Borders: `#26262e`
- Accent: Obsidian Violet `#7c3aed` / `#a78bfa`