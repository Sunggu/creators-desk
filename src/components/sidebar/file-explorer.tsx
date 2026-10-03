import { useState } from 'react';
import type { FileNodeDto } from '../../core/domain/file-node.dto';
import FileExplorerToolbar from './file-explorer-toolbar';
import FileTreeItem from './file-tree-item';

interface FileExplorerProps {
  nodes: FileNodeDto[];
  activeFileId: string | null;
  onSelectFile: (fileId: string) => void;
  onCreateFile: (name: string, parentId?: string | null) => Promise<unknown>;
  onCreateFolder: (name: string, parentId?: string | null) => Promise<unknown>;
  onRenameNode: (id: string, newName: string) => Promise<unknown>;
  onDeleteNode: (id: string) => Promise<unknown>;
  onRefresh: () => void;
}

export default function FileExplorer({
  nodes,
  activeFileId,
  onSelectFile,
  onCreateFile,
  onCreateFolder,
  onRenameNode,
  onDeleteNode,
  onRefresh,
}: FileExplorerProps) {
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
    const name = prompt('새 노트 이름:', 'Untitled');
    if (name) {
      onCreateFile(name, parentId);
      if (parentId) {
        setExpandedFolders((prev) => new Set(prev).add(parentId));
      }
    }
  };

  const handleNewFolder = (parentId: string | null = null) => {
    const name = prompt('새 폴더 이름:', '새 폴더');
    if (name) {
      onCreateFolder(name, parentId);
      if (parentId) {
        setExpandedFolders((prev) => new Set(prev).add(parentId));
      }
    }
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
            onSelect={onSelectFile}
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
    <aside className="flex h-full w-60 shrink-0 flex-col border-r border-zinc-800/80 bg-zinc-950/70 select-none">
      <FileExplorerToolbar
        onNewFile={() => handleNewFile(null)}
        onNewFolder={() => handleNewFolder(null)}
        onRefresh={onRefresh}
      />

      <div className="flex-1 overflow-y-auto py-2">
        {nodes.length === 0 ? (
          <div className="p-4 text-center text-xs text-zinc-500">
            노트가 없습니다.
            <button
              onClick={() => handleNewFile(null)}
              className="mt-2 block w-full text-center text-sky-400 hover:underline"
            >
              + 새 노트 만들기
            </button>
          </div>
        ) : (
          renderTree(null, 0)
        )}
      </div>
    </aside>
  );
}
