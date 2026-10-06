import { useState } from 'react';
import { TAB_DRAG_MIME } from '../../core/domain/tab-drag.dto';
import type { TabDropPosition } from '../../core/domain/tab-drag.dto';
import { resolveTabDropPosition } from '../../utils/tab-drop-position';
import { useTranslate } from '../../i18n/use-i18n';
import MonochromeIcon from '../../ui/icon/monochrome-icon';

interface TabItemProps {
  fileId: string;
  title: string;
  isActive: boolean;
  canReorder: boolean;
  onSelect: (fileId: string) => void;
  onClose: (fileId: string) => void;
  onContextMenu: (fileId: string, x: number, y: number) => void;
  onMove: (sourceFileId: string, targetFileId: string, position: TabDropPosition) => void;
}

export default function TabItem({
  fileId,
  title,
  isActive,
  canReorder,
  onSelect,
  onClose,
  onContextMenu,
  onMove,
}: TabItemProps) {
  const t = useTranslate();
  const [dropPosition, setDropPosition] = useState<TabDropPosition | null>(null);

  const handleDragStart = (e: React.DragEvent) => {
    e.dataTransfer.setData('text/plain', fileId);
    e.dataTransfer.setData(TAB_DRAG_MIME, fileId);
    e.dataTransfer.effectAllowed = 'move';
  };

  const handleDragOver = (e: React.DragEvent) => {
    if (!canReorder || !e.dataTransfer.types.includes(TAB_DRAG_MIME)) return;
    e.preventDefault();
    e.stopPropagation();
    e.dataTransfer.dropEffect = 'move';
    setDropPosition(resolveTabDropPosition(e.clientX, e.currentTarget.getBoundingClientRect()));
  };

  const handleDragLeave = () => setDropPosition(null);

  const handleDrop = (e: React.DragEvent) => {
    if (!canReorder) return;
    e.preventDefault();
    e.stopPropagation();
    setDropPosition(null);
    const position = resolveTabDropPosition(e.clientX, e.currentTarget.getBoundingClientRect());
    const sourceFileId = e.dataTransfer.getData(TAB_DRAG_MIME) || e.dataTransfer.getData('text/plain');
    if (sourceFileId) onMove(sourceFileId, fileId, position);
  };

  return (
    <div
      draggable={true}
      onDragStart={handleDragStart}
      onDragOver={handleDragOver}
      onDragLeave={handleDragLeave}
      onDrop={handleDrop}
      onClick={() => onSelect(fileId)}
      onContextMenu={(e) => {
        e.preventDefault();
        e.stopPropagation();
        onContextMenu(fileId, e.clientX, e.clientY);
      }}
      className={`group relative flex items-center space-x-2 text-xs font-medium transition-colors cursor-pointer select-none ${
        isActive
          ? 'z-10 -mb-[1px] h-9 px-3.5 bg-[#1e1e22] text-zinc-100 border-t-2 border-violet-500 border-x border-[#26262e] border-b-0'
          : 'h-8 mb-[1px] px-3 bg-transparent text-zinc-400 hover:bg-[#1a1a1e] hover:text-zinc-200 border-r border-[#222228]'
      }`}
      title={t('tab.contextMenuHint', { title })}
    >
      {dropPosition === 'before' && (
        <span className="absolute left-0 top-0 bottom-0 w-0.5 bg-violet-400 pointer-events-none" />
      )}
      {isActive && <span className="h-1.5 w-1.5 rounded-full bg-violet-400 shrink-0" />}
      <span className="truncate max-w-40">{title}</span>
      <button
        onClick={(e) => {
          e.stopPropagation();
          onClose(fileId);
        }}
        className="rounded p-0.5 text-zinc-400 opacity-60 hover:bg-[#2b2b32] hover:opacity-100 hover:text-zinc-100 transition"
        title={t('tab.closeTab')}
      >
        <MonochromeIcon name="close" className="h-3 w-3" />
      </button>
      {dropPosition === 'after' && (
        <span className="absolute right-0 top-0 bottom-0 w-0.5 bg-violet-400 pointer-events-none" />
      )}
    </div>
  );
}
