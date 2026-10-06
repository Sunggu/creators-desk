import { useCallback, useEffect, useState } from 'react';
import { EMPTY_EDITOR_STATS } from '../../core/domain/editor-stats.dto';
import type { EditorStats } from '../../core/domain/editor-stats.dto';
import type { SidebarMenuId } from '../../core/domain/sidebar-panel.dto';
import type { VaultDto } from '../../core/domain/vault.dto';
import { useActiveWorkspace } from '../../hooks/use-active-workspace';
import { useDrawerGesture } from '../../hooks/use-drawer-gesture';
import { useEditorGrid } from '../../hooks/use-editor-grid';
import ResizableEditorGrid from '../editor/resizable-editor-grid';
import ObsidianMobileHeader from '../mobile/obsidian-mobile-header';
import ObsidianRibbon from '../ribbon/obsidian-ribbon';
import SettingsModal from '../settings/settings-modal';
import RightSidebarPanel from '../sidebar/right-sidebar-panel';
import SidebarPanelContainer from '../sidebar/sidebar-panel-container';
import ObsidianStatusBar from '../statusbar/obsidian-status-bar';
import ObsidianVaultModal from '../vault/obsidian-vault-modal';
import MobileDrawer from './mobile-drawer';
import { useSidebarPanelData } from './use-sidebar-panel-data';
import { useWorkspaceCommands } from './use-workspace-commands';

interface ObsidianShellProps {
  vault: VaultDto;
  vaults: VaultDto[];
  onSelectVault: (id: string) => void;
  onCreateVault: (name: string) => Promise<VaultDto>;
  onDeleteVault: (id: string) => void;
}

export default function ObsidianShell({ vault, vaults, onSelectVault, onCreateVault, onDeleteVault }: ObsidianShellProps) {
  const [activeSideMenu, setActiveSideMenu] = useState<SidebarMenuId | null>('explorer');
  // Mobile-only. Kept separate from `activeSideMenu` so a phone never inherits a
  // desktop panel state, and so first paint on a phone lands on the editor.
  const [isDrawerOpen, setIsDrawerOpen] = useState(false);
  const [isRightPanelOpen, setIsRightPanelOpen] = useState(false);
  const [isVaultModalOpen, setIsVaultModalOpen] = useState(false);
  const [isSettingsModalOpen, setIsSettingsModalOpen] = useState(false);
  const [viewMode, setViewMode] = useState<'edit' | 'preview'>('edit');
  const [isSaving, setIsSaving] = useState(false);
  const [stats, setStats] = useState<EditorStats>(EMPTY_EDITOR_STATS);

  const workspace = useActiveWorkspace(vault.id);
  const grid = useEditorGrid();
  const commands = useWorkspaceCommands({ workspace, grid, setViewMode });

  const openDrawer = useCallback(() => setIsDrawerOpen(true), []);
  const closeDrawer = useCallback(() => setIsDrawerOpen(false), []);
  const toggleDrawer = useCallback(() => setIsDrawerOpen((prev) => !prev), []);
  const gesture = useDrawerGesture({ onOpen: openDrawer, onClose: closeDrawer });

  // Seed the grid with the restored session file, then keep it as the tab owner.
  //
  // Depends on the stable `openFile` callback, never on the `grid` object: the
  // hook returns a fresh literal every render, so listing it as a dependency made
  // this effect fire forever and `openFile` keep minting new layouts — the shell
  // could never reach a stable render, which is why the editor surface felt dead.
  const openFileInGrid = grid.openFile;
  useEffect(() => {
    if (workspace.activeFileId) openFileInGrid(workspace.activeFileId);
  }, [workspace.activeFileId, openFileInGrid]);

  const toggleViewMode = useCallback(
    () => setViewMode((m) => (m === 'edit' ? 'preview' : 'edit')),
    [],
  );
  const toggleSideMenu = useCallback(
    (menu: SidebarMenuId) => setActiveSideMenu((prev) => (prev === menu ? null : menu)),
    [],
  );
  /** Drawer navigation always lands on a panel; it never collapses to "none". */
  const selectDrawerMenu = useCallback((menu: SidebarMenuId) => setActiveSideMenu(menu), []);
  const openVaultModal = useCallback(() => {
    closeDrawer();
    setIsVaultModalOpen(true);
  }, [closeDrawer]);
  const openSettingsModal = useCallback(() => {
    closeDrawer();
    setIsSettingsModalOpen(true);
  }, [closeDrawer]);

  const panelData = useSidebarPanelData({
    vault, vaults, workspace, commands, onSelectVault, onOpenVaultModal: openVaultModal,
  });

  return (
    <div className="flex h-screen h-[100dvh] w-screen flex-col overflow-hidden bg-[#1e1e22] text-[#dcddde] font-sans antialiased">
      <ObsidianMobileHeader
        vault={vault}
        activeFile={workspace.activeFile}
        viewMode={viewMode}
        isDrawerOpen={isDrawerOpen}
        isOutlineOpen={isRightPanelOpen}
        onToggleDrawer={toggleDrawer}
        onToggleViewMode={toggleViewMode}
        onToggleOutline={() => setIsRightPanelOpen((prev) => !prev)}
        onOpenVaultModal={openVaultModal}
        onNewNote={commands.createNote}
      />

      <div {...gesture.edgeProps} data-workspace className="relative flex flex-1 overflow-hidden">
        <ObsidianRibbon
          activeMenu={activeSideMenu}
          onSelectMenu={toggleSideMenu}
          onOpenVaultModal={openVaultModal}
          onOpenSettingsModal={openSettingsModal}
        />

        <SidebarPanelContainer
          {...panelData}
          activeMenu={activeSideMenu}
          onClose={() => setActiveSideMenu(null)}
        />

        <main className="flex flex-1 flex-col overflow-hidden bg-[#1e1e22]">
          <ResizableEditorGrid
            layout={grid.layout}
            nodes={workspace.nodes}
            viewMode={viewMode}
            autoFocusFileId={workspace.isNewFile ? workspace.newlyCreatedFileId : null}
            onToggleViewMode={toggleViewMode}
            onSelectTab={commands.selectTab}
            onCloseTab={grid.closeFile}
            onCloseOtherTabs={grid.closeOtherFiles}
            onMoveTab={commands.moveTab}
            onNewNote={commands.createNote}
            onSplit={grid.split}
            onCloseGroup={grid.closeGroup}
            onSavingChange={setIsSaving}
            onStatsChange={setStats}
            onRenameFile={workspace.renameNode}
            onSwitchToEdit={() => setViewMode('edit')}
            onNavigateWikilink={commands.navigateWikilink}
            onSplitRatioChange={grid.setSplitRatio}
            isRightPanelOpen={isRightPanelOpen}
            onToggleRightPanel={() => setIsRightPanelOpen((prev) => !prev)}
          />
        </main>

        <RightSidebarPanel
          isOpen={isRightPanelOpen}
          onClose={() => setIsRightPanelOpen(false)}
          activeFile={workspace.activeFile}
        />
      </div>

      <MobileDrawer
        {...panelData}
        isOpen={isDrawerOpen}
        activeMenu={activeSideMenu ?? 'explorer'}
        onSelectMenu={selectDrawerMenu}
        onClose={closeDrawer}
        onOpenVaultModal={openVaultModal}
        onOpenSettingsModal={openSettingsModal}
        panelGestureProps={gesture.panelProps}
      />

      <ObsidianStatusBar stats={stats} isSaving={isSaving} />

      <ObsidianVaultModal
        isOpen={isVaultModalOpen}
        activeVaultId={vault.id}
        vaults={vaults}
        onClose={() => setIsVaultModalOpen(false)}
        onSelectVault={onSelectVault}
        onCreateVault={onCreateVault}
        onDeleteVault={onDeleteVault}
      />

      <SettingsModal
        isOpen={isSettingsModalOpen}
        activeVault={vault}
        onClose={() => setIsSettingsModalOpen(false)}
      />
    </div>
  );
}