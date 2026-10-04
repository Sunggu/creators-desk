import { useEffect, useState } from 'react';
import type { FileNodeDto } from '../../core/domain/file-node.dto';
import type { EditorStats } from '../../hooks/use-codemirror';
import { fileContentUseCase } from '../../infrastructure/di';
import ObsidianMarkdownPreview from './obsidian-markdown-preview';
import ObsidianMarkdownView from './obsidian-markdown-view';

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
    return () => {
      mounted = false;
    };
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
        <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-[#26262e] text-zinc-600 mb-4">
          <svg className="h-8 w-8" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.25} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
          </svg>
        </div>
        <p className="text-sm font-medium text-zinc-300">열려있는 노트가 없습니다</p>
        <p className="mt-1 text-xs text-zinc-500 text-center">
          왼쪽 탐색기 메뉴(☰)에서 노트를 선택하거나 새로 만드세요.
        </p>
        <button
          onClick={onNewNote}
          className="mt-4 rounded-md bg-violet-600 px-4 py-2 text-xs font-semibold text-white hover:bg-violet-500 active:bg-violet-700 transition"
        >
          + 새 노트 만들기
        </button>
      </div>
    );
  }

  if (loadedFileId !== activeFile.id || content === null) {
    return (
      <div className="flex h-full w-full items-center justify-center bg-[#1e1e22] text-xs text-zinc-500">
        노트를 불러오는 중...
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
