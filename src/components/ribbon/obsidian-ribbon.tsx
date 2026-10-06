import type { SidebarMenuId } from '../../core/domain/sidebar-panel.dto';
import { useTranslate } from '../../i18n/use-i18n';
import MonochromeIcon, { type IconName } from '../../ui/icon/monochrome-icon';

interface ObsidianRibbonProps {
  activeMenu: SidebarMenuId | null;
  onSelectMenu: (menu: SidebarMenuId) => void;
  onOpenVaultModal: () => void;
  onOpenSettingsModal: () => void;
}

interface RibbonEntry {
  id: SidebarMenuId;
  title: string;
  icon: IconName;
}

export default function ObsidianRibbon({
  activeMenu,
  onSelectMenu,
  onOpenVaultModal,
  onOpenSettingsModal,
}: ObsidianRibbonProps) {
  const t = useTranslate();

  const topMenus: RibbonEntry[] = [
    { id: 'explorer', title: t('ribbon.menuExplorer'), icon: 'folder' },
    { id: 'search', title: t('ribbon.menuSearch'), icon: 'search' },
  ];

  return (
    <aside className="hidden md:flex h-full w-11 shrink-0 flex-col items-center justify-between border-r border-[#26262e] bg-[#121215] py-2.5 text-zinc-400 select-none">
      {/* Top Activity Menus */}
      <div className="flex flex-col items-center space-y-2">
        {topMenus.map((menu) => (
          <button
            key={menu.id}
            onClick={() => onSelectMenu(menu.id)}
            className={`flex h-8 w-8 items-center justify-center rounded-md transition cursor-pointer ${
              activeMenu === menu.id
                ? 'bg-[#202026] text-violet-400'
                : 'hover:bg-[#1a1a1f] hover:text-zinc-200'
            }`}
            title={menu.title}
          >
            <MonochromeIcon name={menu.icon} className="h-4.5 w-4.5" />
          </button>
        ))}
      </div>

      {/* Bottom Management Modals */}
      <div className="flex flex-col items-center space-y-2">
        <button
          onClick={onOpenVaultModal}
          className="flex h-8 w-8 items-center justify-center rounded-md text-zinc-400 hover:bg-[#1a1a1f] hover:text-violet-300 transition cursor-pointer"
          title={t('ribbon.vaultModal')}
        >
          <MonochromeIcon name="vault" className="h-4.5 w-4.5" />
        </button>

        <button
          onClick={onOpenSettingsModal}
          className="flex h-8 w-8 items-center justify-center rounded-md text-zinc-400 hover:bg-[#1a1a1f] hover:text-zinc-200 transition cursor-pointer"
          title={t('ribbon.settings')}
        >
          <MonochromeIcon name="settings" className="h-4.5 w-4.5" />
        </button>
      </div>
    </aside>
  );
}