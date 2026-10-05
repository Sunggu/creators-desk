import { useEffect, useState } from 'react';
import { APP_VERSION } from '../../core/app-version';
import type { VaultDto } from '../../core/domain/vault.dto';
import { useTranslate } from '../../i18n/use-i18n';
import OpenSourceLicensesView from './open-source-licenses-view';
import PluginsView from './plugins-view';
import PreferencesTab from './preferences-tab';
import ProjectSettingsTab from './project-settings-tab';
import SettingsTabRail, { type SettingsTab } from './settings-tab-rail';

interface SettingsModalProps {
  isOpen: boolean;
  activeVault: VaultDto;
  onClose: () => void;
  onRenameVault?: (id: string, newAlias: string) => void;
}

/**
 * Settings shell: chrome, tab routing, Escape handling.
 *
 * All copy lives in the resource bundles and all content lives in the pane
 * components, so this file stays a layout concern (Rules 4 and 6).
 */
export default function SettingsModal({
  isOpen,
  activeVault,
  onClose,
  onRenameVault,
}: SettingsModalProps) {
  const t = useTranslate();
  const [activeTab, setActiveTab] = useState<SettingsTab>('licenses');

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape' && isOpen) onClose();
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex animate-in items-center justify-center bg-black/70 p-4 backdrop-blur-xs fade-in duration-150 select-none">
      <div
        className="flex h-[560px] w-full max-w-2xl flex-col overflow-hidden rounded-lg border border-[#2a2a32] bg-[#18181b] shadow-2xl"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex h-12 items-center justify-between border-b border-[#26262e] px-4">
          <div className="flex items-center space-x-2">
            <span className="text-sm font-semibold text-zinc-100">{t('settings.title')}</span>
            <span className="rounded bg-violet-500/20 px-1.5 py-0.5 text-[10px] font-medium text-violet-300">
              v{APP_VERSION}
            </span>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="cursor-pointer rounded p-1 text-zinc-400 transition hover:bg-[#26262e] hover:text-zinc-100"
            title={t('settings.closeTitle')}
          >
            <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>

        <div className="flex flex-1 overflow-hidden">
          <SettingsTabRail activeTab={activeTab} onSelect={setActiveTab} />

          <div className="flex-1 overflow-y-auto bg-[#18181b] p-4">
            {activeTab === 'licenses' && <OpenSourceLicensesView />}
            {activeTab === 'plugins' && <PluginsView />}
            {activeTab === 'project' && (
              <ProjectSettingsTab vault={activeVault} onRenameVault={onRenameVault} />
            )}
            {activeTab === 'preferences' && <PreferencesTab />}
          </div>
        </div>
      </div>
    </div>
  );
}