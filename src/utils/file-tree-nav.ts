import type { FileNodeDto } from '../core/domain/file-node.dto';

/**
 * Returns a new sorted array where folders always appear before files.
 * Within the same type, sorts by name using natural numeric and case-insensitive comparison.
 */
export function sortFileNodes(nodes: readonly FileNodeDto[]): FileNodeDto[] {
  return [...nodes].sort((a, b) => {
    if (a.type !== b.type) {
      return a.type === 'folder' ? -1 : 1;
    }
    return a.name.localeCompare(b.name, undefined, { numeric: true, sensitivity: 'base' });
  });
}

/**
 * Recursively traverses starting from root (`parentId === null`).
 * At each level, filters children with `parentId`, sorts them folder-first,
 * appends each to the result list, and traverses into expanded folders.
 */
export function flattenVisibleTree(
  nodes: readonly FileNodeDto[],
  expandedFolders: ReadonlySet<string>,
): FileNodeDto[] {
  const result: FileNodeDto[] = [];
  const visited = new Set<string>();

  function traverse(parentId: string | null) {
    const children = nodes.filter((n) => n.parentId === parentId);
    const sorted = sortFileNodes(children);
    for (const child of sorted) {
      if (visited.has(child.id)) continue;
      visited.add(child.id);
      result.push(child);
      if (child.type === 'folder' && expandedFolders.has(child.id)) {
        traverse(child.id);
      }
    }
  }

  traverse(null);
  return result;
}

/**
 * Walks up `parentId` from `targetNodeId` to root, returning all ancestor folder IDs.
 * Returns an empty array if `targetNodeId` is null, not found, or has no ancestors.
 */
export function getAncestorFolderIds(
  nodes: readonly FileNodeDto[],
  targetNodeId: string | null,
): string[] {
  if (!targetNodeId) return [];
  const nodeMap = new Map<string, FileNodeDto>(nodes.map((n) => [n.id, n]));
  const target = nodeMap.get(targetNodeId);
  if (!target) return [];

  const ancestors: string[] = [];
  const visited = new Set<string>([target.id]);
  let currentParentId = target.parentId;

  while (currentParentId) {
    if (visited.has(currentParentId)) break;
    visited.add(currentParentId);

    const parentNode = nodeMap.get(currentParentId);
    if (!parentNode) break;

    if (parentNode.type === 'folder') {
      ancestors.push(parentNode.id);
    }
    currentParentId = parentNode.parentId;
  }

  return ancestors;
}

/**
 * Checks whether `targetFolderId` is the `sourceId` itself or one of its descendants.
 * Used to prevent circular / invalid folder moves.
 */
export function isDescendantOrSelf(
  nodes: readonly FileNodeDto[],
  sourceId: string,
  targetFolderId: string | null,
): boolean {
  if (!targetFolderId) return false;
  if (sourceId === targetFolderId) return true;

  const nodeMap = new Map<string, FileNodeDto>(nodes.map((n) => [n.id, n]));
  const visited = new Set<string>();
  let currentId: string | null = targetFolderId;

  while (currentId) {
    if (visited.has(currentId)) break;
    visited.add(currentId);

    const node = nodeMap.get(currentId);
    if (!node || !node.parentId) break;

    if (node.parentId === sourceId) {
      return true;
    }
    currentId = node.parentId;
  }

  return false;
}
