import type { EditorStats } from '../../core/domain/editor-stats.dto';
import type { FileNodeDto } from '../../core/domain/file-node.dto';
import { useTranslate } from '../../i18n/use-i18n';
import EditorEmptyState from './editor-empty-state';
import ObsidianMarkdownPreview from './obsidian-markdown-preview';
import ObsidianMarkdownView from './obsidian-markdown-view';
import { useNoteDocument } from './use-note-document';

export interface ObsidianEditorProps {
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

/**
 * Chooses which note surface to render. Persistence lives in `useNoteDocument`,
 * so this component only maps state onto a view.
 */
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
  const { content, isReady, save } = useNoteDocument({ activeFile, onSavingChange });

  if (!activeFile) return <EditorEmptyState onNewNote={onNewNote} />;

  if (!isReady || content === null) {
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
      onDocChange={save}
      onStatsChange={onStatsChange}
      onRenameFile={onRenameFile}
      autoFocusTitle={autoFocusTitle}
    />
  );
}
