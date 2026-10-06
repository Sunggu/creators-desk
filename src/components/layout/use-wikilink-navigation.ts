import { useCallback } from 'react';
import type { FileNodeDto } from '../../core/domain/file-node.dto';
import { resolveWikilinkTarget } from '../../utils/resolve-wikilink-target';

/**
 * Turns a `[[wikilink]]` activation into an open-file action. Unresolvable
 * targets are ignored so a dead link stays inert instead of opening nothing.
 */
export function useWikilinkNavigation(nodes: FileNodeDto[], onOpen: (fileId: string) => void) {
  return useCallback(
    (target: string) => {
      const node = resolveWikilinkTarget(nodes, target);
      if (node) onOpen(node.id);
    },
    [nodes, onOpen],
  );
}
