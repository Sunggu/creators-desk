import type { ResourceKey } from '../../i18n/resources';
import { useTranslate } from '../../i18n/use-i18n';
import MonochromeIcon, { type IconName } from '../../ui/icon/monochrome-icon';

/** The settings modal's panes. Presentation-only, never persisted. */
export type SettingsTab = 'licenses' | 'project' | 'preferences' | 'plugins';

interface TabDescriptor {
  labelKey: ResourceKey;
  icon: IconName;
}

/**
 * Glyphs live here, not in the resource bundles.
 *
 * They used to be baked into `settings.tab*` strings, which made them
 * impossible to restyle, impossible to reach by role/name, and impossible to
 * keep monochrome. Labels are now text only; this map owns every icon.
 */
const TAB_META: Record<SettingsTab, TabDescriptor> = {
  licenses: { labelKey: 'settings.tabLicenses', icon: 'scroll' },
  project: { labelKey: 'settings.tabProject', icon: 'folder' },
  preferences: { labelKey: 'settings.tabPreferences', icon: 'sliders' },
  plugins: { labelKey: 'settings.tabPlugins', icon: 'puzzle' },
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
          aria-current={activeTab === tab ? 'page' : undefined}
          className={`flex w-full cursor-pointer items-center gap-2.5 rounded px-2.5 py-2 text-xs font-medium transition ${
            activeTab === tab
              ? 'bg-violet-600/20 font-semibold text-violet-300'
              : 'text-zinc-400 hover:bg-[#1e1e24] hover:text-zinc-200'
          }`}
        >
          <MonochromeIcon name={TAB_META[tab].icon} className="h-4 w-4 shrink-0" />
          <span className="truncate">{t(TAB_META[tab].labelKey)}</span>
        </button>
      ))}
    </div>
  );
}