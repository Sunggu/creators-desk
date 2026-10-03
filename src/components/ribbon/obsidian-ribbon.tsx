interface ObsidianRibbonProps {
  isSidebarOpen: boolean;
  onToggleSidebar: () => void;
  onOpenVaultModal: () => void;
}

export default function ObsidianRibbon({
  isSidebarOpen,
  onToggleSidebar,
  onOpenVaultModal,
}: ObsidianRibbonProps) {
  return (
    <aside className="hidden md:flex h-full w-11 shrink-0 flex-col items-center justify-between border-r border-[#26262e] bg-[#121215] py-2.5 text-zinc-400 select-none">
      {/* Top Icons */}
      <div className="flex flex-col items-center space-y-2">
        <button
          onClick={onToggleSidebar}
          className={`flex h-8 w-8 items-center justify-center rounded-md transition ${
            isSidebarOpen
              ? 'bg-[#202026] text-violet-400'
              : 'hover:bg-[#1a1a1f] hover:text-zinc-200'
          }`}
          title="파일 탐색기 (사이드바 토글)"
        >
          <svg className="h-4.5 w-4.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.75} d="M3 7v10a2 2 0 002 2h14a2 2 0 002-2V9a2 2 0 00-2-2h-6l-2-2H5a2 2 0 00-2 2z" />
          </svg>
        </button>

        <button
          onClick={() => alert('검색 기능은 향후 업데이트될 예정입니다.')}
          className="flex h-8 w-8 items-center justify-center rounded-md hover:bg-[#1a1a1f] hover:text-zinc-200 transition"
          title="검색"
        >
          <svg className="h-4.5 w-4.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.75} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
          </svg>
        </button>
      </div>

      {/* Bottom Icons */}
      <div className="flex flex-col items-center space-y-2">
        <button
          onClick={onOpenVaultModal}
          className="flex h-8 w-8 items-center justify-center rounded-md text-zinc-400 hover:bg-[#1a1a1f] hover:text-violet-300 transition"
          title="다른 Vault 열기 / 관리"
        >
          <svg className="h-4.5 w-4.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.75} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
          </svg>
        </button>

        <button
          onClick={() => alert('Creators Desk (Obsidian Web v0.1)')}
          className="flex h-8 w-8 items-center justify-center rounded-md text-zinc-400 hover:bg-[#1a1a1f] hover:text-zinc-200 transition"
          title="설정"
        >
          <svg className="h-4.5 w-4.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.75} d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z" />
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.75} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
          </svg>
        </button>
      </div>
    </aside>
  );
}
