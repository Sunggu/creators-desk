import { useMemo, useState } from 'react';
import type { FileNodeDto } from '../../core/domain/file-node.dto';
import type { VaultDto } from '../../core/domain/vault.dto';
import { useTreeSelection } from '../../hooks/use-tree-selection';
import ExplorerContextMenu from './explorer-context-menu';
import FileExplorerToolbar from './file-explorer-toolbar';
import FileTreeItem from './file-tree-item';
import VaultDropdown from './vault-dropdown';
import { useTranslate } from '../../i18n/use-i18n';

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
  onMoveNode?: (id: string, newParentId: string | null) => Promise<unknown>;
  onRefresh: () => void;
  onCloseMobile?: () => void;
}

export default function ObsidianSidebar({
  vault, vaults, nodes, activeFileId,
  onOpenVaultModal, onSelectVault, onSelectFile,
  onCreateFile, onCreateFolder, onRenameNode,
  onDeleteNode, onDeleteNodes, onMoveNode,
  onRefresh, onCloseMobile,
}: ObsidianSidebarProps) {
  const t = useTranslate();
  const [expandedFolders, setExpandedFolders] = useState<Set<string>>(new Set());
  const [contextMenu, setContextMenu] = useState<{ x: number; y: number; node: FileNodeDto | null } | null>(null);
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
    if (
      selectedIds.size === 0 ||
      !confirm(t('sidebar.bulkDeleteConfirm', { count: selectedIds.size }))
    )
      return;
    const ids = Array.from(selectedIds);
    if (onDeleteNodes) await onDeleteNodes(ids);
    else for (const id of ids) await onDeleteNode(id);
    clearSelection();
  };

  const handleRootDrop = (e: React.DragEvent) => {
    e.preventDefault();
    const draggedId = e.dataTransfer.getData('text/plain');
    if (draggedId) onMoveNode?.(draggedId, null);
  };

  const renderTree = (parentId: string | null, depth: number) => {
    const children = nodes.filter((n) => n.parentId === parentId);
    if (children.length === 0) return null;

    return (
      <div className={depth > 0 ? 'border-l border-zinc-800/80 ml-3 pl-0.5' : ''}>
        {children.map((node) => (
          <div key={node.id}>
            <FileTreeItem
              node={node}
              depth={depth}
              isActive={node.id === activeFileId}
              isSelected={selectedIds.has(node.id)}
              isExpanded={expandedFolders.has(node.id)}
              onItemClick={(e) => handleNodeClick(node, e)}
              onToggleExpand={toggleFolder}
              onRename={(id, name) => onRenameNode(id, name)}
              onDelete={(id) => onDeleteNode(id)}
              onMove={onMoveNode ? (id, pid) => onMoveNode(id, pid) : undefined}
              onContextMenu={(n, x, y) => setContextMenu({ x, y, node: n })}
              onCreateChildFile={(pid) => { onCreateFile(undefined, pid); setExpandedFolders((s) => new Set(s).add(pid)); }}
              onCreateChildFolder={(pid) => { onCreateFolder(undefined, pid); setExpandedFolders((s) => new Set(s).add(pid)); }}
            />
            {node.type === 'folder' && expandedFolders.has(node.id) && renderTree(node.id, depth + 1)}
          </div>
        ))}
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

      {/* Explorer Tree Drop Target */}
      <div
        onDragOver={(e) => { e.preventDefault(); e.dataTransfer.dropEffect = 'move'; }}
        onDrop={handleRootDrop}
        onContextMenu={(e) => {
          if (e.target === e.currentTarget) {
            e.preventDefault();
            setContextMenu({ x: e.clientX, y: e.clientY, node: null });
          }
        }}
        className="flex-1 overflow-y-auto py-1"
      >
        {nodes.length === 0 ? (
          <div className="p-4 text-center text-xs text-zinc-500">
            {t('sidebar.empty')}
            <button
              onClick={() => onCreateFile(undefined, null)}
              className="mt-2 block w-full text-center text-violet-400 hover:underline cursor-pointer"
            >
              {t('sidebar.createNote')}
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

      {contextMenu && (
        <ExplorerContextMenu
          x={contextMenu.x}
          y={contextMenu.y}
          targetNode={contextMenu.node}
          onClose={() => setContextMenu(null)}
          onNewFile={(pid) => onCreateFile(undefined, pid)}
          onNewFolder={(pid) => onCreateFolder(undefined, pid)}
          onRename={(id) => {
            const next = prompt(
              t('sidebar.renamePrompt'),
              nodes.find((n) => n.id === id)?.name.replace(/\.md$/i, ''),
            );
            if (next) onRenameNode(id, next);
          }}
          onDelete={(id) => {
            const node = nodes.find((n) => n.id === id);
            if (confirm(t('sidebar.deleteConfirm', { name: node?.name ?? '' }))) onDeleteNode(id);
          }}
        />
      )}
    </aside>
  );
}
