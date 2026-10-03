import { useState } from 'react';
import type { VaultDto } from '../../core/domain/vault.dto';
import { useActiveWorkspace } from '../../hooks/use-active-workspace';
import MarkdownEditor from '../editor/markdown-editor';
import FileExplorer from '../sidebar/file-explorer';
import WorkspaceTopbar from './workspace-topbar';

interface WorkspaceLayoutProps {
  vault: VaultDto;
  onExitVault: () => void;
}

export default function WorkspaceLayout({
  vault,
  onExitVault,
}: WorkspaceLayoutProps) {
  const [isSaving, setIsSaving] = useState(false);
  const workspace = useActiveWorkspace(vault.id);

  return (
    <div className="flex h-screen w-screen flex-col overflow-hidden bg-zinc-950 text-zinc-100 font-sans">
      <WorkspaceTopbar
        vault={vault}
        activeFileName={workspace.activeFile?.name ?? null}
        onExitVault={onExitVault}
        isSaving={isSaving}
      />

      <div className="flex flex-1 overflow-hidden">
        <FileExplorer
          nodes={workspace.nodes}
          activeFileId={workspace.activeFileId}
          onSelectFile={workspace.selectFile}
          onCreateFile={workspace.createFile}
          onCreateFolder={workspace.createFolder}
          onRenameNode={workspace.renameNode}
          onDeleteNode={workspace.deleteNode}
          onRefresh={workspace.refreshNodes}
        />

        <main className="flex flex-1 overflow-hidden">
          <MarkdownEditor
            activeFile={workspace.activeFile}
            onSavingChange={setIsSaving}
          />
        </main>
      </div>
    </div>
  );
}
