import { useEffect, useRef, useState } from 'react';
import type { SidebarMenuId } from '../../core/domain/sidebar-panel.dto';
import type { VaultDto } from '../../core/domain/vault.dto';
import { useActiveWorkspace } from '../../hooks/use-active-workspace';
import type { EditorStats } from '../../hooks/use-codemirror';
import { useEditorGrid } from '../../hooks/use-editor-grid';
import ResizableEditorGrid from '../editor/resizable-editor-grid';
import ObsidianMobileHeader from '../mobile/obsidian-mobile-header';
import ObsidianRibbon from '../ribbon/obsidian-ribbon';
import SettingsModal from '../settings/settings-modal';
import RightSidebarPanel from '../sidebar/right-sidebar-panel';
import SidebarPanelContainer from '../sidebar/sidebar-panel-container';
import ObsidianStatusBar from '../statusbar/obsidian-status-bar';
import ObsidianVaultModal from '../vault/obsidian-vault-modal';

interface ObsidianShellProps {
  vault: VaultDto;
  vaults: VaultDto[];
  onSelectVault: (id: string) => void;
  onCreateVault: (name: string) => Promise<VaultDto>;
  onDeleteVault: (id: string) => void;
}

export default function ObsidianShell({
  vault,
  vaults,
  onSelectVault,
  onCreateVault,
  onDeleteVault,
}: ObsidianShellProps) {
  const [activeSideMenu, setActiveSideMenu] = useState<SidebarMenuId | null>('explorer');
  const [isRightPanelOpen, setIsRightPanelOpen] = useState(false);
  const [isMobileSidebarOpen, setIsMobileSidebarOpen] = useState(false);
  const [isVaultModalOpen, setIsVaultModalOpen] = useState(false);
  const [isSettingsModalOpen, setIsSettingsModalOpen] = useState(false);
  const [viewMode, setViewMode] = useState<'edit' | 'preview'>('edit');
  const [isSaving, setIsSaving] = useState(false);
  const [stats, setStats] = useState<EditorStats>({
    words: 0,
    chars: 0,
    cursorLine: 1,
    cursorCol: 1,
  });

  const touchStartXRef = useRef<number | null>(null);
  const workspace = useActiveWorkspace(vault.id);
  const editorGrid = useEditorGrid();

  // Sync workspace open files to initial grid
  useEffect(() => {
    if (workspace.activeFileId) {
      editorGrid.openFile(workspace.activeFileId);
    }
  }, [workspace.activeFileId]);

  const toggleViewMode = () => setViewMode((m) => (m === 'edit' ? 'preview' : 'edit'));

  const handleSelectSideMenu = (menu: SidebarMenuId) => {
    setActiveSideMenu((prev) => (prev === menu ? null : menu));
  };

  const handleCreateNewNote = async () => {
    setViewMode('edit');
    const created = await workspace.createFile();
    if (created) editorGrid.openFile(created.id);
    setIsMobileSidebarOpen(false);
  };

  const handleTouchStart = (e: React.TouchEvent) => { touchStartXRef.current = e.touches[0].clientX; };
  const handleTouchEnd = (e: React.TouchEvent) => {
    if (touchStartXRef.current === null) return;
    const deltaX = e.changedTouches[0].clientX - touchStartXRef.current;
    if (touchStartXRef.current < 45 && deltaX > 50) setIsMobileSidebarOpen(true);
    else if (isMobileSidebarOpen && deltaX < -50) setIsMobileSidebarOpen(false);
    touchStartXRef.current = null;
  };

  return (
    <div
      onTouchStart={handleTouchStart}
      onTouchEnd={handleTouchEnd}
      className="flex h-screen h-[100dvh] w-screen flex-col overflow-hidden bg-[#1e1e22] text-[#dcddde] font-sans antialiased"
    >
      <ObsidianMobileHeader
        vault={vault}
        activeFile={workspace.activeFile}
        viewMode={viewMode}
        onToggleViewMode={toggleViewMode}
        onOpenSidebar={() => setIsMobileSidebarOpen(true)}
        onOpenVaultModal={() => setIsVaultModalOpen(true)}
        onNewNote={handleCreateNewNote}
      />

      <div className="flex flex-1 overflow-hidden relative">
        <ObsidianRibbon
          activeMenu={activeSideMenu}
          onSelectMenu={handleSelectSideMenu}
          onOpenVaultModal={() => setIsVaultModalOpen(true)}
          onOpenSettingsModal={() => setIsSettingsModalOpen(true)}
        />

        {/* Resizable Primary Side Panel */}
        <SidebarPanelContainer
          activeMenu={activeSideMenu}
          onClose={() => setActiveSideMenu(null)}
          vault={vault}
          vaults={vaults}
          nodes={workspace.nodes}
          activeFileId={workspace.activeFileId}
          onSelectVault={onSelectVault}
          onOpenVaultModal={() => setIsVaultModalOpen(true)}
          onSelectFile={(id) => {
            workspace.selectFile(id);
            editorGrid.openFile(id);
          }}
          onCreateFile={workspace.createFile}
          onCreateFolder={workspace.createFolder}
          onRenameNode={workspace.renameNode}
          onDeleteNode={workspace.deleteNode}
          onDeleteNodes={workspace.deleteNodes}
          onMoveNode={workspace.moveNode}
          onRefresh={workspace.refreshNodes}
        />

        {/* Central Resizable Grid Editor Area */}
        <main className="flex flex-1 flex-col overflow-hidden bg-[#1e1e22]">
          <ResizableEditorGrid
            layout={editorGrid.layout}
            nodes={workspace.nodes}
            viewMode={viewMode}
            onToggleViewMode={toggleViewMode}
            onSelectTab={editorGrid.selectFile}
            onCloseTab={editorGrid.closeFile}
            onCloseOtherTabs={editorGrid.closeOtherFiles}
            onNewNote={handleCreateNewNote}
            onSplit={editorGrid.split}
            onCloseGroup={editorGrid.closeGroup}
            onSavingChange={setIsSaving}
            onStatsChange={setStats}
            onRenameFile={workspace.renameNode}
            isRightPanelOpen={isRightPanelOpen}
            onToggleRightPanel={() => setIsRightPanelOpen((prev) => !prev)}
          />
        </main>

        {/* Right Secondary Panel (문서 목차 Outline) */}
        <RightSidebarPanel
          isOpen={isRightPanelOpen}
          onClose={() => setIsRightPanelOpen(false)}
          activeFile={workspace.activeFile}
        />
      </div>

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
