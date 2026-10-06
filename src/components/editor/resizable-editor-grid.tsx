import { useEffect, useRef } from 'react';
import type { EditorGridLayoutDto, SplitDirection } from '../../core/domain/editor-grid.dto';
import type { EditorStats } from '../../core/domain/editor-stats.dto';
import type { FileNodeDto } from '../../core/domain/file-node.dto';
import type { TabDropPosition } from '../../core/domain/tab-drag.dto';
import { useResizable } from '../../hooks/use-resizable';
import EditorGroupPane from './editor-group-pane';
import GridSplitter from './grid-splitter';

interface ResizableEditorGridProps {
  layout: EditorGridLayoutDto;
  nodes: FileNodeDto[];
  viewMode: 'edit' | 'preview';
  autoFocusFileId?: string | null;
  onToggleViewMode: () => void;
  onSelectTab: (groupId: string, fileId: string) => void;
  onCloseTab: (groupId: string, fileId: string) => void;
  onCloseOtherTabs?: (groupId: string, fileId: string) => void;
  onMoveTab?: (groupId: string, sourceFileId: string, targetFileId: string, position: TabDropPosition) => void;
  onNewNote: () => void;
  onSplit: (sourceGroupId: string, fileId: string, direction: SplitDirection) => void;
  onCloseGroup: (groupId: string) => void;
  onSavingChange: (saving: boolean) => void;
  onStatsChange: (stats: EditorStats) => void;
  onRenameFile: (id: string, name: string) => Promise<unknown>;
  onSwitchToEdit: () => void;
  onNavigateWikilink?: (target: string) => void;
  onSplitRatioChange?: (ratio: number) => void;
  isRightPanelOpen?: boolean;
  onToggleRightPanel?: () => void;
}

const PANE_STYLE = (direction: SplitDirection, value: string) =>
  direction === 'horizontal' ? { width: value } : { height: value };

export default function ResizableEditorGrid({
  layout,
  nodes,
  viewMode,
  autoFocusFileId,
  onToggleViewMode,
  onSelectTab,
  onCloseTab,
  onCloseOtherTabs,
  onMoveTab,
  onNewNote,
  onSplit,
  onCloseGroup,
  onSavingChange,
  onStatsChange,
  onRenameFile,
  onSwitchToEdit,
  onNavigateWikilink,
  onSplitRatioChange,
  isRightPanelOpen,
  onToggleRightPanel,
}: ResizableEditorGridProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const direction = layout.direction;
  const { size: ratio, startResize, isResizing } = useResizable({
    initial: layout.splitRatio,
    min: 0.15,
    max: 0.85,
    direction,
    isRatio: true,
  });

  // Keep the grid layout as the source of truth so the ratio survives a remount.
  useEffect(() => {
    if (ratio !== layout.splitRatio) onSplitRatioChange?.(ratio);
  }, [ratio, layout.splitRatio, onSplitRatioChange]);

  const [first, second] = layout.groups;

  const paneProps = {
    nodes,
    viewMode,
    autoFocusFileId,
    canCloseGroup: layout.groups.length > 1,
    onToggleViewMode,
    onSelectTab,
    onCloseTab,
    onCloseOtherTabs,
    onMoveTab,
    onNewNote,
    onSplit,
    onCloseGroup,
    onSavingChange,
    onStatsChange,
    onRenameFile,
    onSwitchToEdit,
    onNavigateWikilink,
    isRightPanelOpen,
    onToggleRightPanel,
  };

  return (
    <div
      ref={containerRef}
      className={`flex h-full w-full overflow-hidden bg-[#1e1e22] ${
        direction === 'horizontal' ? 'flex-row' : 'flex-col'
      }`}
    >
      <div
        style={second ? PANE_STYLE(direction, `${ratio * 100}%`) : undefined}
        className={`overflow-hidden ${second ? '' : 'flex-1'} flex`}
      >
        <EditorGroupPane group={first} {...paneProps} />
      </div>

      {second && (
        <>
          <GridSplitter
            direction={direction}
            isResizing={isResizing}
            onMouseDown={(e) => {
              const rect = containerRef.current?.getBoundingClientRect();
              if (!rect) return;
              startResize(e, direction === 'horizontal' ? rect.width : rect.height);
            }}
          />
          <div style={PANE_STYLE(direction, `${(1 - ratio) * 100}%`)} className="flex overflow-hidden">
            <EditorGroupPane group={second} {...paneProps} />
          </div>
        </>
      )}
    </div>
  );
}
