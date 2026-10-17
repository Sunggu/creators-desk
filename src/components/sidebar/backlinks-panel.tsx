import { useMemo } from 'react';
import type { FileNodeDto } from '../../core/domain/file-node.dto';
import type { NodeConnectionsDto, NodeLinkEdgeDto } from '../../core/domain/node-connection.dto';
import MonochromeIcon from '../../ui/icon/monochrome-icon';
import { computeNodeConnections } from '../../utils/compute-node-connections';

interface BacklinksPanelProps {
  activeFile: FileNodeDto | null;
  nodes: FileNodeDto[];
  remoteConnections?: NodeConnectionsDto | null;
  onSelectFile?: (fileId: string) => void;
  onNavigateWikilink?: (target: string) => void;
}

function mergeEdges(
  localEdges: NodeLinkEdgeDto[],
  remoteEdges?: NodeLinkEdgeDto[],
): NodeLinkEdgeDto[] {
  const map = new Map<string, NodeLinkEdgeDto>();
  for (const edge of localEdges) {
    const key = `${edge.sourceFileId}:${edge.targetName.toLowerCase()}`;
    map.set(key, edge);
  }
  if (remoteEdges) {
    for (const edge of remoteEdges) {
      const key = `${edge.sourceFileId}:${edge.targetName.toLowerCase()}`;
      const existing = map.get(key);
      if (!existing) {
        map.set(key, edge);
      } else if (!existing.targetFileId && edge.targetFileId) {
        map.set(key, { ...existing, targetFileId: edge.targetFileId });
      }
    }
  }
  return Array.from(map.values());
}

export default function BacklinksPanel({
  activeFile,
  nodes,
  remoteConnections,
  onSelectFile,
  onNavigateWikilink,
}: BacklinksPanelProps) {
  const local = useMemo(() => computeNodeConnections(activeFile, nodes), [activeFile, nodes]);
  const backlinks = useMemo(
    () => mergeEdges(local.backlinks, remoteConnections?.backlinks),
    [local.backlinks, remoteConnections?.backlinks],
  );
  const outgoing = useMemo(
    () => mergeEdges(local.outgoing, remoteConnections?.outgoing),
    [local.outgoing, remoteConnections?.outgoing],
  );

  if (!activeFile) {
    return (
      <div className="flex h-full items-center justify-center p-4 text-xs text-zinc-500">
        No document selected.
      </div>
    );
  }

  return (
    <div className="flex h-full flex-col overflow-y-auto p-3 text-xs text-zinc-300 space-y-4">
      {/* Backlinks (Incoming) */}
      <div>
        <div className="mb-1.5 flex items-center justify-between text-[11px] font-semibold uppercase tracking-wider text-zinc-400">
          <span>Backlinks</span>
          <span className="rounded bg-zinc-800 px-1.5 py-0.5 text-[10px] text-zinc-400">
            {backlinks.length}
          </span>
        </div>
        {backlinks.length === 0 ? (
          <div className="rounded border border-dashed border-zinc-800 px-3 py-2 text-[11px] text-zinc-500">
            No incoming backlinks found.
          </div>
        ) : (
          <div className="space-y-1">
            {backlinks.map((edge) => (
              <button
                type="button"
                key={`${edge.sourceFileId}:${edge.targetName}`}
                onClick={() => onSelectFile?.(edge.sourceFileId)}
                className="flex w-full items-center space-x-2 rounded px-2 py-1.5 text-left text-zinc-300 hover:bg-[#26262e] hover:text-zinc-100 transition cursor-pointer"
              >
                <MonochromeIcon name="file" className="h-3.5 w-3.5 shrink-0 text-violet-400" />
                <span className="truncate">{edge.sourceFileName.replace(/\.md$/i, '')}</span>
              </button>
            ))}
          </div>
        )}
      </div>

      {/* Outgoing Links */}
      <div>
        <div className="mb-1.5 flex items-center justify-between text-[11px] font-semibold uppercase tracking-wider text-zinc-400">
          <span>Outgoing Links</span>
          <span className="rounded bg-zinc-800 px-1.5 py-0.5 text-[10px] text-zinc-400">
            {outgoing.length}
          </span>
        </div>
        {outgoing.length === 0 ? (
          <div className="rounded border border-dashed border-zinc-800 px-3 py-2 text-[11px] text-zinc-500">
            No outgoing links found in this document.
          </div>
        ) : (
          <div className="space-y-1">
            {outgoing.map((edge) => {
              const isResolved = Boolean(edge.targetFileId);
              return (
                <button
                  type="button"
                  key={`${edge.sourceFileId}:${edge.targetName}`}
                  onClick={() => {
                    if (edge.targetFileId) {
                      onSelectFile?.(edge.targetFileId);
                    } else {
                      onNavigateWikilink?.(edge.targetName);
                    }
                  }}
                  className={`flex w-full items-center justify-between rounded px-2 py-1.5 text-left transition cursor-pointer ${
                    isResolved
                      ? 'text-zinc-300 hover:bg-[#26262e] hover:text-zinc-100'
                      : 'text-zinc-500 hover:bg-[#26262e] hover:text-amber-300'
                  }`}
                >
                  <div className="flex items-center space-x-2 truncate">
                    <MonochromeIcon
                      name={isResolved ? 'arrowUpRight' : 'plus'}
                      className={`h-3.5 w-3.5 shrink-0 ${isResolved ? 'text-zinc-400' : 'text-amber-500/80'}`}
                    />
                    <span className="truncate">{edge.targetName}</span>
                  </div>
                  {!isResolved && (
                    <span className="shrink-0 text-[10px] text-zinc-600">new</span>
                  )}
                </button>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}
