import { useMemo, useState } from 'react';
import type { FileNodeDto } from '../../core/domain/file-node.dto';
import type { VaultDto } from '../../core/domain/vault.dto';
import { useTreeSelection } from '../../hooks/use-tree-selection';
import FileExplorerToolbar from './file-explorer-toolbar';
import FileTreeItem from './file-tree-item';
import VaultDropdown from './vault-dropdown';

interface ObsidianSidebarProps {
  vault: VaultDto;
  vaults: VaultDto[];
  nodes: FileNodeDto[];
  activeFileId: string | null;
  onOpenVaultModal: () => void;
  onSelectVault: (vaultId: string) => void;
  onSelectFile: (fileId: string) => void;
  onCreateFile: (name?: string, parentId?: string | null) => Promise<unknown>;
  onCreateFolder: (name?: string, parentId?: string | null) => Promise<unknown>;
  onRenameNode: (id: string, newName: string) => Promise<unknown>;
  onDeleteNode: (id: string) => Promise<unknown>;
  onDeleteNodes?: (ids: string[]) => Promise<unknown>;
  onRefresh: () => void;
  onCloseMobile?: () => void;
}

export default function ObsidianSidebar({
  vault,
  vaults,
  nodes,
  activeFileId,
  onOpenVaultModal,
  onSelectVault,
  onSelectFile,
  onCreateFile,
  onCreateFolder,
  onRenameNode,
  onDeleteNode,
  onDeleteNodes,
  onRefresh,
  onCloseMobile,
}: ObsidianSidebarProps) {
  const [expandedFolders, setExpandedFolders] = useState<Set<string>>(new Set());
  const { selectedIds, handleItemClick, clearSelection } = useTreeSelection();

  const toggleFolder = (id: string) => {
    setExpandedFolders((prev) => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
  };

  const flattenedVisibleNodes = useMemo(() => {
    const list: FileNodeDto[] = [];
    const traverse = (parentId: string | null) => {
      const children = nodes.filter((n) => n.parentId === parentId);
      for (const child of children) {
        list.push(child);
        if (child.type === 'folder' && expandedFolders.has(child.id)) {
          traverse(child.id);
        }
      }
    };
    traverse(null);
    return list;
  }, [nodes, expandedFolders]);

  const handleNodeClick = (node: FileNodeDto, e: React.MouseEvent) => {
    const isMultiKey = e.shiftKey || e.ctrlKey || e.metaKey;
    handleItemClick(node, flattenedVisibleNodes, e);

    if (!isMultiKey) {
      if (node.type === 'file') {
        onSelectFile(node.id);
        onCloseMobile?.();
      } else {
        toggleFolder(node.id);
      }
    }
  };

  const handleBulkDelete = async () => {
    const count = selectedIds.size;
    if (count === 0) return;
    if (!confirm(`선택한 ${count}개 항목을 모두 삭제하시겠습니까?`)) return;

    const ids = Array.from(selectedIds);
    if (onDeleteNodes) await onDeleteNodes(ids);
    else for (const id of ids) await onDeleteNode(id);
    clearSelection();
  };

  const renderTree = (parentId: string | null, depth: number) => {
    const children = nodes.filter((n) => n.parentId === parentId);
    if (children.length === 0) return null;

    return (
      <div className={depth > 0 ? 'border-l border-zinc-800/80 ml-3 pl-0.5' : ''}>
        {children.map((node) => {
          const isExpanded = expandedFolders.has(node.id);
          return (
            <div key={node.id}>
              <FileTreeItem
                node={node}
                depth={depth}
                isActive={node.id === activeFileId}
                isSelected={selectedIds.has(node.id)}
                isExpanded={isExpanded}
                onItemClick={(e) => handleNodeClick(node, e)}
                onToggleExpand={toggleFolder}
                onRename={async (id, newName) => { await onRenameNode(id, newName); }}
                onDelete={async (id) => { await onDeleteNode(id); }}
                onCreateChildFile={(pid) => { onCreateFile(undefined, pid); setExpandedFolders((s) => new Set(s).add(pid)); }}
                onCreateChildFolder={(pid) => { onCreateFolder(undefined, pid); setExpandedFolders((s) => new Set(s).add(pid)); }}
              />
              {node.type === 'folder' && isExpanded && renderTree(node.id, depth + 1)}
            </div>
          );
        })}
      </div>
    );
  };

  return (
    <aside className="flex h-full w-full md:w-64 shrink-0 flex-col border-r border-[#26262e] bg-[#18181b] select-none text-zinc-300">
      <FileExplorerToolbar
        onNewFile={() => onCreateFile(undefined, null)}
        onNewFolder={() => onCreateFolder(undefined, null)}
        onRefresh={onRefresh}
        onCloseMobile={onCloseMobile}
        selectedCount={selectedIds.size}
        onBulkDelete={handleBulkDelete}
        onClearSelection={clearSelection}
      />

      <div className="flex-1 overflow-y-auto py-1">
        {nodes.length === 0 ? (
          <div className="p-4 text-center text-xs text-zinc-500">
            노트가 없습니다.
            <button
              onClick={() => onCreateFile(undefined, null)}
              className="mt-2 block w-full text-center text-violet-400 hover:underline"
            >
              + 새 노트 만들기
            </button>
          </div>
        ) : (
          renderTree(null, 0)
        )}
      </div>

      <VaultDropdown
        activeVault={vault}
        vaults={vaults}
        onSelectVault={onSelectVault}
        onOpenVaultModal={onOpenVaultModal}
      />
    </aside>
  );
}
