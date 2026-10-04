import type { EditorStats } from '../../hooks/use-codemirror';
import { NOTICE_PAGE_URL } from '../../core/project-license';

interface ObsidianStatusBarProps {
  stats: EditorStats;
  isSaving: boolean;
}

export default function ObsidianStatusBar({
  stats,
  isSaving,
}: ObsidianStatusBarProps) {
  return (
    <footer className="flex h-6 w-full items-center justify-between border-t border-[#26262e] bg-[#121215] px-3 text-[11px] text-zinc-500 select-none overflow-hidden">
      {/* Left side */}
      <div className="flex items-center space-x-3">
        <span className="hidden sm:inline">0개의 백링크</span>
        <a
          href={NOTICE_PAGE_URL}
          target="_blank"
          rel="noreferrer noopener"
          title="본 제품에 포함된 오픈소스 소프트웨어의 저작권 및 라이선스 정보"
          className="rounded px-1 py-0.5 transition hover:bg-[#1e1e24] hover:text-zinc-300"
        >
          오픈소스 고지
        </a>
      </div>

      {/* Right side */}
      <div className="flex items-center space-x-3 sm:space-x-4">
        {isSaving ? (
          <span className="flex items-center space-x-1.5 text-amber-400">
            <span className="h-1.5 w-1.5 rounded-full bg-amber-400 animate-pulse" />
            <span className="hidden xs:inline">저장 중...</span>
          </span>
        ) : (
          <span className="flex items-center space-x-1.5 text-zinc-500">
            <span className="h-1.5 w-1.5 rounded-full bg-emerald-500/80" />
            <span className="hidden xs:inline">저장됨</span>
          </span>
        )}

        <span>{stats.words} 단어</span>
        <span className="hidden sm:inline">{stats.chars} 자</span>
        <span className="hidden md:inline">
          Ln {stats.cursorLine}, Col {stats.cursorCol}
        </span>
        <span className="hidden sm:inline-block rounded bg-[#1e1e24] px-1.5 py-0.5 text-[10px] text-zinc-400 font-medium">
          Live Preview
        </span>
      </div>
    </footer>
  );
}
