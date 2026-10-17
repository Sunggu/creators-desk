import type { FileNodeDto } from '../core/domain/file-node.dto';
import type { NodeConnectionsDto, NodeLinkEdgeDto } from '../core/domain/node-connection.dto';
import { resolveWikilinkTarget } from './resolve-wikilink-target';
import { parseWikilinksAndTags } from './wikilink-parser';

export function computeNodeConnections(
  activeFile: FileNodeDto | null,
  nodes: FileNodeDto[],
): NodeConnectionsDto {
  if (!activeFile) {
    return { outgoing: [], backlinks: [] };
  }

  const outgoing: NodeLinkEdgeDto[] = [];
  const seenOutgoing = new Set<string>();

  if (activeFile.content) {
    const { links } = parseWikilinksAndTags(activeFile.content);
    for (const targetName of links) {
      const key = targetName.toLowerCase();
      if (seenOutgoing.has(key)) continue;
      seenOutgoing.add(key);

      const targetNode = resolveWikilinkTarget(nodes, targetName);
      outgoing.push({
        sourceFileId: activeFile.id,
        sourceFileName: activeFile.name,
        targetName,
        targetFileId: targetNode ? targetNode.id : null,
      });
    }
  }

  const backlinks: NodeLinkEdgeDto[] = [];
  const seenBacklinks = new Set<string>();

  for (const node of nodes) {
    if (node.id === activeFile.id || node.type !== 'file' || !node.content) {
      continue;
    }

    const { links } = parseWikilinksAndTags(node.content);
    for (const targetName of links) {
      const resolved = resolveWikilinkTarget([activeFile], targetName);
      if (resolved) {
        const key = `${node.id}:${targetName.toLowerCase()}`;
        if (seenBacklinks.has(key)) continue;
        seenBacklinks.add(key);

        backlinks.push({
          sourceFileId: node.id,
          sourceFileName: node.name,
          targetName,
          targetFileId: activeFile.id,
        });
      }
    }
  }

  return { outgoing, backlinks };
}
