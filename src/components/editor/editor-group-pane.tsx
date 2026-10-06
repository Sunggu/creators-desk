import type { EditorGroupDto } from '../../core/domain/editor-grid.dto';
import type { EditorStats } from '../../core/domain/editor-stats.dto';
import type { FileNodeDto } from '../../core/domain/file-node.dto';
import EditorGroupView from './editor-group-view';
import type { EditorGridGroupHandlers } from './editor-group-binding';
import { bindEditorPaneHandlers } from './editor-group-binding';

interface EditorGroupPaneProps extends EditorGridGroupHandlers {
  group: EditorGroupDto;
  nodes: FileNodeDto[];
  viewMode: 'edit' | 'preview';
  canCloseGroup: boolean;
  autoFocusFileId?: string | null;
  onToggleViewMode: () => void;
  onNewNote: () => void;
  onSavingChange: (saving: boolean) => void;
  onStatsChange: (stats: EditorStats) => void;
  onRenameFile: (id: string, name: string) => Promise<unknown>;
  onSwitchToEdit: () => void;
  onNavigateWikilink?: (target: string) => void;
  isRightPanelOpen?: boolean;
  onToggleRightPanel?: () => void;
}

/**
 * Adapts grid-scoped handlers to one pane. Every shared prop is declared a
 * single time here, so adding a feature to a pane can never leave one of the
 * grid's render paths behind.
 */
export default function EditorGroupPane({
  group,
  nodes,
  viewMode,
  canCloseGroup,
  autoFocusFileId,
  onToggleViewMode,
  onNewNote,
  onSavingChange,
  onStatsChange,
  onRenameFile,
  onSwitchToEdit,
  onNavigateWikilink,
  isRightPanelOpen,
  onToggleRightPanel,
  ...gridHandlers
}: EditorGroupPaneProps) {
  const handlers = bindEditorPaneHandlers(group.id, gridHandlers);

  return (
    <EditorGroupView
      group={group}
      nodes={nodes}
      viewMode={viewMode}
      canCloseGroup={canCloseGroup}
      autoFocusFileId={autoFocusFileId}
      onToggleViewMode={onToggleViewMode}
      onNewNote={onNewNote}
      onSavingChange={onSavingChange}
      onStatsChange={onStatsChange}
      onRenameFile={onRenameFile}
      onSwitchToEdit={onSwitchToEdit}
      onNavigateWikilink={onNavigateWikilink}
      isRightPanelOpen={isRightPanelOpen}
      onToggleRightPanel={onToggleRightPanel}
      onSelectTab={handlers.onSelectTab}
      onCloseTab={handlers.onCloseTab}
      onCloseOtherTabs={handlers.onCloseOtherTabs}
      onMoveTab={handlers.onMoveTab}
      onSplit={handlers.onSplit}
      onCloseGroup={handlers.onCloseGroup}
    />
  );
}
