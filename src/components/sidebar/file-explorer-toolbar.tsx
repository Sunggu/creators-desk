interface FileExplorerToolbarProps {
  onNewFile: () => void;
  onNewFolder: () => void;
  onRefresh: () => void;
  onCloseMobile?: () => void;
  selectedCount?: number;
  onBulkDelete?: () => void;
  onClearSelection?: () => void;
}

export default function FileExplorerToolbar({
  onNewFile,
  onNewFolder,
  onRefresh,
  onCloseMobile,
  selectedCount = 0,
  onBulkDelete,
  onClearSelection,
}: FileExplorerToolbarProps) {
  return (
    <div className="shrink-0 border-b border-[#24242a]">
      {/* 1. Main Toolbar Header */}
      <div className="flex h-11 items-center justify-between px-3.5">
        <span className="text-[11px] font-bold tracking-wider text-zinc-400 uppercase">
          탐색기
        </span>
        <div className="flex items-center space-x-1.5">
          <button
            onClick={onNewFile}
            className="rounded p-1 hover:bg-[#25252c] hover:text-zinc-100 transition"
            title="새 노트 (+)"
          >
            <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
            </svg>
          </button>
          <button
            onClick={onNewFolder}
            className="rounded p-1 hover:bg-[#25252c] hover:text-zinc-100 transition"
            title="새 폴더"
          >
            <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 13h6m-3-3v6m-9 1V7a2 2 0 012-2h6l2 2h6a2 2 0 012 2v8a2 2 0 01-2 2H5a2 2 0 01-2-2z" />
            </svg>
          </button>
          <button
            onClick={onRefresh}
            className="rounded p-1 hover:bg-[#25252c] hover:text-zinc-100 transition"
            title="새로고침"
          >
            <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
            </svg>
          </button>
          {onCloseMobile && (
            <button
              onClick={onCloseMobile}
              className="md:hidden ml-1 rounded p-1 text-zinc-400 hover:text-zinc-100"
              title="닫기"
            >
              <svg className="h-4.5 w-4.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          )}
        </div>
      </div>

      {/* 2. Multi-selection Bar */}
      {selectedCount > 1 && (
        <div className="flex items-center justify-between bg-violet-950/70 border-t border-violet-800/40 px-3 py-1.5 text-xs text-violet-200 animate-in fade-in duration-100">
          <span className="font-medium">{selectedCount}개 선택됨</span>
          <div className="flex items-center space-x-2">
            <button
              onClick={onBulkDelete}
              className="rounded px-2 py-0.5 bg-rose-600/30 hover:bg-rose-600/50 text-rose-300 font-medium transition cursor-pointer"
              title="선택된 항목 일괄 삭제"
            >
              삭제
            </button>
            <button
              onClick={onClearSelection}
              className="text-zinc-400 hover:text-zinc-200 text-[11px] cursor-pointer"
            >
              취소
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
