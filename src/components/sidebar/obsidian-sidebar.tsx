import { useState } from 'react';
import type { FileNodeDto } from '../../core/domain/file-node.dto';
import type { VaultDto } from '../../core/domain/vault.dto';
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
  onRefresh,
  onCloseMobile,
}: ObsidianSidebarProps) {
  const [expandedFolders, setExpandedFolders] = useState<Set<string>>(new Set());

  const toggleFolder = (id: string) => {
    setExpandedFolders((prev) => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
  };

  const handleNewFile = (parentId: string | null = null) => {
    onCreateFile(undefined, parentId);
    if (parentId) setExpandedFolders((prev) => new Set(prev).add(parentId));
    onCloseMobile?.();
  };

  const handleNewFolder = (parentId: string | null = null) => {
    onCreateFolder(undefined, parentId);
    if (parentId) setExpandedFolders((prev) => new Set(prev).add(parentId));
  };

  const handleFileSelect = (id: string) => {
    onSelectFile(id);
    onCloseMobile?.();
  };

  const renderTree = (parentId: string | null, depth: number) => {
    const children = nodes.filter((n) => n.parentId === parentId);
    if (children.length === 0) return null;

    return children.map((node) => {
      const isExpanded = expandedFolders.has(node.id);
      return (
        <div key={node.id}>
          <FileTreeItem
            node={node}
            depth={depth}
            isActive={node.id === activeFileId}
            isExpanded={isExpanded}
            onToggleExpand={toggleFolder}
            onSelect={handleFileSelect}
            onRename={async (id, newName) => {
              await onRenameNode(id, newName);
            }}
            onDelete={async (id) => {
              await onDeleteNode(id);
            }}
            onCreateChildFile={(pid) => handleNewFile(pid)}
            onCreateChildFolder={(pid) => handleNewFolder(pid)}
          />
          {node.type === 'folder' && isExpanded && renderTree(node.id, depth + 1)}
        </div>
      );
    });
  };

  return (
    <aside className="flex h-full w-full md:w-64 shrink-0 flex-col border-r border-[#26262e] bg-[#18181b] select-none text-zinc-300">
      {/* 1. Top Toolbar (Explorer title + action buttons + mobile close) */}
      <div className="flex h-11 items-center justify-between border-b border-[#24242a] px-3.5">
        <span className="text-[11px] font-bold tracking-wider text-zinc-400 uppercase">
          탐색기
        </span>
        <div className="flex items-center space-x-1.5">
          <button
            onClick={() => handleNewFile(null)}
            className="rounded p-1 hover:bg-[#25252c] hover:text-zinc-100 transition"
            title="새 노트 (+)"
          >
            <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
            </svg>
          </button>
          <button
            onClick={() => handleNewFolder(null)}
            className="rounded p-1 hover:bg-[#25252c] hover:text-zinc-100 transition"
            title="새 폴더"
          >
            <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 13h6m-3-3v6m-9 1V7a2 2 0 012-2h6l2 2h6a2 2 0 012 2v8a2 2 0 01-2 2H5a2 2 0 01-2-2z" />
            </svg>
          </button>
          <button
            onClick={onRefresh}
            className="rounded p-1 hover:bg-[#25252c] hover:text-zinc-100 transition"
            title="새로고침"
          >
            <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
            </svg>
          </button>
          {onCloseMobile && (
            <button
              onClick={onCloseMobile}
              className="md:hidden ml-1 rounded p-1 text-zinc-400 hover:text-zinc-100"
              title="닫기"
            >
              <svg className="h-4.5 w-4.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          )}
        </div>
      </div>

      {/* 2. Middle: File Tree items */}
      <div className="flex-1 overflow-y-auto py-1">
        {nodes.length === 0 ? (
          <div className="p-4 text-center text-xs text-zinc-500">
            노트가 없습니다.
            <button
              onClick={() => handleNewFile(null)}
              className="mt-2 block w-full text-center text-violet-400 hover:underline"
            >
              + 새 노트 만들기
            </button>
          </div>
        ) : (
          renderTree(null, 0)
        )}
      </div>

      {/* 3. Bottom: Vault Selector Dropdown */}
      <VaultDropdown
        activeVault={vault}
        vaults={vaults}
        onSelectVault={onSelectVault}
        onOpenVaultModal={onOpenVaultModal}
      />
    </aside>
  );
}
