import { useTranslate } from '../../i18n/use-i18n';
import MonochromeIcon from '../../ui/icon/monochrome-icon';
interface FileTreeActionsProps {
  isFolder: boolean;
  onNewFile?: () => void;
  onNewFolder?: () => void;
  onRename: () => void;
  onDelete: () => void;
}

export default function FileTreeActions({
  isFolder,
  onNewFile,
  onNewFolder,
  onRename,
  onDelete,
}: FileTreeActionsProps) {
  const t = useTranslate();

  return (
    <div className="hidden items-center space-x-1 group-hover:flex">
      {isFolder && (
        <>
          <button
            onClick={(e) => { e.stopPropagation(); onNewFile?.(); }}
            title={t('sidebar.newNoteShortcut')}
            className="p-0.5 text-zinc-500 hover:text-zinc-200 cursor-pointer"
          >
            <MonochromeIcon name="plus" className="h-3 w-3" />
          </button>
          <button
            onClick={(e) => { e.stopPropagation(); onNewFolder?.(); }}
            title={t('sidebar.newFolderTitle')}
            className="p-0.5 text-zinc-500 hover:text-zinc-200 cursor-pointer"
          >
            <MonochromeIcon name="folderPlus" className="h-3 w-3" />
          </button>
        </>
      )}

      <button
        onClick={(e) => { e.stopPropagation(); onRename(); }}
        title={t('sidebar.rename')}
        className="p-0.5 text-zinc-500 hover:text-zinc-200 cursor-pointer"
      >
        <MonochromeIcon name="pencil" className="h-3 w-3" />
      </button>

      <button
        onClick={(e) => { e.stopPropagation(); onDelete(); }}
        title={t('sidebar.remove')}
        className="p-0.5 text-zinc-500 hover:text-rose-400 cursor-pointer"
      >
        <MonochromeIcon name="trash" className="h-3 w-3" />
      </button>
    </div>
  );
}
