import { useCallback, useEffect, useState } from 'react';
import type { FileNodeDto } from '../../core/domain/file-node.dto';
import { fileContentUseCase } from '../../infrastructure/di';

interface UseNoteDocumentOptions {
  activeFile: FileNodeDto | null;
  onSavingChange: (saving: boolean) => void;
}

export interface NoteDocument {
  /** Loaded body text, or null while the note is still being fetched. */
  content: string | null;
  isReady: boolean;
  save: (doc: string) => Promise<void>;
}

/**
 * Loads and persists a note's body through `FileContentUseCase`.
 *
 * Presentation components never talk to the repository directly; they only
 * await this hook, which keeps load/save orchestration testable and stops a new
 * editor surface from re-implementing persistence.
 */
export function useNoteDocument({
  activeFile,
  onSavingChange,
}: UseNoteDocumentOptions): NoteDocument {
  const [content, setContent] = useState<string | null>(null);
  const [loadedFileId, setLoadedFileId] = useState<string | null>(null);
  const fileId = activeFile?.id ?? null;

  useEffect(() => {
    let mounted = true;
    if (!fileId) return;

    void (async () => {
      try {
        const text = await fileContentUseCase.getContent(fileId);
        if (!mounted) return;
        setContent(text);
        setLoadedFileId(fileId);
      } catch (err) {
        console.error('Failed to load file content:', err);
        if (!mounted) return;
        // Fall back to the tree's snapshot so a lazy fetch failure is recoverable.
        setContent(activeFile?.content ?? '');
        setLoadedFileId(fileId);
      }
    })();

    return () => {
      mounted = false;
    };
  }, [fileId, activeFile?.content]);

  const save = useCallback(
    async (doc: string) => {
      if (!fileId) return;
      onSavingChange(true);
      try {
        await fileContentUseCase.saveContent(fileId, doc);
      } catch (err) {
        console.error('Failed to save file content:', err);
      } finally {
        onSavingChange(false);
      }
    },
    [fileId, onSavingChange],
  );

  // Derived, not reset: a stale body from the previous note is never renderable
  // because readiness requires the loaded id to match the requested one.
  return { content, isReady: Boolean(fileId) && loadedFileId === fileId && content !== null, save };
}
