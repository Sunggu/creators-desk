import type { ResourceKey } from '../../i18n/resources';
import { useTranslate } from '../../i18n/use-i18n';

/** The settings modal's panes. Presentation-only, never persisted. */
export type SettingsTab = 'licenses' | 'project' | 'preferences' | 'plugins';

/** Resource id of each tab's label, in rail order. */
const TAB_LABEL_KEYS: Record<SettingsTab, ResourceKey> = {
  licenses: 'settings.tabLicenses',
  project: 'settings.tabProject',
  preferences: 'settings.tabPreferences',
  plugins: 'settings.tabPlugins',
};

const TAB_ORDER: readonly SettingsTab[] = ['licenses', 'project', 'preferences', 'plugins'];

interface SettingsTabRailProps {
  activeTab: SettingsTab;
  onSelect: (tab: SettingsTab) => void;
}

/**
 * Left rail of the settings modal.
 *
 * Owns nothing but the tab order and its labels, so the modal can stay focused
 * on layout and routing (Rule 6).
 */
export default function SettingsTabRail({ activeTab, onSelect }: SettingsTabRailProps) {
  const t = useTranslate();

  return (
    <div className="w-44 shrink-0 space-y-1 border-r border-[#26262e] bg-[#141417] p-2">
      {TAB_ORDER.map((tab) => (
        <button
          key={tab}
          onClick={() => onSelect(tab)}
          className={`flex w-full cursor-pointer items-center space-x-2 rounded px-2.5 py-2 text-xs font-medium transition ${
            activeTab === tab
              ? 'bg-violet-600/20 font-semibold text-violet-300'
              : 'text-zinc-400 hover:bg-[#1e1e24] hover:text-zinc-200'
          }`}
        >
          <span>{t(TAB_LABEL_KEYS[tab])}</span>
        </button>
      ))}
    </div>
  );
}