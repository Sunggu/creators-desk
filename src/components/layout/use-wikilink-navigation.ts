import { useCallback } from 'react';
import type { FileNodeDto } from '../../core/domain/file-node.dto';
import { resolveWikilinkTarget } from '../../utils/resolve-wikilink-target';

/**
 * Turns a `[[wikilink]]` activation into an open-file action.
 * If the target note does not exist yet, invokes `onCreateAndOpen` if provided
 * to automatically create and navigate to the new note.
 */
export function useWikilinkNavigation(
  nodes: FileNodeDto[],
  onOpen: (fileId: string) => void,
  onCreateAndOpen?: (name: string) => Promise<unknown> | void,
) {
  return useCallback(
    (target: string) => {
      const node = resolveWikilinkTarget(nodes, target);
      if (node) {
        onOpen(node.id);
      } else if (onCreateAndOpen && target.trim()) {
        onCreateAndOpen(target.trim());
      }
    },
    [nodes, onOpen, onCreateAndOpen],
  );
}
