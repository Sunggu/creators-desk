interface FileExplorerToolbarProps {
  onNewFile: () => void;
  onNewFolder: () => void;
  onRefresh: () => void;
}

export default function FileExplorerToolbar({
  onNewFile,
  onNewFolder,
  onRefresh,
}: FileExplorerToolbarProps) {
  return (
    <div className="flex items-center justify-between border-b border-zinc-800/80 px-3 py-2 text-zinc-400">
      <span className="text-[11px] font-semibold tracking-wider text-zinc-400 uppercase">
        Files
      </span>

      <div className="flex items-center space-x-1">
        <button
          onClick={onNewFile}
          className="rounded p-1 hover:bg-zinc-800 hover:text-zinc-200 transition"
          title="새 노트 만들기"
        >
          <svg className="h-3.5 w-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 13h6m-3-3v6m5 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
          </svg>
        </button>

        <button
          onClick={onNewFolder}
          className="rounded p-1 hover:bg-zinc-800 hover:text-zinc-200 transition"
          title="새 폴더 만들기"
        >
          <svg className="h-3.5 w-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 13h6m-3-3v6m-9 1V7a2 2 0 012-2h6l2 2h6a2 2 0 012 2v8a2 2 0 01-2 2H5a2 2 0 01-2-2z" />
          </svg>
        </button>

        <button
          onClick={onRefresh}
          className="rounded p-1 hover:bg-zinc-800 hover:text-zinc-200 transition"
          title="새로고침"
        >
          <svg className="h-3.5 w-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
          </svg>
        </button>
      </div>
    </div>
  );
}
