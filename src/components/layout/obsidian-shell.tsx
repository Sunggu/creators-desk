import { useState } from 'react';
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
  const [isSaving, setIsSaving] = useState(false);
  const [stats, setStats] = useState<EditorStats>({
    words: 0,
    chars: 0,
    cursorLine: 1,
    cursorCol: 1,
  });

  const workspace = useActiveWorkspace(vault.id);

  const handleCreateNewNote = async () => {
    const name = prompt('새 노트 이름:', 'Untitled');
    if (name) {
      await workspace.createFile(name, null);
    }
  };

  return (
    <div className="flex h-screen h-[100dvh] w-screen flex-col overflow-hidden bg-[#1e1e22] text-[#dcddde] font-sans antialiased">
      {/* Mobile Top Header (Hidden on Desktop) */}
      <ObsidianMobileHeader
        vault={vault}
        activeFile={workspace.activeFile}
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
              nodes={workspace.nodes}
              activeFileId={workspace.activeFileId}
              onOpenVaultModal={() => setIsVaultModalOpen(true)}
              onSelectFile={workspace.selectFile}
              onCreateFile={workspace.createFile}
              onCreateFolder={workspace.createFolder}
              onRenameNode={workspace.renameNode}
              onDeleteNode={workspace.deleteNode}
              onRefresh={workspace.refreshNodes}
            />
          </div>
        )}

        {/* Mobile Sidebar Off-canvas Drawer */}
        {isMobileSidebarOpen && (
          <>
            <div
              onClick={() => setIsMobileSidebarOpen(false)}
              className="fixed inset-0 z-40 bg-black/60 backdrop-blur-xs md:hidden"
            />
            <div className="fixed inset-y-0 left-0 z-50 w-72 max-w-[85vw] flex flex-col md:hidden bg-[#18181b] shadow-2xl">
              <ObsidianSidebar
                vault={vault}
                nodes={workspace.nodes}
                activeFileId={workspace.activeFileId}
                onOpenVaultModal={() => {
                  setIsMobileSidebarOpen(false);
                  setIsVaultModalOpen(true);
                }}
                onSelectFile={workspace.selectFile}
                onCreateFile={workspace.createFile}
                onCreateFolder={workspace.createFolder}
                onRenameNode={workspace.renameNode}
                onDeleteNode={workspace.deleteNode}
                onRefresh={workspace.refreshNodes}
                onCloseMobile={() => setIsMobileSidebarOpen(false)}
              />
            </div>
          </>
        )}

        {/* Main Editor Pane with Tab Bar */}
        <main className="flex flex-1 flex-col overflow-hidden bg-[#1e1e22] w-full">
          {/* Desktop Tab Bar */}
          <ObsidianTabBar
            activeFile={workspace.activeFile}
            onNewNote={handleCreateNewNote}
            onCloseNote={() => workspace.selectFile(null)}
          />

          <div className="flex-1 overflow-hidden">
            <ObsidianEditor
              activeFile={workspace.activeFile}
              onSavingChange={setIsSaving}
              onStatsChange={setStats}
              onNewNote={handleCreateNewNote}
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
