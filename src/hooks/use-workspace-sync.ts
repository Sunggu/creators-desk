import { useEffect, useRef } from 'react';
import {
  subscribeWorkspaceSync,
  type WorkspaceSyncMessage,
} from '../utils/workspace-sync-channel';

export interface UseWorkspaceSyncOptions {
  onRevalidate: () => void;
  onRemoteFileSaved?: (fileId: string) => void;
}

/**
 * Automatically revalidates workspace state when the browser tab gains focus,
 * becomes visible, or receives a cross-tab update via BroadcastChannel.
 */
export function useWorkspaceSync({
  onRevalidate,
  onRemoteFileSaved,
}: UseWorkspaceSyncOptions): void {
  const onRevalidateRef = useRef(onRevalidate);
  const onRemoteFileSavedRef = useRef(onRemoteFileSaved);

  useEffect(() => {
    onRevalidateRef.current = onRevalidate;
    onRemoteFileSavedRef.current = onRemoteFileSaved;
  }, [onRevalidate, onRemoteFileSaved]);

  useEffect(() => {
    if (typeof window === 'undefined') return;

    const handleFocus = () => {
      onRevalidateRef.current();
    };

    const handleVisibilityChange = () => {
      if (typeof document !== 'undefined' && document.visibilityState === 'visible') {
        onRevalidateRef.current();
      }
    };

    window.addEventListener('focus', handleFocus);
    if (typeof document !== 'undefined') {
      document.addEventListener('visibilitychange', handleVisibilityChange);
    }

    const unsubscribe = subscribeWorkspaceSync((msg: WorkspaceSyncMessage) => {
      onRevalidateRef.current();
      if (msg.type === 'file-saved' && msg.fileId) {
        onRemoteFileSavedRef.current?.(msg.fileId);
      }
    });

    return () => {
      window.removeEventListener('focus', handleFocus);
      if (typeof document !== 'undefined') {
        document.removeEventListener('visibilitychange', handleVisibilityChange);
      }
      unsubscribe();
    };
  }, []);
}
