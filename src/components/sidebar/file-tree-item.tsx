import { useState } from 'react';
import type { FileNodeDto } from '../../core/domain/file-node.dto';
import { INVALID_FILE_NAME_CHARS_REGEX, sanitizeFileName } from '../../utils/name-generator';

interface FileTreeItemProps {
  node: FileNodeDto;
  depth: number;
  isActive: boolean;
  isSelected?: boolean;
  isExpanded: boolean;
  onItemClick?: (e: React.MouseEvent) => void;
  onSelect?: (id: string) => void;
  onToggleExpand: (id: string) => void;
  onRename: (id: string, newName: string) => Promise<void>;
  onDelete: (id: string) => Promise<void>;
  onCreateChildFile: (parentId: string) => void;
  onCreateChildFolder: (parentId: string) => void;
}

export default function FileTreeItem({
  node,
  depth,
  isActive,
  isSelected = false,
  isExpanded,
  onItemClick,
  onSelect,
  onToggleExpand,
  onRename,
  onDelete,
  onCreateChildFile,
  onCreateChildFolder,
}: FileTreeItemProps) {
  const isFolder = node.type === 'folder';
  const cleanName = isFolder ? node.name : node.name.replace(/\.md$/i, '');

  const [isEditing, setIsEditing] = useState(false);
  const [editName, setEditName] = useState(cleanName);

  const handleClick = (e: React.MouseEvent) => {
    if (onItemClick) {
      onItemClick(e);
    } else {
      e.stopPropagation();
      if (isFolder) onToggleExpand(node.id);
      else onSelect?.(node.id);
    }
  };

  const handleRenameSubmit = async () => {
    const sanitized = sanitizeFileName(editName);
    if (!sanitized) {
      setEditName(cleanName);
      setIsEditing(false);
      return;
    }
    const finalName = isFolder
      ? sanitized
      : (sanitized.toLowerCase().endsWith('.md') ? sanitized : `${sanitized}.md`);
    await onRename(node.id, finalName);
    setIsEditing(false);
  };

  return (
    <div
      onClick={handleClick}
      style={{ paddingLeft: `${depth * 14 + 8}px` }}
      className={`group relative flex h-7.5 cursor-pointer items-center justify-between pr-2 text-xs transition-colors select-none ${
        isActive
          ? 'bg-violet-600/25 text-violet-200 font-semibold ring-1 ring-violet-500/40'
          : isSelected
          ? 'bg-violet-500/15 text-zinc-200'
          : 'text-zinc-400 hover:bg-[#202026] hover:text-zinc-200'
      }`}
    >
      <div className="flex items-center space-x-1.5 overflow-hidden">
        {isFolder ? (
          <button
            onClick={(e) => {
              e.stopPropagation();
              onToggleExpand(node.id);
            }}
            className="flex h-3.5 w-3.5 shrink-0 items-center justify-center text-zinc-500 hover:text-zinc-300"
          >
            <svg
              className={`h-3 w-3 transition-transform ${isExpanded ? 'rotate-90' : ''}`}
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
            >
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M9 5l7 7-7 7" />
            </svg>
          </button>
        ) : (
          <span className="w-3.5 shrink-0" />
        )}

        <span className="h-3.5 w-3.5 shrink-0 text-zinc-500">
          {isFolder ? (
            isExpanded ? (
              <svg className="h-3.5 w-3.5 text-amber-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 19a2 2 0 01-2-2V7a2 2 0 012-2h4l2 2h4a2 2 0 012 2v1M5 19h14a2 2 0 002-2v-5a2 2 0 00-2-2H9a2 2 0 00-2 2v5a2 2 0 01-2 2z" />
              </svg>
            ) : (
              <svg className="h-3.5 w-3.5 text-amber-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 7v10a2 2 0 002 2h14a2 2 0 002-2V9a2 2 0 00-2-2h-6l-2-2H5a2 2 0 00-2 2z" />
              </svg>
            )
          ) : (
            <svg className="h-3.5 w-3.5 text-zinc-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 21h10a2 2 0 002-2V9.414a1 1 0 00-.293-.707l-5.414-5.414A1 1 0 0012.586 3H7a2 2 0 00-2 2v14a2 2 0 002 2z" />
            </svg>
          )}
        </span>

        {isEditing ? (
          <input
            type="text"
            autoFocus
            value={editName}
            onClick={(e) => e.stopPropagation()}
            onChange={(e) => setEditName(e.target.value.replace(INVALID_FILE_NAME_CHARS_REGEX, ''))}
            onBlur={handleRenameSubmit}
            onKeyDown={(e) => {
              if (e.key === 'Enter') handleRenameSubmit();
              if (e.key === 'Escape') {
                setEditName(cleanName);
                setIsEditing(false);
              }
            }}
            className="w-full rounded bg-zinc-800 px-1 py-0.5 text-xs text-zinc-100 outline-hidden ring-1 ring-violet-500"
          />
        ) : (
          <span className="truncate">{cleanName}</span>
        )}
      </div>

      <div className="hidden items-center space-x-1 group-hover:flex">
        {isFolder && (
          <>
            <button
              onClick={(e) => { e.stopPropagation(); onCreateChildFile(node.id); }}
              title="새 노트 (+)"
              className="p-0.5 text-zinc-500 hover:text-zinc-200"
            >
              <svg className="h-3 w-3" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
              </svg>
            </button>
            <button
              onClick={(e) => { e.stopPropagation(); onCreateChildFolder(node.id); }}
              title="새 폴더"
              className="p-0.5 text-zinc-500 hover:text-zinc-200"
            >
              <svg className="h-3 w-3" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 13h6m-3-3v6m-9 1V7a2 2 0 012-2h6l2 2h6a2 2 0 012 2v8a2 2 0 01-2 2H5a2 2 0 01-2-2z" />
              </svg>
            </button>
          </>
        )}

        <button
          onClick={(e) => { e.stopPropagation(); setEditName(cleanName); setIsEditing(true); }}
          title="이름 바꾸기"
          className="p-0.5 text-zinc-500 hover:text-zinc-200"
        >
          <svg className="h-3 w-3" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15.232 5.232l3.536 3.536m-2.036-5.036a2.5 2.5 0 113.536 3.536L6.5 21.036H3v-3.572L16.732 3.732z" />
          </svg>
        </button>

        <button
          onClick={(e) => {
            e.stopPropagation();
            if (confirm(`'${cleanName}'을(를) 삭제하시겠습니까?`)) onDelete(node.id);
          }}
          title="삭제"
          className="p-0.5 text-zinc-500 hover:text-rose-400"
        >
          <svg className="h-3 w-3" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
          </svg>
        </button>
      </div>
    </div>
  );
}
