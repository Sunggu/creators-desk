import { useRef } from 'react';
import type { EditorGridLayoutDto, SplitDirection } from '../../core/domain/editor-grid.dto';
import type { FileNodeDto } from '../../core/domain/file-node.dto';
import type { EditorStats } from '../../hooks/use-codemirror';
import { useResizable } from '../../hooks/use-resizable';
import EditorGroupView from './editor-group-view';
import GridSplitter from './grid-splitter';

interface ResizableEditorGridProps {
  layout: EditorGridLayoutDto;
  nodes: FileNodeDto[];
  viewMode: 'edit' | 'preview';
  onToggleViewMode: () => void;
  onSelectTab: (groupId: string, fileId: string) => void;
  onCloseTab: (groupId: string, fileId: string) => void;
  onCloseOtherTabs?: (groupId: string, fileId: string) => void;
  onNewNote: () => void;
  onSplit: (sourceGroupId: string, fileId: string, direction: SplitDirection) => void;
  onCloseGroup: (groupId: string) => void;
  onSavingChange: (saving: boolean) => void;
  onStatsChange: (stats: EditorStats) => void;
  onRenameFile: (id: string, name: string) => Promise<unknown>;
  isRightPanelOpen?: boolean;
  onToggleRightPanel?: () => void;
}

export default function ResizableEditorGrid({
  layout,
  nodes,
  viewMode,
  onToggleViewMode,
  onSelectTab,
  onCloseTab,
  onCloseOtherTabs,
  onNewNote,
  onSplit,
  onCloseGroup,
  onSavingChange,
  onStatsChange,
  onRenameFile,
  isRightPanelOpen,
  onToggleRightPanel,
}: ResizableEditorGridProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const isHorizontal = layout.direction === 'horizontal';

  const { size: ratio, startResize, isResizing } = useResizable({
    initial: layout.splitRatio,
    min: 0.15,
    max: 0.85,
    direction: isHorizontal ? 'horizontal' : 'vertical',
    isRatio: true,
  });

  const groups = layout.groups;
  if (groups.length === 1) {
    return (
      <div className="flex h-full w-full overflow-hidden bg-[#1e1e22]">
        <EditorGroupView
          group={groups[0]}
          nodes={nodes}
          viewMode={viewMode}
          canCloseGroup={false}
          onToggleViewMode={onToggleViewMode}
          onSelectTab={(fileId) => onSelectTab(groups[0].id, fileId)}
          onCloseTab={(fileId) => onCloseTab(groups[0].id, fileId)}
          onCloseOtherTabs={(fileId) => onCloseOtherTabs?.(groups[0].id, fileId)}
          onNewNote={onNewNote}
          onSplit={(fileId, dir) => onSplit(groups[0].id, fileId, dir)}
          onCloseGroup={() => {}}
          onSavingChange={onSavingChange}
          onStatsChange={onStatsChange}
          onRenameFile={onRenameFile}
          isRightPanelOpen={isRightPanelOpen}
          onToggleRightPanel={onToggleRightPanel}
        />
      </div>
    );
  }

  const handleSplitterMouseDown = (e: React.MouseEvent) => {
    if (!containerRef.current) return;
    const rect = containerRef.current.getBoundingClientRect();
    const containerSize = isHorizontal ? rect.width : rect.height;
    startResize(e, containerSize);
  };

  const firstGroupStyle = isHorizontal
    ? { width: `${ratio * 100}%` }
    : { height: `${ratio * 100}%` };

  const secondGroupStyle = isHorizontal
    ? { width: `${(1 - ratio) * 100}%` }
    : { height: `${(1 - ratio) * 100}%` };

  return (
    <div
      ref={containerRef}
      className={`flex h-full w-full overflow-hidden bg-[#1e1e22] ${
        isHorizontal ? 'flex-row' : 'flex-col'
      }`}
    >
      <div style={firstGroupStyle} className="flex overflow-hidden">
        <EditorGroupView
          group={groups[0]}
          nodes={nodes}
          viewMode={viewMode}
          canCloseGroup={true}
          onToggleViewMode={onToggleViewMode}
          onSelectTab={(fileId) => onSelectTab(groups[0].id, fileId)}
          onCloseTab={(fileId) => onCloseTab(groups[0].id, fileId)}
          onCloseOtherTabs={(fileId) => onCloseOtherTabs?.(groups[0].id, fileId)}
          onNewNote={onNewNote}
          onSplit={(fileId, dir) => onSplit(groups[0].id, fileId, dir)}
          onCloseGroup={() => onCloseGroup(groups[0].id)}
          onSavingChange={onSavingChange}
          onStatsChange={onStatsChange}
          onRenameFile={onRenameFile}
          isRightPanelOpen={isRightPanelOpen}
          onToggleRightPanel={onToggleRightPanel}
        />
      </div>

      <GridSplitter
        direction={layout.direction}
        onMouseDown={handleSplitterMouseDown}
        isResizing={isResizing}
      />

      <div style={secondGroupStyle} className="flex overflow-hidden">
        <EditorGroupView
          group={groups[1]}
          nodes={nodes}
          viewMode={viewMode}
          canCloseGroup={true}
          onToggleViewMode={onToggleViewMode}
          onSelectTab={(fileId) => onSelectTab(groups[1].id, fileId)}
          onCloseTab={(fileId) => onCloseTab(groups[1].id, fileId)}
          onCloseOtherTabs={(fileId) => onCloseOtherTabs?.(groups[1].id, fileId)}
          onNewNote={onNewNote}
          onSplit={(fileId, dir) => onSplit(groups[1].id, fileId, dir)}
          onCloseGroup={() => onCloseGroup(groups[1].id)}
          onSavingChange={onSavingChange}
          onStatsChange={onStatsChange}
          onRenameFile={onRenameFile}
          isRightPanelOpen={isRightPanelOpen}
          onToggleRightPanel={onToggleRightPanel}
        />
      </div>
    </div>
  );
}
