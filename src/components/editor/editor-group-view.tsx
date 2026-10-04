import type { EditorGroupDto, SplitDirection } from '../../core/domain/editor-grid.dto';
import type { FileNodeDto } from '../../core/domain/file-node.dto';
import type { EditorStats } from '../../hooks/use-codemirror';
import ObsidianTabBar from '../tabs/obsidian-tab-bar';
import EditorDropZone from './editor-drop-zone';
import ObsidianEditor from './obsidian-editor';

interface EditorGroupViewProps {
  group: EditorGroupDto;
  nodes: FileNodeDto[];
  viewMode: 'edit' | 'preview';
  canCloseGroup: boolean;
  onToggleViewMode: () => void;
  onSelectTab: (fileId: string) => void;
  onCloseTab: (fileId: string) => void;
  onNewNote: () => void;
  onSplit: (fileId: string, direction: SplitDirection) => void;
  onCloseGroup: () => void;
  onSavingChange: (saving: boolean) => void;
  onStatsChange: (stats: EditorStats) => void;
  onRenameFile: (id: string, name: string) => Promise<unknown>;
}

export default function EditorGroupView({
  group,
  nodes,
  viewMode,
  canCloseGroup,
  onToggleViewMode,
  onSelectTab,
  onCloseTab,
  onNewNote,
  onSplit,
  onCloseGroup,
  onSavingChange,
  onStatsChange,
  onRenameFile,
}: EditorGroupViewProps) {
  const openFiles = group.fileIds
    .map((id) => nodes.find((n) => n.id === id && n.type === 'file'))
    .filter((n): n is FileNodeDto => Boolean(n));

  const activeFile = nodes.find((n) => n.id === group.activeFileId && n.type === 'file') ?? null;

  return (
    <div className="relative flex flex-1 flex-col h-full overflow-hidden bg-[#1e1e22]">
      <ObsidianTabBar
        openFiles={openFiles}
        activeFileId={group.activeFileId}
        viewMode={viewMode}
        onToggleViewMode={onToggleViewMode}
        onSelectTab={onSelectTab}
        onCloseTab={onCloseTab}
        onNewNote={onNewNote}
        onSplitHorizontal={
          group.activeFileId ? () => onSplit(group.activeFileId!, 'horizontal') : undefined
        }
        onSplitVertical={
          group.activeFileId ? () => onSplit(group.activeFileId!, 'vertical') : undefined
        }
        onCloseGroup={onCloseGroup}
        canCloseGroup={canCloseGroup}
      />

      <div className="relative flex-1 overflow-hidden">
        <ObsidianEditor
          activeFile={activeFile}
          viewMode={viewMode}
          onSwitchToEdit={() => {}}
          onSavingChange={onSavingChange}
          onStatsChange={onStatsChange}
          onNewNote={onNewNote}
          onRenameFile={onRenameFile}
        />

        {/* Tab Drop Zone Overlay */}
        <EditorDropZone onSplitDrop={onSplit} />
      </div>
    </div>
  );
}
