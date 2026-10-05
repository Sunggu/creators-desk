import type { FileNodeDto } from '../../core/domain/file-node.dto';
import type { VaultDto } from '../../core/domain/vault.dto';
import { useTranslate } from '../../i18n/use-i18n';

interface ObsidianMobileHeaderProps {
  vault: VaultDto;
  activeFile: FileNodeDto | null;
  viewMode?: 'edit' | 'preview';
  onToggleViewMode?: () => void;
  onOpenSidebar: () => void;
  onOpenVaultModal: () => void;
  onNewNote: () => void;
}

export default function ObsidianMobileHeader({
  vault,
  activeFile,
  viewMode = 'edit',
  onToggleViewMode,
  onOpenSidebar,
  onOpenVaultModal,
  onNewNote,
}: ObsidianMobileHeaderProps) {
  const t = useTranslate();
  const displayTitle = activeFile
    ? activeFile.name.replace(/\.md$/i, '')
    : vault.name;

  return (
    <header className="flex h-11 w-full items-center justify-between border-b border-[#26262e] bg-[#141417] px-3 md:hidden select-none">
      {/* Left: Sidebar Toggle (Hamburger / Folder) */}
      <button
        onClick={onOpenSidebar}
        className="flex h-8 w-8 items-center justify-center rounded-md text-zinc-300 hover:bg-[#202026] active:bg-[#282830]"
        title={t('mobile.openExplorer')}
      >
        <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
        </svg>
      </button>

      {/* Center: Title */}
      <div className="flex items-center space-x-1.5 overflow-hidden px-2">
        <span className="truncate text-xs font-semibold text-zinc-100 max-w-[160px]">
          {displayTitle}
        </span>
      </div>

      {/* Right Actions: Mode Toggle, New Note & Vault Switcher */}
      <div className="flex items-center space-x-1">
        {activeFile && (
          <button
            onClick={onToggleViewMode}
            className="flex h-8 w-8 items-center justify-center rounded-md text-zinc-300 hover:bg-[#202026] active:bg-[#282830]"
            title={
            viewMode === 'preview'
              ? t('mobile.switchToEditMode')
              : t('mobile.switchToReadMode')
          }
          >
            <span className="text-sm">{viewMode === 'preview' ? '📖' : '✏️'}</span>
          </button>
        )}

        <button
          onClick={onNewNote}
          className="flex h-8 w-8 items-center justify-center rounded-md text-zinc-300 hover:bg-[#202026] active:bg-[#282830]"
          title={t('mobile.newNote')}
        >
          <svg className="h-4.5 w-4.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
          </svg>
        </button>

        <button
          onClick={onOpenVaultModal}
          className="flex h-8 w-8 items-center justify-center rounded-md text-zinc-400 hover:bg-[#202026] active:bg-[#282830]"
          title={t('mobile.switchVault')}
        >
          <svg className="h-4.5 w-4.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
          </svg>
        </button>
      </div>
    </header>
  );
}
