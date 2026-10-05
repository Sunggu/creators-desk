import { useTranslate } from '../../i18n/use-i18n';
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
            <svg className="h-3 w-3" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
            </svg>
          </button>
          <button
            onClick={(e) => { e.stopPropagation(); onNewFolder?.(); }}
            title={t('sidebar.newFolderTitle')}
            className="p-0.5 text-zinc-500 hover:text-zinc-200 cursor-pointer"
          >
            <svg className="h-3 w-3" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 13h6m-3-3v6m-9 1V7a2 2 0 012-2h6l2 2h6a2 2 0 012 2v8a2 2 0 01-2 2H5a2 2 0 01-2-2z" />
            </svg>
          </button>
        </>
      )}

      <button
        onClick={(e) => { e.stopPropagation(); onRename(); }}
        title={t('sidebar.rename')}
        className="p-0.5 text-zinc-500 hover:text-zinc-200 cursor-pointer"
      >
        <svg className="h-3 w-3" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15.232 5.232l3.536 3.536m-2.036-5.036a2.5 2.5 0 113.536 3.536L6.5 21.036H3v-3.572L16.732 3.732z" />
        </svg>
      </button>

      <button
        onClick={(e) => { e.stopPropagation(); onDelete(); }}
        title={t('sidebar.remove')}
        className="p-0.5 text-zinc-500 hover:text-rose-400 cursor-pointer"
      >
        <svg className="h-3 w-3" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
        </svg>
      </button>
    </div>
  );
}
