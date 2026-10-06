import type { FileNodeDto } from '../../core/domain/file-node.dto';
import type { VaultDto } from '../../core/domain/vault.dto';
import { useTranslate } from '../../i18n/use-i18n';
import MonochromeIcon, { type IconName } from '../../ui/icon/monochrome-icon';

/** Shared chrome for every header icon button, so weights cannot drift. */
const ACTION_CLASS =
  'flex h-8 w-8 shrink-0 items-center justify-center rounded-md text-zinc-300 transition active:bg-[#282830] hover:bg-[#202026] cursor-pointer';

interface ObsidianMobileHeaderProps {
  vault: VaultDto;
  activeFile: FileNodeDto | null;
  viewMode?: 'edit' | 'preview';
  isDrawerOpen: boolean;
  isOutlineOpen?: boolean;
  onToggleDrawer: () => void;
  onToggleViewMode?: () => void;
  onToggleOutline?: () => void;
  onOpenVaultModal: () => void;
  onNewNote: () => void;
}

export default function ObsidianMobileHeader({
  vault,
  activeFile,
  viewMode = 'edit',
  isDrawerOpen,
  isOutlineOpen = false,
  onToggleDrawer,
  onToggleViewMode,
  onToggleOutline,
  onOpenVaultModal,
  onNewNote,
}: ObsidianMobileHeaderProps) {
  const t = useTranslate();
  const displayTitle = activeFile
    ? activeFile.name.replace(/\.md$/i, '')
    : vault.name;

  const viewModeIcon: IconName = viewMode === 'preview' ? 'bookOpen' : 'pencil';

  return (
    <header
      /* `min-h-11` plus the safe-area inset keeps the 44px bar clear of the
         iOS status bar instead of hiding the trigger behind it. */
      className="flex min-h-11 w-full items-center justify-between gap-1 border-b border-[#26262e] bg-[#141417] px-2 pt-[env(safe-area-inset-top)] select-none md:hidden"
    >
      {/* Left: drawer toggle. Toggles both ways so it can always dismiss. */}
      <button
        type="button"
        onClick={onToggleDrawer}
        aria-expanded={isDrawerOpen}
        aria-label={isDrawerOpen ? t('mobile.closeDrawer') : t('mobile.openExplorer')}
        className={`${ACTION_CLASS} ${isDrawerOpen ? 'bg-[#202026] text-violet-300' : ''}`}
      >
        <MonochromeIcon name={isDrawerOpen ? 'close' : 'menu'} className="h-5 w-5" />
      </button>

      {/* Center: title */}
      <span className="min-w-0 flex-1 truncate px-1 text-center text-xs font-semibold text-zinc-100">
        {displayTitle}
      </span>

      {/* Right: the editor controls the desktop tab bar owns on wide screens. */}
      <div className="flex shrink-0 items-center gap-0.5">
        {activeFile && (
          <>
            <button
              type="button"
              onClick={onToggleViewMode}
              aria-pressed={viewMode === 'preview'}
              className={ACTION_CLASS}
              title={
                viewMode === 'preview'
                  ? t('mobile.switchToEditMode')
                  : t('mobile.switchToReadMode')
              }
            >
              <MonochromeIcon name={viewModeIcon} className="h-4.5 w-4.5" />
            </button>

            <button
              type="button"
              onClick={onToggleOutline}
              aria-pressed={isOutlineOpen}
              className={`${ACTION_CLASS} ${isOutlineOpen ? 'bg-[#202026] text-violet-300' : ''}`}
              title={isOutlineOpen ? t('tab.outlineClose') : t('tab.outlineOpen')}
            >
              <MonochromeIcon name="outline" className="h-4.5 w-4.5" />
            </button>
          </>
        )}

        <button
          type="button"
          onClick={onNewNote}
          className={ACTION_CLASS}
          title={t('mobile.newNote')}
        >
          <MonochromeIcon name="plus" className="h-4.5 w-4.5" />
        </button>

        <button
          type="button"
          onClick={onOpenVaultModal}
          className={`${ACTION_CLASS} text-zinc-400`}
          title={t('mobile.switchVault')}
        >
          <MonochromeIcon name="vault" className="h-4.5 w-4.5" />
        </button>
      </div>
    </header>
  );
}