import { useEffect, useRef } from 'react';
import { useTranslate } from '../../i18n/use-i18n';

interface TabContextMenuProps {
  x: number;
  y: number;
  fileId: string;
  onClose: () => void;
  onSplitHorizontal: (fileId: string) => void;
  onSplitVertical: (fileId: string) => void;
  onCloseTab: (fileId: string) => void;
  onCloseOtherTabs?: (fileId: string) => void;
}

export default function TabContextMenu({
  x,
  y,
  fileId,
  onClose,
  onSplitHorizontal,
  onSplitVertical,
  onCloseTab,
  onCloseOtherTabs,
}: TabContextMenuProps) {
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

  // Adjust position to avoid screen edge overflow
  const adjustedX = Math.min(x, window.innerWidth - 180);
  const adjustedY = Math.min(y, window.innerHeight - 160);

  return (
    <div
      ref={menuRef}
      style={{ top: `${adjustedY}px`, left: `${adjustedX}px` }}
      className="fixed z-50 min-w-44 rounded-md border border-[#2e2e38] bg-[#18181c] p-1 text-xs text-zinc-300 shadow-2xl animate-in fade-in zoom-in-95 duration-100 select-none"
    >
      <button
        onClick={() => {
          onSplitHorizontal(fileId);
          onClose();
        }}
        className="w-full flex items-center justify-between rounded px-2.5 py-1.5 hover:bg-violet-600/30 hover:text-white transition cursor-pointer"
      >
        <span className="flex items-center space-x-2">
          <svg className="h-3.5 w-3.5 text-violet-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.75} d="M9 4H5a1 1 0 00-1 1v14a1 1 0 001 1h4V4zm2 0v16h8a1 1 0 001-1V5a1 1 0 00-1-1h-8z" />
          </svg>
          <span>{t('tab.menuSplitRight')}</span>
        </span>
        <span className="text-[10px] text-zinc-500 font-mono">Split Right</span>
      </button>

      <button
        onClick={() => {
          onSplitVertical(fileId);
          onClose();
        }}
        className="w-full flex items-center justify-between rounded px-2.5 py-1.5 hover:bg-violet-600/30 hover:text-white transition cursor-pointer"
      >
        <span className="flex items-center space-x-2">
          <svg className="h-3.5 w-3.5 text-violet-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.75} d="M4 9V5a1 1 0 011-1h14a1 1 0 011 1v4H4zm0 2h16v8a1 1 0 01-1 1H5a1 1 0 01-1-1v-8z" />
          </svg>
          <span>{t('tab.menuSplitDown')}</span>
        </span>
        <span className="text-[10px] text-zinc-500 font-mono">Split Down</span>
      </button>

      <div className="my-1 border-t border-zinc-800" />

      <button
        onClick={() => {
          onCloseTab(fileId);
          onClose();
        }}
        className="w-full flex items-center justify-between rounded px-2.5 py-1.5 hover:bg-zinc-800 hover:text-zinc-100 transition cursor-pointer"
      >
        <span>{t('tab.menuCloseTab')}</span>
        <span className="text-[10px] text-zinc-500 font-mono">Ctrl+W</span>
      </button>

      {onCloseOtherTabs && (
        <button
          onClick={() => {
            onCloseOtherTabs(fileId);
            onClose();
          }}
          className="w-full flex items-center justify-between rounded px-2.5 py-1.5 hover:bg-zinc-800 hover:text-zinc-100 transition cursor-pointer"
        >
          <span>{t('tab.menuCloseOtherTabs')}</span>
        </button>
      )}
    </div>
  );
}
