import { useEffect, useRef, useState } from 'react';
import type { FileNodeDto } from '../../core/domain/file-node.dto';
import { INVALID_FILE_NAME_CHARS_REGEX, sanitizeFileName } from '../../utils/name-generator';
import FileTreeActions from './file-tree-actions';
import { TAB_DRAG_MIME } from '../../core/domain/tab-drag.dto';
import { useTranslate } from '../../i18n/use-i18n';
import MonochromeIcon from '../../ui/icon/monochrome-icon';

interface FileTreeItemProps {
  node: FileNodeDto;
  depth: number;
  isActive: boolean;
  isSelected?: boolean;
  isSelectionMode?: boolean;
  isExpanded: boolean;
  isEditingExternal?: boolean;
  onItemClick?: (e: React.MouseEvent) => void;
  onSelect?: (id: string) => void;
  onToggleExpand: (id: string) => void;
  onRename: (id: string, newName: string) => Promise<unknown> | void;
  onDelete: (id: string) => Promise<unknown> | void;
  onMove?: (id: string, newParentId: string | null) => Promise<unknown> | void;
  onContextMenu?: (node: FileNodeDto, x: number, y: number) => void;
  onCreateChildFile: (parentId: string) => void;
  onCreateChildFolder: (parentId: string) => void;
  onStartEditing?: (id: string) => void;
  onStopEditing?: () => void;
}

export default function FileTreeItem({
  node, depth, isActive, isSelected = false, isSelectionMode = false,
  isExpanded, isEditingExternal, onItemClick, onSelect, onToggleExpand,
  onRename, onDelete, onMove, onContextMenu,
  onCreateChildFile, onCreateChildFolder, onStartEditing, onStopEditing,
}: FileTreeItemProps) {
  const t = useTranslate();
  const isFolder = node.type === 'folder';
  const cleanName = isFolder ? node.name : node.name.replace(/\.md$/i, '');
  const [internalEditing, setInternalEditing] = useState(false);
  const isEditing = isEditingExternal ?? internalEditing;
  const [editName, setEditName] = useState(cleanName);
  const [isDragTarget, setIsDragTarget] = useState(false);
  const hoverExpandTimer = useRef<ReturnType<typeof setTimeout> | null>(null);

  useEffect(() => {
    if (isEditing) setEditName(cleanName);
  }, [isEditing, cleanName]);

  const clearHoverTimer = () => {
    if (hoverExpandTimer.current) {
      clearTimeout(hoverExpandTimer.current);
      hoverExpandTimer.current = null;
    }
  };
  useEffect(() => () => clearHoverTimer(), []);

  const stopEditing = () => {
    setInternalEditing(false);
    onStopEditing?.();
  };

  const handleRenameSubmit = async () => {
    const sanitized = sanitizeFileName(editName);
    if (!sanitized) {
      setEditName(cleanName);
      stopEditing();
      return;
    }
    const finalName = isFolder
      ? sanitized
      : (sanitized.toLowerCase().endsWith('.md') ? sanitized : `${sanitized}.md`);
    await onRename(node.id, finalName);
    stopEditing();
  };

  const handleDragOver = (e: React.DragEvent) => {
    if (!isFolder) return;
    e.preventDefault();
    e.stopPropagation();
    setIsDragTarget(true);
    if (!isExpanded && !hoverExpandTimer.current) {
      hoverExpandTimer.current = setTimeout(() => {
        onToggleExpand(node.id);
        hoverExpandTimer.current = null;
      }, 500);
    }
  };

  const handleDrop = (e: React.DragEvent) => {
    if (!isFolder) return;
    e.preventDefault();
    e.stopPropagation();
    setIsDragTarget(false);
    clearHoverTimer();
    const draggedId = e.dataTransfer.getData('text/plain');
    if (draggedId && draggedId !== node.id) onMove?.(draggedId, node.id);
  };

  const itemStateClasses = isDragTarget
    ? 'bg-violet-600/30 text-white ring-2 ring-violet-500 rounded-xs'
    : isSelected
    ? 'bg-violet-600/25 text-violet-100 ring-1 ring-inset ring-violet-500/40'
    : isActive
    ? 'bg-[#23232b] text-violet-200 font-semibold border-l-2 border-violet-500'
    : 'text-zinc-400 hover:bg-[#202026] hover:text-zinc-200';

  return (
    <div
      draggable={!isEditing}
      onDragStart={(e) => {
        e.dataTransfer.setData('text/plain', node.id);
        if (!isFolder) e.dataTransfer.setData(TAB_DRAG_MIME, node.id);
        e.dataTransfer.effectAllowed = 'move';
      }}
      onDragOver={handleDragOver}
      onDragLeave={() => { setIsDragTarget(false); clearHoverTimer(); }}
      onDrop={handleDrop}
      onClick={(e) => onItemClick ? onItemClick(e) : (isFolder ? onToggleExpand(node.id) : onSelect?.(node.id))}
      onContextMenu={(e) => { e.preventDefault(); onContextMenu?.(node, e.clientX, e.clientY); }}
      style={{ paddingLeft: `${depth * 14 + 8}px` }}
      className={`group relative flex h-7.5 cursor-pointer items-center justify-between pr-2 text-xs transition-colors select-none ${itemStateClasses}`}
    >
      <div className="flex items-center space-x-1.5 overflow-hidden">
        {isFolder ? (
          <button
            type="button"
            onClick={(e) => { e.stopPropagation(); onToggleExpand(node.id); }}
            className="flex h-3.5 w-3.5 shrink-0 items-center justify-center text-zinc-500 hover:text-zinc-300 cursor-pointer"
          >
            <MonochromeIcon name="chevronRight" className={`h-3 w-3 transition-transform ${isExpanded ? 'rotate-90' : ''}`} />
          </button>
        ) : (
          <span className="w-3.5 shrink-0" />
        )}

        {(isSelectionMode || isSelected) && (
          <span
            className={`flex h-3.5 w-3.5 shrink-0 items-center justify-center rounded-xs border transition-colors ${
              isSelected ? 'border-violet-500 bg-violet-600 text-white' : 'border-zinc-600 bg-zinc-800/60 text-transparent'
            }`}
          >
            {isSelected && <MonochromeIcon name="check" className="h-2.5 w-2.5" />}
          </span>
        )}

        <span className="h-3.5 w-3.5 shrink-0 text-zinc-500">
          {isFolder ? (
            <MonochromeIcon name={isExpanded ? 'folderOpen' : 'folder'} className={`h-3.5 w-3.5 ${isExpanded ? 'text-amber-400' : 'text-amber-500'}`} />
          ) : (
            <MonochromeIcon name="file" className="h-3.5 w-3.5 text-zinc-400" />
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
              if (e.key === 'Escape') { setEditName(cleanName); stopEditing(); }
            }}
            className="w-full rounded bg-zinc-800 px-1 py-0.5 text-xs text-zinc-100 outline-hidden ring-1 ring-violet-500"
          />
        ) : (
          <span className="truncate">{cleanName}</span>
        )}
      </div>

      <FileTreeActions
        isFolder={isFolder}
        onNewFile={() => onCreateChildFile(node.id)}
        onNewFolder={() => onCreateChildFolder(node.id)}
        onRename={() => { setEditName(cleanName); onStartEditing ? onStartEditing(node.id) : setInternalEditing(true); }}
        onDelete={() => {
          if (confirm(t('sidebar.deleteConfirm', { name: cleanName }))) onDelete(node.id);
        }}
      />
    </div>
  );
}
