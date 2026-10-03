import { useEffect, useRef, useState } from 'react';
import type { FileNodeDto } from '../../core/domain/file-node.dto';
import { useCodeMirror } from '../../hooks/use-codemirror';
import { fileContentUseCase } from '../../infrastructure/di';

interface MarkdownEditorProps {
  activeFile: FileNodeDto | null;
  onSavingChange?: (isSaving: boolean) => void;
}

export default function MarkdownEditor({
  activeFile,
  onSavingChange,
}: MarkdownEditorProps) {
  const containerRef = useRef<HTMLDivElement | null>(null);
  const [content, setContent] = useState<string>('');
  const [isLoaded, setIsLoaded] = useState(false);

  useEffect(() => {
    let mounted = true;
    async function loadContent() {
      if (!activeFile) {
        setContent('');
        setIsLoaded(false);
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
      onSavingChange?.(true);
      await fileContentUseCase.saveContent(activeFile.id, newDoc);
    } catch (err) {
      console.error('Failed to save file content:', err);
    } finally {
      setTimeout(() => onSavingChange?.(false), 200);
    }
  };

  useCodeMirror(containerRef, {
    initialContent: content,
    onChange: handleDocChange,
    debounceMs: 300,
  });

  if (!activeFile) {
    return (
      <div className="flex h-full flex-1 flex-col items-center justify-center bg-zinc-950 p-6 text-zinc-500 select-none">
        <svg className="h-12 w-12 text-zinc-800" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
        </svg>
        <p className="mt-3 text-sm font-medium text-zinc-400">선택된 노트가 없습니다</p>
        <p className="mt-1 text-xs text-zinc-600">왼쪽 파일 탐색기에서 노트를 선택하거나 새로 생성하세요.</p>
      </div>
    );
  }

  return (
    <div className="relative flex h-full flex-1 flex-col bg-zinc-950">
      {/* Note Header Title */}
      <div className="flex items-center justify-between border-b border-zinc-900 bg-zinc-950/60 px-8 py-3">
        <h1 className="text-lg font-bold text-zinc-100">{activeFile.name}</h1>
      </div>

      {/* Editor Body */}
      <div className="relative flex-1 overflow-hidden">
        {!isLoaded ? (
          <div className="p-8 text-xs text-zinc-500">노트를 불러오는 중...</div>
        ) : (
          <div ref={containerRef} className="h-full w-full overflow-auto" />
        )}
      </div>
    </div>
  );
}
