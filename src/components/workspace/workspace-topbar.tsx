import type { VaultDto } from '../../core/domain/vault.dto';
import { useTranslate } from '../../i18n/use-i18n';

interface WorkspaceTopbarProps {
  vault: VaultDto;
  activeFileName: string | null;
  onExitVault: () => void;
  isSaving?: boolean;
}

export default function WorkspaceTopbar({
  vault,
  activeFileName,
  onExitVault,
  isSaving = false,
}: WorkspaceTopbarProps) {
  const t = useTranslate();
  return (
    <header className="flex h-12 w-full items-center justify-between border-b border-zinc-800 bg-zinc-950 px-4 select-none">
      {/* Left: Vault Switcher */}
      <div className="flex items-center space-x-2">
        <button
          onClick={onExitVault}
          className="flex items-center space-x-2 rounded-md px-2.5 py-1 text-xs font-medium text-zinc-300 hover:bg-zinc-800 hover:text-zinc-100 transition"
          title={t('mobile.switchVault')}
        >
          <span className="flex h-2 w-2 rounded-full bg-sky-400" />
          <span className="font-semibold">{vault.name}</span>
          <svg className="h-3.5 w-3.5 text-zinc-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 9l4-4 4 4m0 6l-4 4-4-4" />
          </svg>
        </button>
      </div>

      {/* Center: Active File Name */}
      <div className="flex items-center text-xs text-zinc-400">
        {activeFileName ? (
          <span className="font-medium text-zinc-200">{activeFileName}</span>
        ) : (
          <span className="italic text-zinc-600">{t('sidebar.noFileSelected')}</span>
        )}
      </div>

      {/* Right: Status indicator */}
      <div className="flex items-center space-x-2 text-xs">
        {isSaving ? (
          <span className="flex items-center space-x-1.5 text-amber-400">
            <span className="h-1.5 w-1.5 rounded-full bg-amber-400 animate-pulse" />
            <span>{t('statusbar.saving')}</span>
          </span>
        ) : (
          <span className="flex items-center space-x-1.5 text-zinc-500">
            <span className="h-1.5 w-1.5 rounded-full bg-emerald-500/70" />
            <span>{t('statusbar.saved')}</span>
          </span>
        )}
      </div>
    </header>
  );
}
