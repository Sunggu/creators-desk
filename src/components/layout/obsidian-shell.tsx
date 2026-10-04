import { useRef, useState } from 'react';
import type { VaultDto } from '../../core/domain/vault.dto';
import { useActiveWorkspace } from '../../hooks/use-active-workspace';
import type { EditorStats } from '../../hooks/use-codemirror';
import ObsidianEditor from '../editor/obsidian-editor';
import ObsidianMobileHeader from '../mobile/obsidian-mobile-header';
import ObsidianRibbon from '../ribbon/obsidian-ribbon';
import ObsidianSidebar from '../sidebar/obsidian-sidebar';
import ObsidianStatusBar from '../statusbar/obsidian-status-bar';
import ObsidianTabBar from '../tabs/obsidian-tab-bar';
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
  const [isDesktopSidebarOpen, setIsDesktopSidebarOpen] = useState(true);
  const [isMobileSidebarOpen, setIsMobileSidebarOpen] = useState(false);
  const [isVaultModalOpen, setIsVaultModalOpen] = useState(false);
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
      {/* Mobile Top Header (Hidden on Desktop) */}
      <ObsidianMobileHeader
        vault={vault}
        activeFile={workspace.activeFile}
        viewMode={viewMode}
        onToggleViewMode={toggleViewMode}
        onOpenSidebar={() => setIsMobileSidebarOpen(true)}
        onOpenVaultModal={() => setIsVaultModalOpen(true)}
        onNewNote={handleCreateNewNote}
      />

      {/* Main Workspace Area */}
      <div className="flex flex-1 overflow-hidden relative">
        {/* Desktop Left Ribbon */}
        <ObsidianRibbon
          isSidebarOpen={isDesktopSidebarOpen}
          onToggleSidebar={() => setIsDesktopSidebarOpen((prev) => !prev)}
          onOpenVaultModal={() => setIsVaultModalOpen(true)}
        />

        {/* Desktop File Explorer Sidebar */}
        {isDesktopSidebarOpen && (
          <div className="hidden md:flex h-full shrink-0">
            <ObsidianSidebar
              vault={vault}
              vaults={vaults}
              nodes={workspace.nodes}
              activeFileId={workspace.activeFileId}
              onOpenVaultModal={() => setIsVaultModalOpen(true)}
              onSelectVault={onSelectVault}
              onSelectFile={workspace.selectFile}
              onCreateFile={workspace.createFile}
              onCreateFolder={workspace.createFolder}
              onRenameNode={workspace.renameNode}
              onDeleteNode={workspace.deleteNode}
              onRefresh={workspace.refreshNodes}
            />
          </div>
        )}

        {/* Mobile Sidebar Off-canvas Drawer with Backdrop */}
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
            onOpenVaultModal={() => {
              setIsMobileSidebarOpen(false);
              setIsVaultModalOpen(true);
            }}
            onSelectVault={(id) => {
              onSelectVault(id);
              setIsMobileSidebarOpen(false);
            }}
            onSelectFile={(id) => {
              workspace.selectFile(id);
              setIsMobileSidebarOpen(false);
            }}
            onCreateFile={async (name, parentId) => {
              const created = await workspace.createFile(name, parentId);
              setIsMobileSidebarOpen(false);
              return created;
            }}
            onCreateFolder={workspace.createFolder}
            onRenameNode={workspace.renameNode}
            onDeleteNode={workspace.deleteNode}
            onRefresh={workspace.refreshNodes}
            onCloseMobile={() => setIsMobileSidebarOpen(false)}
          />
        </div>

        {/* Main Editor Pane with Tab Bar */}
        <main className="flex flex-1 flex-col overflow-hidden bg-[#1e1e22] w-full">
          {/* Desktop Tab Bar */}
          <ObsidianTabBar
            activeFile={workspace.activeFile}
            viewMode={viewMode}
            onToggleViewMode={toggleViewMode}
            onNewNote={handleCreateNewNote}
            onCloseNote={() => workspace.selectFile(null)}
          />

          <div className="flex-1 overflow-hidden">
            <ObsidianEditor
              activeFile={workspace.activeFile}
              viewMode={viewMode}
              onSwitchToEdit={() => setViewMode('edit')}
              onSavingChange={setIsSaving}
              onStatsChange={setStats}
              onNewNote={handleCreateNewNote}
              onRenameFile={workspace.renameNode}
              autoFocusTitle={workspace.isNewFile}
            />
          </div>
        </main>
      </div>

      {/* Bottom Status Bar */}
      <ObsidianStatusBar stats={stats} isSaving={isSaving} />

      {/* Vault Switcher Modal */}
      <ObsidianVaultModal
        isOpen={isVaultModalOpen}
        activeVaultId={vault.id}
        vaults={vaults}
        onClose={() => setIsVaultModalOpen(false)}
        onSelectVault={onSelectVault}
        onCreateVault={onCreateVault}
        onDeleteVault={onDeleteVault}
      />
    </div>
  );
}
