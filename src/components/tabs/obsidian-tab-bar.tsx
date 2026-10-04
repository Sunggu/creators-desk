import type { FileNodeDto } from '../../core/domain/file-node.dto';

interface ObsidianTabBarProps {
  openFiles: FileNodeDto[];
  activeFileId: string | null;
  viewMode?: 'edit' | 'preview';
  onToggleViewMode?: () => void;
  onSelectTab: (fileId: string) => void;
  onCloseTab: (fileId: string) => void;
  onNewNote: () => void;
}

export default function ObsidianTabBar({
  openFiles,
  activeFileId,
  viewMode = 'edit',
  onToggleViewMode,
  onSelectTab,
  onCloseTab,
  onNewNote,
}: ObsidianTabBarProps) {
  return (
    <div className="hidden md:flex h-9 w-full items-end justify-between border-b border-[#26262e] bg-[#141417] px-0 select-none relative">
      {/* Tab List (No Left Margin, Scrollbar Hidden, Attached to Editor) */}
      <div className="flex items-end overflow-x-auto [&::-webkit-scrollbar]:hidden [-ms-overflow-style:none] [scrollbar-width:none]">
        {openFiles.map((file) => {
          const isActive = file.id === activeFileId;
          const cleanTitle = file.name.replace(/\.md$/i, '');

          return (
            <div
              key={file.id}
              onClick={() => onSelectTab(file.id)}
              className={`group flex items-center space-x-2 text-xs font-medium transition-colors cursor-pointer select-none ${
                isActive
                  ? 'relative z-10 -mb-[1px] h-9 px-3.5 bg-[#1e1e22] text-zinc-100 border-t-2 border-violet-500 border-x border-[#26262e] border-b-0'
                  : 'h-8 mb-[1px] px-3 bg-transparent text-zinc-400 hover:bg-[#1a1a1e] hover:text-zinc-200 border-r border-[#222228]'
              }`}
              title={cleanTitle}
            >
              {isActive && <span className="h-1.5 w-1.5 rounded-full bg-violet-400 shrink-0" />}
              <span className="truncate max-w-44">{cleanTitle}</span>
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  onCloseTab(file.id);
                }}
                className="rounded p-0.5 text-zinc-400 opacity-60 hover:bg-[#2b2b32] hover:opacity-100 hover:text-zinc-100 transition"
                title="탭 닫기"
              >
                <svg className="h-3 w-3" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>
          );
        })}

        {/* Add Tab Button (+ 누르면 우측으로 편집 윈도우/탭이 늘어남) */}
        <button
          onClick={onNewNote}
          className="mb-1 ml-1 flex h-7 w-7 items-center justify-center rounded text-zinc-400 hover:bg-[#222228] hover:text-zinc-200 transition"
          title="새 탭 열기 (+)"
        >
          <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
          </svg>
        </button>
      </div>

      {/* Right Side: Mode Switcher (SVG Icons only, No Emojis, No '편집 뷰' Text) */}
      {activeFileId && onToggleViewMode && (
        <div className="mb-1.5 flex items-center pr-3">
          <button
            onClick={onToggleViewMode}
            className={`flex items-center justify-center h-6 w-6 rounded text-xs transition cursor-pointer ${
              viewMode === 'preview'
                ? 'bg-violet-950 text-violet-300 border border-violet-700/60'
                : 'text-zinc-400 hover:bg-[#202026] hover:text-zinc-200'
            }`}
            title={viewMode === 'preview' ? '편집 모드로 전환' : '읽기 모드로 전환'}
          >
            {viewMode === 'preview' ? (
              <svg className="h-3.5 w-3.5 text-violet-300" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253" />
              </svg>
            ) : (
              <svg className="h-3.5 w-3.5 text-zinc-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15.232 5.232l3.536 3.536m-2.036-5.036a2.5 2.5 0 113.536 3.536L6.5 21.036H3v-3.572L16.732 3.732z" />
              </svg>
            )}
          </button>
        </div>
      )}
    </div>
  );
}
