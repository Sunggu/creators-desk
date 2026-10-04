import { useRef, useState } from 'react';
import type { VaultDto } from '../../core/domain/vault.dto';
import { useActiveWorkspace } from '../../hooks/use-active-workspace';
import type { EditorStats } from '../../hooks/use-codemirror';
import { usePanelLayout } from '../../hooks/use-panel-layout';
import ObsidianMobileHeader from '../mobile/obsidian-mobile-header';
import ObsidianRibbon from '../ribbon/obsidian-ribbon';
import SettingsModal from '../settings/settings-modal';
import ObsidianSidebar from '../sidebar/obsidian-sidebar';
import ObsidianStatusBar from '../statusbar/obsidian-status-bar';
import ObsidianVaultModal from '../vault/obsidian-vault-modal';
import PanelContentRenderer from './panel-content-renderer';
import WorkspacePanelContainer from './workspace-panel-container';

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
  const layout = usePanelLayout();

  const toggleViewMode = () => setViewMode((m) => (m === 'edit' ? 'preview' : 'edit'));

  const handleCreateNewNote = async () => {
    setViewMode('edit');
    await workspace.createFile();
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
          isSidebarOpen={layout.isExplorerOpen}
          isSplitPreviewOpen={layout.isSplitPreviewOpen}
          onToggleSidebar={layout.toggleExplorer}
          onToggleSplitPreview={() => layout.toggleSplitPreview(workspace.activeFileId)}
          onOpenVaultModal={() => setIsVaultModalOpen(true)}
          onOpenSettingsModal={() => setIsSettingsModalOpen(true)}
        />

        {/* Flexible Desktop Workspace Panels */}
        <div className="hidden md:flex flex-1 h-full overflow-hidden">
          <WorkspacePanelContainer
            panels={layout.panels}
            onMovePanel={layout.movePanel}
            onClosePanel={layout.closePanel}
            onToggleSplitPreview={() => layout.toggleSplitPreview(workspace.activeFileId)}
            renderPanelContent={(panel) => (
              <PanelContentRenderer
                panel={panel}
                vault={vault}
                vaults={vaults}
                workspace={workspace}
                viewMode={viewMode}
                onToggleViewMode={toggleViewMode}
                onSwitchToEdit={() => setViewMode('edit')}
                onNewNote={handleCreateNewNote}
                onOpenVaultModal={() => setIsVaultModalOpen(true)}
                onSelectVault={onSelectVault}
                onSavingChange={setIsSaving}
                onStatsChange={setStats}
              />
            )}
          />
        </div>

        {/* Mobile Fullscreen Main Area */}
        <div className="flex md:hidden flex-1 h-full overflow-hidden">
          <PanelContentRenderer
            panel={{ id: 'mobile-editor', type: 'editor', slot: 'center', title: '에디터' }}
            vault={vault}
            vaults={vaults}
            workspace={workspace}
            viewMode={viewMode}
            onToggleViewMode={toggleViewMode}
            onSwitchToEdit={() => setViewMode('edit')}
            onNewNote={handleCreateNewNote}
            onOpenVaultModal={() => setIsVaultModalOpen(true)}
            onSelectVault={onSelectVault}
            onSavingChange={setIsSaving}
            onStatsChange={setStats}
          />
        </div>

        {/* Mobile Sidebar Off-canvas Drawer */}
        <div
          onClick={() => setIsMobileSidebarOpen(false)}
          className={`fixed inset-0 z-40 bg-black/60 backdrop-blur-xs transition-opacity duration-200 md:hidden ${
            isMobileSidebarOpen ? 'opacity-100 pointer-events-auto' : 'opacity-0 pointer-events-none'
          }`}
        />
        <div
          className={`fixed inset-y-0 left-0 z-50 w-72 max-w-[85vw] flex flex-col md:hidden bg-[#18181b] shadow-2xl transition-transform duration-200 ease-out ${
            isMobileSidebarOpen ? 'translate-x-0' : '-translate-x-full'
          }`}
        >
          <ObsidianSidebar
            vault={vault}
            vaults={vaults}
            nodes={workspace.nodes}
            activeFileId={workspace.activeFileId}
            onOpenVaultModal={() => { setIsMobileSidebarOpen(false); setIsVaultModalOpen(true); }}
            onSelectVault={(id) => { onSelectVault(id); setIsMobileSidebarOpen(false); }}
            onSelectFile={(id) => { workspace.selectFile(id); setIsMobileSidebarOpen(false); }}
            onCreateFile={async (name, pid) => {
              const created = await workspace.createFile(name, pid);
              setIsMobileSidebarOpen(false);
              return created;
            }}
            onCreateFolder={workspace.createFolder}
            onRenameNode={workspace.renameNode}
            onDeleteNode={workspace.deleteNode}
            onDeleteNodes={workspace.deleteNodes}
            onMoveNode={workspace.moveNode}
            onRefresh={workspace.refreshNodes}
            onCloseMobile={() => setIsMobileSidebarOpen(false)}
          />
        </div>
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
