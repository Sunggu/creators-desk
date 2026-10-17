import { useTranslate } from '../../i18n/use-i18n';
import MonochromeIcon from '../../ui/icon/monochrome-icon';

export interface FileExplorerToolbarProps {
  onNewFile: () => void;
  onNewFolder: () => void;
  onRefresh: () => void;
  selectedCount?: number;
  onBulkDelete?: () => void;
  onClearSelection?: () => void;
}

export default function FileExplorerToolbar({
  onNewFile,
  onNewFolder,
  onRefresh,
  selectedCount = 0,
  onBulkDelete,
  onClearSelection,
}: FileExplorerToolbarProps) {
  const t = useTranslate();

  if (selectedCount > 0) {
    return (
      <div className="flex h-9 shrink-0 items-center justify-between border-b border-violet-800/40 bg-violet-950/50 px-3 select-none">
        <span className="text-xs font-medium text-violet-200 truncate">
          {t('sidebar.selectedCount', { count: selectedCount })}
        </span>
        <div className="flex items-center space-x-1.5">
          <button
            type="button"
            onClick={onBulkDelete}
            className="rounded px-2 py-0.5 bg-rose-600/30 hover:bg-rose-600/50 text-rose-300 text-[11px] font-medium transition cursor-pointer"
            title={t('sidebar.deleteSelected')}
          >
            {t('sidebar.remove')}
          </button>
          <button
            type="button"
            onClick={onClearSelection}
            className="rounded px-1.5 py-0.5 text-[11px] text-zinc-400 hover:bg-[#25252c] hover:text-zinc-200 transition cursor-pointer"
            title={t('sidebar.clearSelection')}
          >
            {t('sidebar.clearSelection')}
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="flex h-9 shrink-0 items-center justify-between border-b border-[#26262e] px-3 select-none">
      <span className="text-[11px] font-bold tracking-wider text-zinc-400 uppercase truncate">
        {t('sidebar.heading')}
      </span>
      <div className="flex items-center space-x-1">
        <button
          type="button"
          onClick={onNewFile}
          className="rounded p-1 text-zinc-400 hover:bg-[#25252c] hover:text-zinc-100 transition cursor-pointer"
          title={t('sidebar.newNoteShortcut')}
        >
          <MonochromeIcon name="plus" className="h-3.5 w-3.5" />
        </button>
        <button
          type="button"
          onClick={onNewFolder}
          className="rounded p-1 text-zinc-400 hover:bg-[#25252c] hover:text-zinc-100 transition cursor-pointer"
          title={t('sidebar.newFolderTitle')}
        >
          <MonochromeIcon name="folderPlus" className="h-3.5 w-3.5" />
        </button>
        <button
          type="button"
          onClick={onRefresh}
          className="rounded p-1 text-zinc-400 hover:bg-[#25252c] hover:text-zinc-100 transition cursor-pointer"
          title={t('sidebar.refreshTitle')}
        >
          <MonochromeIcon name="refresh" className="h-3.5 w-3.5" />
        </button>
      </div>
    </div>
  );
}
