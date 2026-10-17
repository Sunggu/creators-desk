import { useCallback, useEffect, useState } from 'react';
import type { FileNodeDto } from '../../core/domain/file-node.dto';
import { fileContentUseCase, fileRepository } from '../../infrastructure/di';
import {
  broadcastWorkspaceSync,
  subscribeWorkspaceSync,
} from '../../utils/workspace-sync-channel';

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
  const vaultId = activeFile?.vaultId;
  const updatedAt = activeFile?.updatedAt;

  useEffect(() => {
    let mounted = true;
    if (!fileId) return;

    const fetchContent = async () => {
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
    };

    void fetchContent();

    const unsubscribe = subscribeWorkspaceSync((msg) => {
      if (msg.fileId === fileId) {
        const repo = fileRepository as { invalidateContent?: (id: string) => void };
        repo.invalidateContent?.(fileId);
        void fetchContent();
      }
    });

    return () => {
      mounted = false;
      unsubscribe();
    };
  }, [fileId, activeFile?.content, updatedAt]);

  const save = useCallback(
    async (doc: string) => {
      if (!fileId) return;
      onSavingChange(true);
      try {
        await fileContentUseCase.saveContent(fileId, doc);
        broadcastWorkspaceSync({
          type: 'file-saved',
          fileId,
          vaultId,
          updatedAt: Date.now(),
        });
      } catch (err) {
        console.error('Failed to save file content:', err);
      } finally {
        onSavingChange(false);
      }
    },
    [fileId, vaultId, onSavingChange],
  );

  // Derived, not reset: a stale body from the previous note is never renderable
  // because readiness requires the loaded id to match the requested one.
  return {
    content,
    isReady: Boolean(fileId) && loadedFileId === fileId && content !== null,
    save,
  };
}
