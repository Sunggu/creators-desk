import type { VaultDto } from '../../core/domain/vault.dto';
import type { useActiveWorkspace } from '../../hooks/use-active-workspace';
import type { SidebarPanelBodyProps } from '../sidebar/sidebar-panel-body';
import type { useWorkspaceCommands } from './use-workspace-commands';

type ActiveWorkspace = ReturnType<typeof useActiveWorkspace>;
type WorkspaceCommands = ReturnType<typeof useWorkspaceCommands>;

/** The shared bundle; only `activeMenu` differs between the two hosts. */
export type SidebarPanelData = Omit<SidebarPanelBodyProps, 'activeMenu' | 'onCloseMobile'>;

interface UseSidebarPanelDataOptions {
  vault: VaultDto;
  vaults: VaultDto[];
  workspace: ActiveWorkspace;
  commands: WorkspaceCommands;
  onSelectVault: (vaultId: string) => void;
  onOpenVaultModal: () => void;
}

/**
 * Assembles the panel data exactly once so the desktop sidebar and the mobile
 * drawer can never receive different handlers — the drift that previously left
 * `onCloseMobile` wired in one host and missing in the other.
 */
export function useSidebarPanelData({
  vault,
  vaults,
  workspace,
  commands,
  onSelectVault,
  onOpenVaultModal,
}: UseSidebarPanelDataOptions): SidebarPanelData {
  return {
    vault,
    vaults,
    nodes: workspace.nodes,
    activeFileId: workspace.activeFileId,
    onSelectVault,
    onOpenVaultModal,
    onSelectFile: commands.openFile,
    onCreateFile: workspace.createFile,
    onCreateFolder: workspace.createFolder,
    onRenameNode: workspace.renameNode,
    onDeleteNode: commands.deleteNode,
    onDeleteNodes: commands.deleteNodes,
    onMoveNode: workspace.moveNode,
    onRefresh: workspace.refreshNodes,
  };
}