import type { FileNodeDto } from '../../core/domain/file-node.dto';
import { useResizable } from '../../hooks/use-resizable';
import OutlinePanel from './outline-panel';
import { useTranslate } from '../../i18n/use-i18n';
import MonochromeIcon from '../../ui/icon/monochrome-icon';

interface RightSidebarPanelProps {
  isOpen: boolean;
  onClose: () => void;
  activeFile: FileNodeDto | null;
}

export default function RightSidebarPanel({
  isOpen,
  onClose,
  activeFile,
}: RightSidebarPanelProps) {
  const t = useTranslate();
  const { size: width, startResize, isResizing } = useResizable({
    initial: 260,
    min: 200,
    max: 480,
    direction: 'horizontal',
    reverse: true,
  });

  if (!isOpen) return null;

  return (
    <div
      /* Wide screens get a resizable docked column; narrow ones get a full-width
         overlay so the outline can never squeeze the editor on a phone. */
      style={{ width: `${width}px` }}
      className="relative flex h-full shrink-0 flex-col border-l border-[#26262e] bg-[#18181b] select-none text-zinc-300 transition-none max-md:absolute max-md:inset-y-0 max-md:right-0 max-md:w-full max-md:max-w-[85vw] max-md:border-l-0 max-md:shadow-2xl"
    >
      {/* Left Drag Resize Handle (docked layout only) */}
      <div
        onMouseDown={startResize}
        className={`absolute left-0 top-0 bottom-0 z-10 hidden w-1 cursor-col-resize transition hover:bg-violet-500/60 md:block ${
          isResizing ? 'w-1.5 bg-violet-500' : ''
        }`}
        title={t('sidebar.outlineResize')}
      />

      {/* Panel Header */}
      <div className="flex h-9 items-center justify-between border-b border-[#24242a] px-3.5">
        <div className="flex items-center space-x-2">
          <MonochromeIcon name="outline" className="h-3.5 w-3.5 text-violet-400" />
          <span className="text-xs font-bold tracking-tight text-zinc-200">
            {t('sidebar.outlineTitle')}
          </span>
        </div>
        <button
          onClick={onClose}
          className="rounded p-1 text-zinc-400 hover:bg-[#26262e] hover:text-zinc-100 transition cursor-pointer"
          title={t('sidebar.outlineClose')}
        >
          <MonochromeIcon name="close" className="h-3.5 w-3.5" />
        </button>
      </div>

      {/* Outline Panel Body */}
      <div className="flex-1 overflow-hidden">
        <OutlinePanel activeFile={activeFile} />
      </div>
    </div>
  );
}
