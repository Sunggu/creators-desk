import type { EditorGroupDto, SplitDirection } from '../../core/domain/editor-grid.dto';
import type { EditorStats } from '../../core/domain/editor-stats.dto';
import type { FileNodeDto } from '../../core/domain/file-node.dto';
import type { TabDropPosition } from '../../core/domain/tab-drag.dto';
import { useSplitDropTarget } from '../../hooks/use-split-drop-target';
import ObsidianTabBar from '../tabs/obsidian-tab-bar';
import ObsidianEditor from './obsidian-editor';
import SplitDropOverlay from './split-drop-overlay';

export interface EditorGroupViewProps {
  group: EditorGroupDto;
  nodes: FileNodeDto[];
  viewMode: 'edit' | 'preview';
  canCloseGroup: boolean;
  /** File whose inline title should grab focus (e.g. a just-created note). */
  autoFocusFileId?: string | null;
  onToggleViewMode: () => void;
  onSelectTab: (fileId: string) => void;
  onCloseTab: (fileId: string) => void;
  onCloseOtherTabs?: (fileId: string) => void;
  onMoveTab?: (sourceFileId: string, targetFileId: string, position: TabDropPosition) => void;
  onNewNote: () => void;
  onSplit: (fileId: string, direction: SplitDirection) => void;
  onCloseGroup: () => void;
  onSavingChange: (saving: boolean) => void;
  onStatsChange: (stats: EditorStats) => void;
  onRenameFile: (id: string, name: string) => Promise<unknown>;
  onSwitchToEdit: () => void;
  onNavigateWikilink?: (target: string) => void;
  isRightPanelOpen?: boolean;
  onToggleRightPanel?: () => void;
}

export default function EditorGroupView({
  group,
  nodes,
  viewMode,
  canCloseGroup,
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
  isRightPanelOpen,
  onToggleRightPanel,
}: EditorGroupViewProps) {
  const openFiles = group.fileIds
    .map((id) => nodes.find((n) => n.id === id && n.type === 'file'))
    .filter((n): n is FileNodeDto => Boolean(n));

  const activeFile = nodes.find((n) => n.id === group.activeFileId && n.type === 'file') ?? null;

  const { edge, dropZoneProps } = useSplitDropTarget({ onSplitDrop: onSplit });

  return (
    <div className="relative flex flex-1 flex-col h-full overflow-hidden bg-[#1e1e22]">
      <ObsidianTabBar
        openFiles={openFiles}
        activeFileId={group.activeFileId}
        viewMode={viewMode}
        onToggleViewMode={onToggleViewMode}
        onSelectTab={onSelectTab}
        onCloseTab={onCloseTab}
        onCloseOtherTabs={onCloseOtherTabs}
        onMoveTab={onMoveTab}
        onNewNote={onNewNote}
        isRightPanelOpen={isRightPanelOpen}
        onToggleRightPanel={onToggleRightPanel}
        onSplitHorizontal={(targetId) => onSplit(targetId ?? group.activeFileId ?? '', 'horizontal')}
        onSplitVertical={(targetId) => onSplit(targetId ?? group.activeFileId ?? '', 'vertical')}
        onCloseGroup={onCloseGroup}
        canCloseGroup={canCloseGroup}
      />

      <div data-editor-pane className="relative flex-1 overflow-hidden" {...dropZoneProps}>
        <ObsidianEditor
          activeFile={activeFile}
          viewMode={viewMode}
          onSwitchToEdit={onSwitchToEdit}
          onNavigateWikilink={onNavigateWikilink}
          autoFocusTitle={Boolean(activeFile && activeFile.id === autoFocusFileId)}
          onSavingChange={onSavingChange}
          onStatsChange={onStatsChange}
          onNewNote={onNewNote}
          onRenameFile={onRenameFile}
        />

        <SplitDropOverlay edge={edge} />
      </div>
    </div>
  );
}
