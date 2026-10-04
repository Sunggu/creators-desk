import type { FileNodeDto } from '../../core/domain/file-node.dto';

interface ObsidianTabBarProps {
  activeFile: FileNodeDto | null;
  viewMode?: 'edit' | 'preview';
  onToggleViewMode?: () => void;
  onNewNote: () => void;
  onCloseNote: () => void;
}

export default function ObsidianTabBar({
  activeFile,
  viewMode = 'edit',
  onToggleViewMode,
  onNewNote,
  onCloseNote,
}: ObsidianTabBarProps) {
  const cleanTitle = activeFile ? activeFile.name.replace(/\.md$/i, '') : '';

  return (
    <div className="hidden md:flex h-9 w-full items-end justify-between border-b border-[#26262e] bg-[#141417] px-3 select-none">
      <div className="flex items-end space-x-1 overflow-x-auto">
        {activeFile ? (
          <div
            className="group relative -mb-[1px] flex h-8 items-center space-x-2 rounded-t-md border-t-2 border-violet-500 border-x border-x-[#26262e] border-b border-b-[#1e1e22] bg-[#1e1e22] px-3.5 text-xs font-semibold text-zinc-100 shadow-sm transition-colors cursor-pointer"
            title={cleanTitle}
          >
            <span className="h-1.5 w-1.5 rounded-full bg-violet-400 shrink-0" />
            <span className="truncate max-w-48 text-zinc-100">{cleanTitle}</span>
            <button
              onClick={(e) => {
                e.stopPropagation();
                onCloseNote();
              }}
              className="rounded p-0.5 text-zinc-400 opacity-60 hover:bg-[#2b2b32] hover:opacity-100 hover:text-zinc-100 transition"
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
          className="mb-1 flex h-7 w-7 items-center justify-center rounded-md text-zinc-400 hover:bg-[#222228] hover:text-zinc-200 transition"
          title="새 탭 / 새 노트"
        >
          <svg className="h-3.5 w-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
          </svg>
        </button>
      </div>

      {activeFile ? (
        <div className="mb-1.5 flex items-center space-x-1.5 pr-1">
          <button
            onClick={onToggleViewMode}
            className={`flex items-center space-x-1 rounded px-2 py-0.5 text-xs transition cursor-pointer ${
              viewMode === 'preview'
                ? 'bg-violet-950/80 text-violet-300 border border-violet-700/50'
                : 'text-zinc-400 hover:bg-[#202026] hover:text-zinc-200'
            }`}
            title={viewMode === 'preview' ? '클릭하여 편집 모드로 전환' : '클릭하여 읽기 모드로 전환'}
          >
            {viewMode === 'preview' ? (
              <>
                <span className="text-violet-400">📖</span>
                <span className="font-semibold text-violet-300 text-[11px]">읽기 뷰</span>
              </>
            ) : (
              <>
                <span className="text-zinc-400">✏️</span>
                <span className="text-zinc-400 text-[11px]">편집 뷰</span>
              </>
            )}
          </button>
        </div>
      ) : null}
    </div>
  );
}
