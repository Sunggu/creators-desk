import { useTranslate } from '../../i18n/use-i18n';
import MonochromeIcon from '../../ui/icon/monochrome-icon';
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
            <MonochromeIcon name="plus" />
          </button>
          <button
            onClick={onNewFolder}
            className="rounded p-1 hover:bg-[#25252c] hover:text-zinc-100 transition"
            title={t('sidebar.newFolderTitle')}
          >
            <MonochromeIcon name="folderPlus" />
          </button>
          <button
            onClick={onRefresh}
            className="rounded p-1 hover:bg-[#25252c] hover:text-zinc-100 transition"
            title={t('sidebar.refreshTitle')}
          >
            <MonochromeIcon name="refresh" />
          </button>
          {onCloseMobile && (
            <button
              onClick={onCloseMobile}
              className="md:hidden ml-1 rounded p-1 text-zinc-400 hover:text-zinc-100"
              title={t('sidebar.closeMobile')}
            >
              <MonochromeIcon name="close" className="h-4.5 w-4.5" />
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
