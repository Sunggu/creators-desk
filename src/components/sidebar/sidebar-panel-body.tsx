import type { FileNodeDto } from '../../core/domain/file-node.dto';
import type { SidebarMenuId } from '../../core/domain/sidebar-panel.dto';
import type { VaultDto } from '../../core/domain/vault.dto';
import ObsidianSidebar from './obsidian-sidebar';
import SearchPanel from './search-panel';

export interface SidebarPanelBodyProps {
  activeMenu: SidebarMenuId;
  vault: VaultDto;
  vaults: VaultDto[];
  nodes: FileNodeDto[];
  activeFileId: string | null;
  onSelectVault: (vaultId: string) => void;
  onOpenVaultModal: () => void;
  onSelectFile: (fileId: string) => void;
  onCreateFile: (name?: string, parentId?: string | null) => Promise<unknown>;
  onCreateFolder: (name?: string, parentId?: string | null) => Promise<unknown>;
  onRenameNode: (id: string, newName: string) => Promise<unknown>;
  onDeleteNode: (id: string) => Promise<unknown>;
  onDeleteNodes?: (ids: string[]) => Promise<unknown>;
  onMoveNode?: (id: string, newParentId: string | null) => Promise<unknown>;
  onRefresh: () => void;
  /** Supplied only while the body is inside the mobile drawer. */
  onCloseMobile?: () => void;
}

/**
 * The swappable panel content, with no chrome and no sizing of its own.
 *
 * Extracted so the desktop resizable sidebar and the mobile drawer compose one
 * identical block instead of each re-implementing the explorer/search switch —
 * which is how the two surfaces previously drifted apart.
 */
export default function SidebarPanelBody({
  activeMenu,
  vault,
  vaults,
  nodes,
  activeFileId,
  onSelectVault,
  onOpenVaultModal,
  onSelectFile,
  onCreateFile,
  onCreateFolder,
  onRenameNode,
  onDeleteNode,
  onDeleteNodes,
  onMoveNode,
  onRefresh,
  onCloseMobile,
}: SidebarPanelBodyProps) {
  return (
    <div className="flex h-full min-h-0 flex-col overflow-hidden">
      {activeMenu === 'explorer' && (
        <ObsidianSidebar
          vault={vault}
          vaults={vaults}
          nodes={nodes}
          activeFileId={activeFileId}
          onOpenVaultModal={onOpenVaultModal}
          onSelectVault={onSelectVault}
          onSelectFile={onSelectFile}
          onCreateFile={onCreateFile}
          onCreateFolder={onCreateFolder}
          onRenameNode={onRenameNode}
          onDeleteNode={onDeleteNode}
          onDeleteNodes={onDeleteNodes}
          onMoveNode={onMoveNode}
          onRefresh={onRefresh}
          onCloseMobile={onCloseMobile}
        />
      )}
      {activeMenu === 'search' && (
        <SearchPanel nodes={nodes} onSelectFile={onSelectFile} onCloseMobile={onCloseMobile} />
      )}
    </div>
  );
}