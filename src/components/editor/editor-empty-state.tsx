import { useTranslate } from '../../i18n/use-i18n';
import ShortcutHint from './shortcut-hint';
import MonochromeIcon from '../../ui/icon/monochrome-icon';

interface EditorEmptyStateProps {
  onNewNote: () => void;
}

/** Shown when a pane has no note open. */
export default function EditorEmptyState({ onNewNote }: EditorEmptyStateProps) {
  const t = useTranslate();

  return (
    <div className="flex h-full flex-1 flex-col items-center justify-center bg-[#1e1e22] text-zinc-500 select-none px-4">
      <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-[#26262e] text-violet-400 mb-4 shadow-inner">
        <MonochromeIcon name="document" className="h-7 w-7" />
      </div>
      <p className="text-sm font-semibold text-zinc-200">{t('editor.noNoteTitle')}</p>
      <p className="mt-1 text-xs text-zinc-500 text-center max-w-sm">{t('editor.noNoteBody')}</p>

      <button
        onClick={onNewNote}
        className="mt-4 rounded-md bg-violet-600 px-3.5 py-1.5 text-xs font-semibold text-white hover:bg-violet-500 active:bg-violet-700 transition cursor-pointer"
      >
        {t('editor.createNote')}
      </button>

      <div className="mt-8 grid grid-cols-2 gap-x-6 gap-y-2 text-[11px] text-zinc-500 border-t border-[#26262e] pt-4">
        <ShortcutHint hint="editor.dragDropHint" label="editor.dragDropLabel" />
        <ShortcutHint hint="editor.shiftClickHint" label="editor.shiftClickLabel" />
        <ShortcutHint hint="editor.ctrlClickHint" label="editor.ctrlClickLabel" />
        <ShortcutHint hint="editor.rightClickHint" label="editor.rightClickLabel" />
      </div>
    </div>
  );
}
