import type { FileNodeDto } from '../../core/domain/file-node.dto';
import { useResizable } from '../../hooks/use-resizable';
import OutlinePanel from './outline-panel';
import { useTranslate } from '../../i18n/use-i18n';

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
      style={{ width: `${width}px` }}
      className="relative flex h-full shrink-0 flex-col border-l border-[#26262e] bg-[#18181b] select-none text-zinc-300 transition-none"
    >
      {/* Left Drag Resize Handle (for right-anchored panel) */}
      <div
        onMouseDown={startResize}
        className={`absolute left-0 top-0 bottom-0 w-1 cursor-col-resize hover:bg-violet-500/60 transition z-10 ${
          isResizing ? 'bg-violet-500 w-1.5' : ''
        }`}
        title={t('sidebar.outlineResize')}
      />

      {/* Panel Header */}
      <div className="flex h-9 items-center justify-between border-b border-[#24242a] px-3.5">
        <div className="flex items-center space-x-2">
          <svg className="h-3.5 w-3.5 text-violet-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h10M4 18h14" />
          </svg>
          <span className="text-xs font-bold tracking-tight text-zinc-200">
            {t('sidebar.outlineTitle')}
          </span>
        </div>
        <button
          onClick={onClose}
          className="rounded p-1 text-zinc-400 hover:bg-[#26262e] hover:text-zinc-100 transition cursor-pointer"
          title={t('sidebar.outlineClose')}
        >
          <svg className="h-3.5 w-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
          </svg>
        </button>
      </div>

      {/* Outline Panel Body */}
      <div className="flex-1 overflow-hidden">
        <OutlinePanel activeFile={activeFile} />
      </div>
    </div>
  );
}
