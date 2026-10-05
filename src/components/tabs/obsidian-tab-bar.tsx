import { useState } from 'react';
import type { FileNodeDto } from '../../core/domain/file-node.dto';
import type { TabDropPosition } from '../../core/domain/tab-drag.dto';
import TabBarActions from './tab-bar-actions';
import TabContextMenu from './tab-context-menu';
import TabItem from './tab-item';
import { useTranslate } from '../../i18n/use-i18n';

interface ObsidianTabBarProps {
  openFiles: FileNodeDto[];
  activeFileId: string | null;
  viewMode?: 'edit' | 'preview';
  onToggleViewMode?: () => void;
  onSelectTab: (fileId: string) => void;
  onCloseTab: (fileId: string) => void;
  onCloseOtherTabs?: (fileId: string) => void;
  onMoveTab?: (sourceFileId: string, targetFileId: string, position: TabDropPosition) => void;
  onNewNote: () => void;
  onSplitHorizontal?: (fileId?: string) => void;
  onSplitVertical?: (fileId?: string) => void;
  onCloseGroup?: () => void;
  canCloseGroup?: boolean;
  isRightPanelOpen?: boolean;
  onToggleRightPanel?: () => void;
}

export default function ObsidianTabBar({
  openFiles,
  activeFileId,
  viewMode = 'edit',
  onToggleViewMode,
  onSelectTab,
  onCloseTab,
  onCloseOtherTabs,
  onMoveTab,
  onNewNote,
  onSplitHorizontal,
  onSplitVertical,
  onCloseGroup,
  canCloseGroup,
  isRightPanelOpen,
  onToggleRightPanel,
}: ObsidianTabBarProps) {
  const t = useTranslate();
  const [contextMenu, setContextMenu] = useState<{ x: number; y: number; fileId: string } | null>(null);

  const handleMoveTab = (sourceFileId: string, targetFileId: string, position: TabDropPosition) => {
    onMoveTab?.(sourceFileId, targetFileId, position);
  };

  return (
    <div className="hidden md:flex h-9 w-full items-end justify-between border-b border-[#26262e] bg-[#141417] px-0 select-none relative">
      <div className="flex items-end overflow-x-auto [&::-webkit-scrollbar]:hidden [-ms-overflow-style:none] [scrollbar-width:none]">
        {openFiles.map((file) => (
          <TabItem
            key={file.id}
            fileId={file.id}
            title={file.name.replace(/\.md$/i, '')}
            isActive={file.id === activeFileId}
            canReorder={openFiles.length > 1}
            onSelect={onSelectTab}
            onClose={onCloseTab}
            onContextMenu={(fileId, x, y) => setContextMenu({ x, y, fileId })}
            onMove={handleMoveTab}
          />
        ))}

        <button
          onClick={onNewNote}
          className="mb-1 ml-1 flex h-7 w-7 items-center justify-center rounded text-zinc-400 hover:bg-[#222228] hover:text-zinc-200 transition"
          title={t('tab.addTab')}
        >
          <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
          </svg>
        </button>
      </div>

      <TabBarActions
        activeFileId={activeFileId}
        viewMode={viewMode}
        canCloseGroup={Boolean(canCloseGroup)}
        isRightPanelOpen={isRightPanelOpen}
        onSplitHorizontal={onSplitHorizontal ? () => onSplitHorizontal() : undefined}
        onSplitVertical={onSplitVertical ? () => onSplitVertical() : undefined}
        onToggleViewMode={onToggleViewMode}
        onToggleRightPanel={onToggleRightPanel}
        onCloseGroup={onCloseGroup}
      />

      {contextMenu && (
        <TabContextMenu
          x={contextMenu.x}
          y={contextMenu.y}
          fileId={contextMenu.fileId}
          onClose={() => setContextMenu(null)}
          onSplitHorizontal={(fId) => onSplitHorizontal?.(fId)}
          onSplitVertical={(fId) => onSplitVertical?.(fId)}
          onCloseTab={onCloseTab}
          onCloseOtherTabs={onCloseOtherTabs}
        />
      )}
    </div>
  );
}
