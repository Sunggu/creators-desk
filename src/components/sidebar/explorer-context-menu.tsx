import { useEffect, useRef } from 'react';
import type { FileNodeDto } from '../../core/domain/file-node.dto';
import { useTranslate } from '../../i18n/use-i18n';

interface ExplorerContextMenuProps {
  x: number;
  y: number;
  targetNode: FileNodeDto | null;
  onClose: () => void;
  onNewFile: (parentId: string | null) => void;
  onNewFolder: (parentId: string | null) => void;
  onRename: (id: string) => void;
  onDelete: (id: string) => void;
}

export default function ExplorerContextMenu({
  x,
  y,
  targetNode,
  onClose,
  onNewFile,
  onNewFolder,
  onRename,
  onDelete,
}: ExplorerContextMenuProps) {
  const t = useTranslate();
  const menuRef = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    function handleClickOutside(e: MouseEvent) {
      if (menuRef.current && !menuRef.current.contains(e.target as Node)) {
        onClose();
      }
    }
    function handleKeyDown(e: KeyboardEvent) {
      if (e.key === 'Escape') onClose();
    }
    document.addEventListener('mousedown', handleClickOutside);
    document.addEventListener('keydown', handleKeyDown);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
      document.removeEventListener('keydown', handleKeyDown);
    };
  }, [onClose]);

  const parentId = targetNode
    ? targetNode.type === 'folder'
      ? targetNode.id
      : targetNode.parentId
    : null;

  return (
    <div
      ref={menuRef}
      style={{ top: `${y}px`, left: `${x}px` }}
      className="fixed z-50 min-w-44 rounded-md border border-[#2e2e38] bg-[#18181c] p-1 text-xs text-zinc-300 shadow-2xl animate-in fade-in zoom-in-95 duration-100 select-none"
    >
      <button
        onClick={() => { onNewFile(parentId); onClose(); }}
        className="w-full flex items-center justify-between rounded px-2 py-1 hover:bg-violet-600/30 hover:text-white transition"
      >
        <span>{t('sidebar.newNote')}</span>
        <span className="text-[10px] text-zinc-500">+</span>
      </button>

      <button
        onClick={() => { onNewFolder(parentId); onClose(); }}
        className="w-full flex items-center justify-between rounded px-2 py-1 hover:bg-violet-600/30 hover:text-white transition"
      >
        <span>{t('sidebar.newFolder')}</span>
      </button>

      {targetNode && (
        <>
          <div className="my-1 border-t border-[#26262e]" />
          <button
            onClick={() => { onRename(targetNode.id); onClose(); }}
            className="w-full flex items-center justify-between rounded px-2 py-1 hover:bg-violet-600/30 hover:text-white transition"
          >
            <span>{t('sidebar.rename')}</span>
            <span className="text-[10px] text-zinc-500">F2</span>
          </button>

          <button
            onClick={() => {
              navigator.clipboard?.writeText(targetNode.name);
              onClose();
            }}
            className="w-full flex items-center justify-between rounded px-2 py-1 hover:bg-violet-600/30 hover:text-white transition"
          >
            <span>{t('sidebar.copyName')}</span>
          </button>

          <div className="my-1 border-t border-[#26262e]" />
          <button
            onClick={() => { onDelete(targetNode.id); onClose(); }}
            className="w-full flex items-center justify-between rounded px-2 py-1 text-rose-400 hover:bg-rose-950/40 hover:text-rose-300 transition"
          >
            <span>{t('sidebar.remove')}</span>
            <span className="text-[10px] text-rose-500">Del</span>
          </button>
        </>
      )}
    </div>
  );
}
