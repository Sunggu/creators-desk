import { useTranslate } from '../../i18n/use-i18n';
interface FileExplorerToolbarProps {
  onNewFile: () => void;
  onNewFolder: () => void;
  onRefresh: () => void;
  onCloseMobile?: () => void;
  selectedCount?: number;
  onBulkDelete?: () => void;
  onClearSelection?: () => void;
}

export default function FileExplorerToolbar({
  onNewFile,
  onNewFolder,
  onRefresh,
  onCloseMobile,
  selectedCount = 0,
  onBulkDelete,
  onClearSelection,
}: FileExplorerToolbarProps) {
  const t = useTranslate();

  return (
    <div className="shrink-0 border-b border-[#24242a]">
      {/* 1. Main Toolbar Header */}
      <div className="flex h-11 items-center justify-between px-3.5">
        <span className="text-[11px] font-bold tracking-wider text-zinc-400 uppercase">
          {t('sidebar.heading')}
        </span>
        <div className="flex items-center space-x-1.5">
          <button
            onClick={onNewFile}
            className="rounded p-1 hover:bg-[#25252c] hover:text-zinc-100 transition"
            title={t('sidebar.newNoteShortcut')}
          >
            <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
            </svg>
          </button>
          <button
            onClick={onNewFolder}
            className="rounded p-1 hover:bg-[#25252c] hover:text-zinc-100 transition"
            title={t('sidebar.newFolderTitle')}
          >
            <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 13h6m-3-3v6m-9 1V7a2 2 0 012-2h6l2 2h6a2 2 0 012 2v8a2 2 0 01-2 2H5a2 2 0 01-2-2z" />
            </svg>
          </button>
          <button
            onClick={onRefresh}
            className="rounded p-1 hover:bg-[#25252c] hover:text-zinc-100 transition"
            title={t('sidebar.refreshTitle')}
          >
            <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
            </svg>
          </button>
          {onCloseMobile && (
            <button
              onClick={onCloseMobile}
              className="md:hidden ml-1 rounded p-1 text-zinc-400 hover:text-zinc-100"
              title={t('sidebar.closeMobile')}
            >
              <svg className="h-4.5 w-4.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          )}
        </div>
      </div>

      {/* 2. Multi-selection Bar */}
      {selectedCount > 1 && (
        <div className="flex items-center justify-between bg-violet-950/70 border-t border-violet-800/40 px-3 py-1.5 text-xs text-violet-200 animate-in fade-in duration-100">
          <span className="font-medium">{t('sidebar.selectedCount', { count: selectedCount })}</span>
          <div className="flex items-center space-x-2">
            <button
              onClick={onBulkDelete}
              className="rounded px-2 py-0.5 bg-rose-600/30 hover:bg-rose-600/50 text-rose-300 font-medium transition cursor-pointer"
              title={t('sidebar.deleteSelected')}
            >
              {t('sidebar.remove')}
            </button>
            <button
              onClick={onClearSelection}
              className="text-zinc-400 hover:text-zinc-200 text-[11px] cursor-pointer"
            >
              {t('sidebar.clearSelection')}
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
