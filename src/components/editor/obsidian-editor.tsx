import { useEffect, useRef, useState } from 'react';
import type { FileNodeDto } from '../../core/domain/file-node.dto';
import { type EditorStats, useCodeMirror } from '../../hooks/use-codemirror';
import { fileContentUseCase } from '../../infrastructure/di';

interface ObsidianEditorProps {
  activeFile: FileNodeDto | null;
  onSavingChange: (isSaving: boolean) => void;
  onStatsChange: (stats: EditorStats) => void;
  onNewNote: () => void;
}

export default function ObsidianEditor({
  activeFile,
  onSavingChange,
  onStatsChange,
  onNewNote,
}: ObsidianEditorProps) {
  const containerRef = useRef<HTMLDivElement | null>(null);
  const [content, setContent] = useState<string>('');
  const [isLoaded, setIsLoaded] = useState(false);

  useEffect(() => {
    let mounted = true;
    async function loadContent() {
      if (!activeFile) {
        setContent('');
        setIsLoaded(false);
        onStatsChange({ words: 0, chars: 0, cursorLine: 1, cursorCol: 1 });
        return;
      }

      setIsLoaded(false);
      try {
        const text = await fileContentUseCase.getContent(activeFile.id);
        if (mounted) {
          setContent(text);
          setIsLoaded(true);
        }
      } catch (err) {
        console.error('Failed to load file content:', err);
        if (mounted) {
          setContent('');
          setIsLoaded(true);
        }
      }
    }

    loadContent();
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

  useCodeMirror(containerRef, {
    initialContent: content,
    onChange: handleDocChange,
    onStatsChange,
    debounceMs: 300,
  });

  if (!activeFile) {
    return (
      <div className="flex h-full flex-1 flex-col items-center justify-center bg-[#1e1e22] text-zinc-500 select-none">
        <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-[#26262e] text-zinc-600 mb-4">
          <svg className="h-8 w-8" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.25} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
          </svg>
        </div>
        <p className="text-sm font-medium text-zinc-300">열려있는 노트가 없습니다</p>
        <p className="mt-1 text-xs text-zinc-500">왼쪽 파일 탐색기에서 노트를 선택하거나 새로 생성하세요.</p>
        <button
          onClick={onNewNote}
          className="mt-4 rounded-md bg-[#2a2a32] px-3.5 py-1.5 text-xs font-semibold text-violet-300 hover:bg-[#34343e] transition"
        >
          + 새 노트 만들기
        </button>
      </div>
    );
  }

  return (
    <div className="relative flex h-full flex-1 flex-col bg-[#1e1e22]">
      {/* Editor Body */}
      <div className="relative flex-1 overflow-hidden">
        {!isLoaded ? (
          <div className="p-10 text-xs text-zinc-500">노트를 불러오는 중...</div>
        ) : (
          <div ref={containerRef} className="h-full w-full" />
        )}
      </div>
    </div>
  );
}
