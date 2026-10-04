import type { FileNodeDto } from '../../core/domain/file-node.dto';
import type { SidebarMenuId } from '../../core/domain/sidebar-panel.dto';
import type { VaultDto } from '../../core/domain/vault.dto';
import { useResizable } from '../../hooks/use-resizable';
import ObsidianSidebar from './obsidian-sidebar';
import OutlinePanel from './outline-panel';
import PluginsPanel from './plugins-panel';
import SearchPanel from './search-panel';

interface SidebarPanelContainerProps {
  activeMenu: SidebarMenuId | null;
  onClose: () => void;
  vault: VaultDto;
  vaults: VaultDto[];
  nodes: FileNodeDto[];
  activeFile: FileNodeDto | null;
  activeFileId: string | null;
  onSelectVault: (id: string) => void;
  onOpenVaultModal: () => void;
  onSelectFile: (fileId: string) => void;
  onCreateFile: (name?: string, parentId?: string | null) => Promise<unknown>;
  onCreateFolder: (name?: string, parentId?: string | null) => Promise<unknown>;
  onRenameNode: (id: string, newName: string) => Promise<unknown>;
  onDeleteNode: (id: string) => Promise<unknown>;
  onDeleteNodes?: (ids: string[]) => Promise<unknown>;
  onMoveNode?: (id: string, newParentId: string | null) => Promise<unknown>;
  onRefresh: () => void;
}

const MENU_TITLES: Record<SidebarMenuId, string> = {
  explorer: '파일 탐색기',
  search: '빠른 검색',
  outline: '문서 목차',
  plugins: '확장 플러그인',
};

export default function SidebarPanelContainer({
  activeMenu,
  onClose,
  vault,
  vaults,
  nodes,
  activeFile,
  activeFileId,
  onSelectVault,
  onOpenVaultModal,
  onSelectFile,
  onCreateFile,
  onCreateFolder,
  onRenameNode,
  onDeleteNode,
  onDeleteNodes,
  onMoveNode,
  onRefresh,
}: SidebarPanelContainerProps) {
  const { size: width, startResize, isResizing } = useResizable({
    initial: 260,
    min: 200,
    max: 480,
    direction: 'horizontal',
  });

  if (!activeMenu) return null;

  return (
    <div
      style={{ width: `${width}px` }}
      className="relative flex h-full shrink-0 flex-col border-r border-[#26262e] bg-[#18181b] select-none text-zinc-300 transition-none"
    >
      {/* Panel Header */}
      <div className="flex h-9 items-center justify-between border-b border-[#24242a] px-3.5">
        <span className="text-xs font-bold tracking-tight text-zinc-200">
          {MENU_TITLES[activeMenu]}
        </span>
        <button
          onClick={onClose}
          className="rounded p-1 text-zinc-400 hover:bg-[#26262e] hover:text-zinc-100 transition cursor-pointer"
          title="사이드바 접기"
        >
          <svg className="h-3.5 w-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
          </svg>
        </button>
      </div>

      {/* Swappable Panel Content */}
      <div className="flex-1 overflow-hidden">
        {activeMenu === 'explorer' && (
          <ObsidianSidebar
            vault={vault}
            vaults={vaults}
            nodes={nodes}
            activeFileId={activeFileId}
            onOpenVaultModal={onOpenVaultModal}
            onSelectVault={onSelectVault}
            onSelectFile={onSelectFile}
            onCreateFile={onCreateFile}
            onCreateFolder={onCreateFolder}
            onRenameNode={onRenameNode}
            onDeleteNode={onDeleteNode}
            onDeleteNodes={onDeleteNodes}
            onMoveNode={onMoveNode}
            onRefresh={onRefresh}
          />
        )}
        {activeMenu === 'search' && <SearchPanel nodes={nodes} onSelectFile={onSelectFile} />}
        {activeMenu === 'outline' && <OutlinePanel activeFile={activeFile} />}
        {activeMenu === 'plugins' && <PluginsPanel />}
      </div>

      {/* Right Drag Resize Handle */}
      <div
        onMouseDown={startResize}
        className={`absolute right-0 top-0 bottom-0 w-1 cursor-col-resize hover:bg-violet-500/60 transition ${
          isResizing ? 'bg-violet-500 w-1.5' : ''
        }`}
        title="드래그하여 사이드바 너비 조절"
      />
    </div>
  );
}
