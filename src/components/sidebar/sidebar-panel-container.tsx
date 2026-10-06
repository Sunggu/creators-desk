import type { SidebarMenuId } from '../../core/domain/sidebar-panel.dto';
import { useResizable } from '../../hooks/use-resizable';
import { useTranslate } from '../../i18n/use-i18n';
import MonochromeIcon from '../../ui/icon/monochrome-icon';
import SidebarPanelBody, { type SidebarPanelBodyProps } from './sidebar-panel-body';

/** Resource id of the header label for each swappable sidebar panel. */
const MENU_TITLE_KEYS: Record<SidebarMenuId, 'ribbon.menuExplorer' | 'ribbon.menuSearch'> = {
  explorer: 'ribbon.menuExplorer',
  search: 'ribbon.menuSearch',
};

interface SidebarPanelContainerProps extends Omit<SidebarPanelBodyProps, 'activeMenu'> {
  activeMenu: SidebarMenuId | null;
  onClose: () => void;
}

/**
 * Desktop chrome for the primary sidebar: resizable width, header, close button.
 *
 * Layout only. Sizing and menu routing live here; content lives in
 * `SidebarPanelBody`, which the mobile drawer reuses unchanged.
 */
export default function SidebarPanelContainer({
  activeMenu,
  onClose,
  ...body
}: SidebarPanelContainerProps) {
  const t = useTranslate();
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
      className="relative hidden h-full shrink-0 flex-col border-r border-[#26262e] bg-[#18181b] select-none text-zinc-300 transition-none md:flex"
    >
      <div className="flex h-9 items-center justify-between border-b border-[#24242a] px-3.5">
        <span className="text-xs font-bold tracking-tight text-zinc-200">
          {t(MENU_TITLE_KEYS[activeMenu])}
        </span>
        <button
          type="button"
          onClick={onClose}
          className="cursor-pointer rounded p-1 text-zinc-400 transition hover:bg-[#26262e] hover:text-zinc-100"
          title={t('sidebar.collapse')}
        >
          <MonochromeIcon name="close" className="h-3.5 w-3.5" />
        </button>
      </div>

      <div className="flex-1 overflow-hidden">
        <SidebarPanelBody activeMenu={activeMenu} {...body} />
      </div>

      {/* Right Drag Resize Handle */}
      <div
        onMouseDown={startResize}
        className={`absolute right-0 top-0 bottom-0 w-1 cursor-col-resize hover:bg-violet-500/60 transition ${
          isResizing ? 'bg-violet-500 w-1.5' : ''
        }`}
        title={t('sidebar.resize')}
      />
    </div>
  );
}