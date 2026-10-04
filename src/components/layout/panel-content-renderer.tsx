import type { PanelWindowConfig } from '../../core/domain/panel-layout.dto';
import type { VaultDto } from '../../core/domain/vault.dto';
import type { useActiveWorkspace } from '../../hooks/use-active-workspace';
import type { EditorStats } from '../../hooks/use-codemirror';
import ObsidianEditor from '../editor/obsidian-editor';
import ObsidianMarkdownPreview from '../editor/obsidian-markdown-preview';
import ObsidianSidebar from '../sidebar/obsidian-sidebar';
import ObsidianTabBar from '../tabs/obsidian-tab-bar';

interface PanelContentRendererProps {
  panel: PanelWindowConfig;
  vault: VaultDto;
  vaults: VaultDto[];
  workspace: ReturnType<typeof useActiveWorkspace>;
  viewMode: 'edit' | 'preview';
  onToggleViewMode: () => void;
  onSwitchToEdit: () => void;
  onNewNote: () => void;
  onOpenVaultModal: () => void;
  onSelectVault: (id: string) => void;
  onSavingChange: (saving: boolean) => void;
  onStatsChange: (stats: EditorStats) => void;
}

export default function PanelContentRenderer({
  panel,
  vault,
  vaults,
  workspace,
  viewMode,
  onToggleViewMode,
  onSwitchToEdit,
  onNewNote,
  onOpenVaultModal,
  onSelectVault,
  onSavingChange,
  onStatsChange,
}: PanelContentRendererProps) {
  if (panel.type === 'explorer') {
    return (
      <ObsidianSidebar
        vault={vault}
        vaults={vaults}
        nodes={workspace.nodes}
        activeFileId={workspace.activeFileId}
        onOpenVaultModal={onOpenVaultModal}
        onSelectVault={onSelectVault}
        onSelectFile={workspace.selectFile}
        onCreateFile={workspace.createFile}
        onCreateFolder={workspace.createFolder}
        onRenameNode={workspace.renameNode}
        onDeleteNode={workspace.deleteNode}
        onDeleteNodes={workspace.deleteNodes}
        onMoveNode={workspace.moveNode}
        onRefresh={workspace.refreshNodes}
      />
    );
  }

  if (panel.type === 'preview') {
    return (
      <div className="h-full overflow-y-auto bg-[#1e1e22]">
        <ObsidianMarkdownPreview
          title={workspace.activeFile?.name.replace(/\.md$/i, '') ?? '미리보기'}
          content={workspace.activeFile?.content ?? ''}
          onSwitchToEdit={onSwitchToEdit}
        />
      </div>
    );
  }

  // panel.type === 'editor'
  return (
    <div className="flex h-full flex-col overflow-hidden bg-[#1e1e22]">
      <ObsidianTabBar
        openFiles={workspace.openFiles}
        activeFileId={workspace.activeFileId}
        viewMode={viewMode}
        onToggleViewMode={onToggleViewMode}
        onSelectTab={workspace.selectFile}
        onCloseTab={workspace.closeFile}
        onNewNote={onNewNote}
      />
      <div className="flex-1 overflow-hidden">
        <ObsidianEditor
          activeFile={workspace.activeFile}
          viewMode={viewMode}
          onSwitchToEdit={onSwitchToEdit}
          onSavingChange={onSavingChange}
          onStatsChange={onStatsChange}
          onNewNote={onNewNote}
          onRenameFile={workspace.renameNode}
          autoFocusTitle={workspace.isNewFile}
        />
      </div>
    </div>
  );
}
