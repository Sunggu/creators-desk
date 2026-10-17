import type { SidebarMenuId } from '../../core/domain/sidebar-panel.dto';
import { useResizable } from '../../hooks/use-resizable';
import { useTranslate } from '../../i18n/use-i18n';
import SidebarPanelBody, { type SidebarPanelBodyProps } from './sidebar-panel-body';

interface SidebarPanelContainerProps extends Omit<SidebarPanelBodyProps, 'activeMenu'> {
  activeMenu: SidebarMenuId | null;
}

/**
 * Desktop chrome for the primary sidebar: resizable width and drag handle.
 *
 * Layout only. Sizing lives here; header and content live in individual panels,
 * which the mobile drawer reuses unchanged.
 */
export default function SidebarPanelContainer({
  activeMenu,
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