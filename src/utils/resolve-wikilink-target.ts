import type { FileNodeDto } from '../core/domain/file-node.dto';

/**
 * Resolves a `[[wikilink]]` target to a file in the tree.
 *
 * Matching is case-insensitive and tolerates a `.md` suffix on either side so
 * `[[Design]]`, `[[design]]` and `[[Design.md]]` all reach the same note.
 * Returns null when no file matches, letting the caller ignore dead links.
 */
export function resolveWikilinkTarget(nodes: FileNodeDto[], target: string): FileNodeDto | null {
  const needle = target.trim().replace(/\.md$/i, '').toLowerCase();
  if (!needle) return null;
  return (
    nodes.find(
      (node) =>
        node.type === 'file' && node.name.replace(/\.md$/i, '').toLowerCase() === needle,
    ) ?? null
  );
}
