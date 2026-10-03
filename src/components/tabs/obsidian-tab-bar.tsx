import type { FileNodeDto } from '../../core/domain/file-node.dto';

interface ObsidianTabBarProps {
  activeFile: FileNodeDto | null;
  onNewNote: () => void;
  onCloseNote: () => void;
}

export default function ObsidianTabBar({
  activeFile,
  onNewNote,
  onCloseNote,
}: ObsidianTabBarProps) {
  const cleanTitle = activeFile ? activeFile.name.replace(/\.md$/i, '') : '';

  return (
    <div className="hidden md:flex h-9 w-full items-center justify-between border-b border-[#26262e] bg-[#141417] px-2 select-none">
      <div className="flex items-center space-x-1 overflow-x-auto">
        {activeFile ? (
          <div className="group relative flex h-7 items-center space-x-2 rounded-t-md border-t-2 border-violet-500 bg-[#1e1e22] px-3 text-xs font-medium text-zinc-100 shadow-xs">
            <span className="truncate max-w-48">{cleanTitle}</span>
            <button
              onClick={(e) => {
                e.stopPropagation();
                onCloseNote();
              }}
              className="rounded p-0.5 text-zinc-400 opacity-60 hover:bg-[#2b2b32] hover:opacity-100 hover:text-zinc-100"
              title="탭 닫기"
            >
              <svg className="h-3 w-3" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </div>
        ) : null}

        <button
          onClick={onNewNote}
          className="flex h-7 w-7 items-center justify-center rounded-md text-zinc-400 hover:bg-[#222228] hover:text-zinc-200 transition"
          title="새 탭 / 새 노트"
        >
          <svg className="h-3.5 w-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
          </svg>
        </button>
      </div>

      <div className="flex items-center space-x-2 text-[11px] text-zinc-500 pr-2">
        <span>Markdown</span>
      </div>
    </div>
  );
}
