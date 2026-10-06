import type { SidebarMenuId } from '../../core/domain/sidebar-panel.dto';
import { useTranslate } from '../../i18n/use-i18n';
import MonochromeIcon, { type IconName } from '../../ui/icon/monochrome-icon';
import type { SidebarPanelBodyProps } from '../sidebar/sidebar-panel-body';
import SidebarPanelBody from '../sidebar/sidebar-panel-body';

interface DrawerNavEntry {
  id: SidebarMenuId;
  icon: IconName;
}

const NAV_ENTRIES: readonly DrawerNavEntry[] = [
  { id: 'explorer', icon: 'folder' },
  { id: 'search', icon: 'search' },
];

const NAV_TITLE_KEYS: Record<SidebarMenuId, 'ribbon.menuExplorer' | 'ribbon.menuSearch'> = {
  explorer: 'ribbon.menuExplorer',
  search: 'ribbon.menuSearch',
};

type DrawerBodyProps = Omit<SidebarPanelBodyProps, 'activeMenu' | 'onCloseMobile' | 'onOpenVaultModal'>;

export interface MobileDrawerProps extends DrawerBodyProps {
  isOpen: boolean;
  activeMenu: SidebarMenuId;
  onSelectMenu: (menu: SidebarMenuId) => void;
  onClose: () => void;
  onOpenVaultModal: () => void;
  onOpenSettingsModal: () => void;
  /** Leftward swipe on the panel itself; supplied by `useDrawerGesture`. */
  panelGestureProps: {
    onTouchStart: (e: React.TouchEvent) => void;
    onTouchEnd: (e: React.TouchEvent) => void;
  };
}

/**
 * Off-canvas navigation drawer for narrow viewports.
 *
 * The desktop ribbon is `hidden md:flex`, so search and settings had no mobile
 * entry point at all. This drawer carries the same destinations plus the panel
 * body, and slides over the editor instead of squeezing it.
 *
 * It stays mounted while closed so the slide transition can animate, and is
 * `inert` in that state so a hidden drawer can never take a tap or a tab stop.
 */
export default function MobileDrawer({
  isOpen,
  activeMenu,
  onSelectMenu,
  onClose,
  onOpenVaultModal,
  onOpenSettingsModal,
  panelGestureProps,
  ...body
}: MobileDrawerProps) {
  const t = useTranslate();

  return (
    <>
      <button
        type="button"
        tabIndex={isOpen ? 0 : -1}
        aria-hidden={!isOpen}
        data-drawer-backdrop
        aria-label={t('mobile.closeDrawer')}
        onClick={onClose}
        className={`fixed inset-0 z-40 cursor-default bg-black/60 backdrop-blur-xs transition-opacity duration-200 motion-reduce:transition-none md:hidden ${
          isOpen ? 'opacity-100' : 'pointer-events-none opacity-0'
        }`}
      />

      <aside
        {...panelGestureProps}
        data-drawer
        inert={!isOpen}
        aria-label={t('ribbon.menuExplorer')}
        className={`fixed inset-y-0 left-0 z-50 flex w-72 max-w-[85vw] flex-col border-r border-[#26262e] bg-[#18181b] text-zinc-300 shadow-2xl select-none transition-transform duration-200 ease-out motion-reduce:transition-none md:hidden ${
          isOpen ? 'translate-x-0' : 'pointer-events-none -translate-x-full'
        }`}
      >
        {/* Header: title plus the only always-visible dismiss control. */}
        <div className="flex h-11 shrink-0 items-center justify-between border-b border-[#26262e] px-2">
          <span className="text-xs font-bold tracking-tight text-zinc-200">
            {t(NAV_TITLE_KEYS[activeMenu])}
          </span>
          <button
            type="button"
            onClick={onClose}
            className="flex h-8 w-8 cursor-pointer items-center justify-center rounded-md text-zinc-400 transition hover:bg-[#26262e] hover:text-zinc-100"
            title={t('mobile.closeDrawer')}
          >
            <MonochromeIcon name="close" className="h-4.5 w-4.5" />
          </button>
        </div>

        {/* Activity menus, mirroring the desktop ribbon. */}
        <nav className="flex shrink-0 items-center gap-1 border-b border-[#24242a] px-2 py-1.5">
          {NAV_ENTRIES.map((entry) => (
            <button
              key={entry.id}
              type="button"
              onClick={() => onSelectMenu(entry.id)}
              aria-pressed={activeMenu === entry.id}
              className={`flex h-8 flex-1 cursor-pointer items-center justify-center gap-1.5 rounded-md text-xs transition ${
                activeMenu === entry.id
                  ? 'bg-[#202026] font-semibold text-violet-300'
                  : 'text-zinc-400 hover:bg-[#1a1a1f] hover:text-zinc-200'
              }`}
              title={t(NAV_TITLE_KEYS[entry.id])}
            >
              <MonochromeIcon name={entry.icon} className="h-4 w-4" />
              <span>{t(NAV_TITLE_KEYS[entry.id])}</span>
            </button>
          ))}
        </nav>

        <div className="min-h-0 flex-1 overflow-hidden">
          <SidebarPanelBody
            activeMenu={activeMenu}
            onCloseMobile={onClose}
            onOpenVaultModal={onOpenVaultModal}
            {...body}
          />
        </div>

        {/* Bottom management destinations, reachable from any panel. */}
        <div className="flex shrink-0 items-center gap-1 border-t border-[#24242a] p-1.5">
          <DrawerFooterButton icon="vault" label={t('ribbon.vaultModal')} onClick={onOpenVaultModal} />
          <DrawerFooterButton icon="settings" label={t('ribbon.settings')} onClick={onOpenSettingsModal} />
        </div>
      </aside>
    </>
  );
}

function DrawerFooterButton({
  icon,
  label,
  onClick,
}: {
  icon: IconName;
  label: string;
  onClick: () => void;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      className="flex flex-1 cursor-pointer items-center justify-center gap-1.5 rounded-md px-2 py-1.5 text-xs text-zinc-400 transition hover:bg-[#1a1a1f] hover:text-zinc-200"
      title={label}
    >
      <MonochromeIcon name={icon} className="h-4 w-4" />
      <span className="truncate">{label}</span>
    </button>
  );
}