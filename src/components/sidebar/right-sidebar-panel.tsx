import { useEffect, useState } from 'react';
import type { FileNodeDto } from '../../core/domain/file-node.dto';
import type { NodeConnectionsDto } from '../../core/domain/node-connection.dto';
import { useResizable } from '../../hooks/use-resizable';
import { useTranslate } from '../../i18n/use-i18n';
import MonochromeIcon from '../../ui/icon/monochrome-icon';
import BacklinksPanel from './backlinks-panel';
import OutlinePanel from './outline-panel';

interface RightSidebarPanelProps {
  isOpen: boolean;
  onClose: () => void;
  activeFile: FileNodeDto | null;
  nodes?: FileNodeDto[];
  vaultId?: string;
  onSelectFile?: (fileId: string) => void;
  onNavigateWikilink?: (target: string) => void;
}

export default function RightSidebarPanel({
  isOpen,
  onClose,
  activeFile,
  nodes = [],
  vaultId,
  onSelectFile,
  onNavigateWikilink,
}: RightSidebarPanelProps) {
  const t = useTranslate();
  const [activeTab, setActiveTab] = useState<'outline' | 'links'>('outline');
  const [remoteConnections, setRemoteConnections] = useState<NodeConnectionsDto | null>(null);

  const { size: width, startResize, isResizing } = useResizable({
    initial: 260,
    min: 200,
    max: 480,
    direction: 'horizontal',
    reverse: true,
  });

  useEffect(() => {
    if (!vaultId || !activeFile?.id) {
      setRemoteConnections(null);
      return;
    }
    let cancelled = false;
    fetch(`/api/vaults/${vaultId}/files/${activeFile.id}/links`)
      .then((res) => (res.ok ? (res.json() as Promise<NodeConnectionsDto>) : null))
      .then((data) => {
        if (!cancelled && data) setRemoteConnections(data);
      })
      .catch(() => {
        // Ignore gracefully in offline or test mode
      });
    return () => {
      cancelled = true;
    };
  }, [vaultId, activeFile?.id]);

  if (!isOpen) return null;

  return (
    <div
      style={{ width: `${width}px` }}
      className="relative flex h-full shrink-0 flex-col border-l border-[#26262e] bg-[#18181b] select-none text-zinc-300 transition-none max-md:absolute max-md:inset-y-0 max-md:right-0 max-md:w-full max-md:max-w-[85vw] max-md:border-l-0 max-md:shadow-2xl"
    >
      {/* Left Drag Resize Handle */}
      <div
        onMouseDown={startResize}
        className={`absolute left-0 top-0 bottom-0 z-10 hidden w-1 cursor-col-resize transition hover:bg-violet-500/60 md:block ${
          isResizing ? 'w-1.5 bg-violet-500' : ''
        }`}
        title={t('sidebar.outlineResize')}
      />

      {/* Panel Header & Tabs */}
      <div className="flex h-9 items-center justify-between border-b border-[#24242a] px-2">
        <div className="flex items-center space-x-1">
          <button
            type="button"
            onClick={() => setActiveTab('outline')}
            className={`flex items-center space-x-1.5 rounded px-2 py-1 text-xs font-medium transition cursor-pointer ${
              activeTab === 'outline'
                ? 'bg-zinc-800 text-zinc-100'
                : 'text-zinc-400 hover:bg-[#222228] hover:text-zinc-200'
            }`}
          >
            <MonochromeIcon name="outline" className="h-3.5 w-3.5 text-violet-400" />
            <span>{t('sidebar.outlineTitle')}</span>
          </button>
          <button
            type="button"
            onClick={() => setActiveTab('links')}
            className={`flex items-center space-x-1.5 rounded px-2 py-1 text-xs font-medium transition cursor-pointer ${
              activeTab === 'links'
                ? 'bg-zinc-800 text-zinc-100'
                : 'text-zinc-400 hover:bg-[#222228] hover:text-zinc-200'
            }`}
          >
            <MonochromeIcon name="arrowUpRight" className="h-3.5 w-3.5 text-violet-400" />
            <span>Links</span>
          </button>
        </div>

        <button
          type="button"
          onClick={onClose}
          className="rounded p-1 text-zinc-400 hover:bg-[#26262e] hover:text-zinc-100 transition cursor-pointer"
          title={t('sidebar.outlineClose')}
        >
          <MonochromeIcon name="close" className="h-3.5 w-3.5" />
        </button>
      </div>

      {/* Body */}
      <div className="flex-1 overflow-hidden">
        {activeTab === 'outline' ? (
          <OutlinePanel activeFile={activeFile} />
        ) : (
          <BacklinksPanel
            activeFile={activeFile}
            nodes={nodes}
            remoteConnections={remoteConnections}
            onSelectFile={onSelectFile}
            onNavigateWikilink={onNavigateWikilink}
          />
        )}
      </div>
    </div>
  );
}
