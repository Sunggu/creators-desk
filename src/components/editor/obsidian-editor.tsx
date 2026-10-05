import { useEffect, useState } from 'react';
import type { FileNodeDto } from '../../core/domain/file-node.dto';
import type { EditorStats } from '../../hooks/use-codemirror';
import { fileContentUseCase } from '../../infrastructure/di';
import ObsidianMarkdownPreview from './obsidian-markdown-preview';
import ObsidianMarkdownView from './obsidian-markdown-view';
import { useTranslate } from '../../i18n/use-i18n';

interface ObsidianEditorProps {
  activeFile: FileNodeDto | null;
  viewMode?: 'edit' | 'preview';
  onSwitchToEdit?: () => void;
  onNavigateWikilink?: (target: string) => void;
  onSavingChange: (isSaving: boolean) => void;
  onStatsChange: (stats: EditorStats) => void;
  onNewNote: () => void;
  onRenameFile?: (id: string, newName: string) => Promise<unknown> | void;
  autoFocusTitle?: boolean;
}

export default function ObsidianEditor({
  activeFile,
  viewMode = 'edit',
  onSwitchToEdit,
  onNavigateWikilink,
  onSavingChange,
  onStatsChange,
  onNewNote,
  onRenameFile,
  autoFocusTitle = false,
}: ObsidianEditorProps) {
  const t = useTranslate();
  const [content, setContent] = useState<string | null>(null);
  const [loadedFileId, setLoadedFileId] = useState<string | null>(null);

  useEffect(() => {
    let mounted = true;
    async function load() {
      if (!activeFile) {
        setContent(null);
        setLoadedFileId(null);
        onStatsChange({ words: 0, chars: 0, cursorLine: 1, cursorCol: 1 });
        return;
      }

      try {
        const text = await fileContentUseCase.getContent(activeFile.id);
        if (mounted) {
          setContent(text);
          setLoadedFileId(activeFile.id);
        }
      } catch (err) {
        console.error('Failed to load file content:', err);
        if (mounted) {
          setContent(activeFile.content ?? '');
          setLoadedFileId(activeFile.id);
        }
      }
    }

    load();
    return () => { mounted = false; };
  }, [activeFile?.id]);

  const handleDocChange = async (newDoc: string) => {
    if (!activeFile) return;
    try {
      onSavingChange(true);
      await fileContentUseCase.saveContent(activeFile.id, newDoc);
    } catch (err) {
      console.error('Failed to save file content:', err);
    } finally {
      setTimeout(() => onSavingChange(false), 200);
    }
  };

  if (!activeFile) {
    return (
      <div className="flex h-full flex-1 flex-col items-center justify-center bg-[#1e1e22] text-zinc-500 select-none px-4">
        <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-[#26262e] text-violet-400 mb-4 shadow-inner">
          <svg className="h-7 w-7" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
          </svg>
        </div>
        <p className="text-sm font-semibold text-zinc-200">{t('editor.noNoteTitle')}</p>
        <p className="mt-1 text-xs text-zinc-500 text-center max-w-sm">
          {t('editor.noNoteBody')}
        </p>

        <div className="mt-4 flex items-center space-x-2">
          <button
            onClick={onNewNote}
            className="rounded-md bg-violet-600 px-3.5 py-1.5 text-xs font-semibold text-white hover:bg-violet-500 active:bg-violet-700 transition cursor-pointer"
          >
            {t('editor.createNote')}
          </button>
        </div>

        <div className="mt-8 grid grid-cols-2 gap-x-6 gap-y-2 text-[11px] text-zinc-500 border-t border-[#26262e] pt-4">
          <ShortcutHint hint="editor.dragDropHint" label="editor.dragDropLabel" />
          <ShortcutHint hint="editor.shiftClickHint" label="editor.shiftClickLabel" />
          <ShortcutHint hint="editor.ctrlClickHint" label="editor.ctrlClickLabel" />
          <ShortcutHint hint="editor.rightClickHint" label="editor.rightClickLabel" />
        </div>
      </div>
    );
  }

  if (loadedFileId !== activeFile.id || content === null) {
    return (
      <div className="flex h-full w-full items-center justify-center bg-[#1e1e22] text-xs text-zinc-500">
        {t('editor.loadingNote')}
      </div>
    );
  }

  if (viewMode === 'preview') {
    return (
      <ObsidianMarkdownPreview
        key={activeFile.id}
        title={activeFile.name}
        content={content}
        onSwitchToEdit={onSwitchToEdit}
        onNavigateWikilink={onNavigateWikilink}
      />
    );
  }

  return (
    <ObsidianMarkdownView
      key={activeFile.id}
      fileId={activeFile.id}
      fileName={activeFile.name}
      initialContent={content}
      onDocChange={handleDocChange}
      onStatsChange={onStatsChange}
      onRenameFile={onRenameFile}
      autoFocusTitle={autoFocusTitle}
    />
  );
}

interface ShortcutHintProps {
  hint: 'editor.dragDropHint' | 'editor.shiftClickHint' | 'editor.ctrlClickHint' | 'editor.rightClickHint';
  label:
    | 'editor.dragDropLabel'
    | 'editor.shiftClickLabel'
    | 'editor.ctrlClickLabel'
    | 'editor.rightClickLabel';
}

/** One "gesture: what it does" row in the editor's empty state. */
function ShortcutHint({ hint, label }: ShortcutHintProps) {
  const t = useTranslate();
  return (
    <div>
      <span className="text-zinc-400">{t(hint)}</span>: {t(label)}
    </div>
  );
}
