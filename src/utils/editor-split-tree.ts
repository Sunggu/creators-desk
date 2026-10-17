import type {
  EditorGridLayoutDto,
  EditorSplitNodeDto,
  SplitDirection,
} from '../core/domain/editor-grid.dto';

export function ensureSplitTree(layout: EditorGridLayoutDto): EditorSplitNodeDto {
  if (layout.root) {
    return layout.root;
  }
  if (layout.groups.length <= 1) {
    return {
      type: 'leaf',
      groupId: layout.groups[0]?.id ?? 'group-main',
    };
  }
  return {
    type: 'split',
    id: 'split-root',
    direction: layout.direction,
    children: layout.groups.map((g) => ({ type: 'leaf', groupId: g.id })),
  };
}

function containsGroup(node: EditorSplitNodeDto, groupId: string): boolean {
  if (node.type === 'leaf') {
    return node.groupId === groupId;
  }
  return node.children.some((child) => containsGroup(child, groupId));
}

export function insertSplitIntoTree(
  node: EditorSplitNodeDto,
  sourceGroupId: string,
  newGroupId: string,
  direction: SplitDirection
): EditorSplitNodeDto {
  const newLeaf: EditorSplitNodeDto = { type: 'leaf', groupId: newGroupId };

  if (node.type === 'leaf') {
    return {
      type: 'split',
      id: `split-${newGroupId}`,
      direction,
      children: [node, newLeaf],
    };
  }

  const directLeafIndex = node.children.findIndex(
    (child) => child.type === 'leaf' && child.groupId === sourceGroupId
  );

  if (directLeafIndex !== -1) {
    if (node.direction === direction) {
      const nextChildren = [...node.children];
      nextChildren.splice(directLeafIndex + 1, 0, newLeaf);
      return { ...node, children: nextChildren };
    }

    const targetLeaf = node.children[directLeafIndex];
    const nestedSplit: EditorSplitNodeDto = {
      type: 'split',
      id: `split-${newGroupId}`,
      direction,
      children: [targetLeaf, newLeaf],
    };
    const nextChildren = [...node.children];
    nextChildren[directLeafIndex] = nestedSplit;
    return { ...node, children: nextChildren };
  }

  if (containsGroup(node, sourceGroupId)) {
    return {
      ...node,
      children: node.children.map((child) =>
        containsGroup(child, sourceGroupId)
          ? insertSplitIntoTree(child, sourceGroupId, newGroupId, direction)
          : child
      ),
    };
  }

  if (node.direction === direction) {
    return { ...node, children: [...node.children, newLeaf] };
  }

  return {
    type: 'split',
    id: `split-${newGroupId}`,
    direction,
    children: [node, newLeaf],
  };
}

export function pruneSplitTree(
  node: EditorSplitNodeDto | undefined,
  validGroupIds: Set<string>
): EditorSplitNodeDto | undefined {
  if (!node) return undefined;

  if (node.type === 'leaf') {
    return validGroupIds.has(node.groupId) ? node : undefined;
  }

  const remaining = node.children
    .map((child) => pruneSplitTree(child, validGroupIds))
    .filter((child): child is EditorSplitNodeDto => Boolean(child));

  if (remaining.length === 0) return undefined;
  if (remaining.length === 1) return remaining[0];

  return { ...node, children: remaining };
}
