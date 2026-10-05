import type { EditorStats } from '../../hooks/use-codemirror';
import { NOTICE_PAGE_URL } from '../../core/project-license';
import { useNowEpoch } from '../../hooks/use-now-epoch';
import { useI18n } from '../../i18n/use-i18n';

interface ObsidianStatusBarProps {
  stats: EditorStats;
  isSaving: boolean;
}

export default function ObsidianStatusBar({
  stats,
  isSaving,
}: ObsidianStatusBarProps) {
  const { t, formatTime, formatNumber, resolvedTimeZone, isSystemTimeZone } = useI18n();
  const now = useNowEpoch();

  const zoneLabel = isSystemTimeZone ? t('statusbar.zoneFollowsSystem') : resolvedTimeZone;

  return (
    <footer className="flex h-6 w-full items-center justify-between border-t border-[#26262e] bg-[#121215] px-3 text-[11px] text-zinc-500 select-none overflow-hidden">
      {/* Left side */}
      <div className="flex items-center space-x-3">
        <span className="hidden sm:inline">{t('statusbar.backlinks', { count: 0 })}</span>
        <a
          href={NOTICE_PAGE_URL}
          target="_blank"
          rel="noreferrer noopener"
          title={t('statusbar.openSourceNoticeTitle')}
          className="rounded px-1 py-0.5 transition hover:bg-[#1e1e24] hover:text-zinc-300"
        >
          {t('statusbar.openSourceNotice')}
        </a>
      </div>

      {/* Right side */}
      <div className="flex items-center space-x-3 sm:space-x-4">
        {isSaving ? (
          <span className="flex items-center space-x-1.5 text-amber-400">
            <span className="h-1.5 w-1.5 rounded-full bg-amber-400 animate-pulse" />
            <span className="hidden xs:inline">{t('statusbar.saving')}</span>
          </span>
        ) : (
          <span className="flex items-center space-x-1.5 text-zinc-500">
            <span className="h-1.5 w-1.5 rounded-full bg-emerald-500/80" />
            <span className="hidden xs:inline">{t('statusbar.saved')}</span>
          </span>
        )}

        <span>{t('statusbar.words', { count: stats.words })}</span>
        <span className="hidden sm:inline">{t('statusbar.characters', { count: stats.chars })}</span>
        <span className="hidden md:inline">
          {t('statusbar.cursorPosition', {
            line: formatNumber(stats.cursorLine),
            column: formatNumber(stats.cursorCol),
          })}
        </span>
        <span
          className="hidden sm:inline tabular-nums"
          title={zoneLabel}
        >
          {t('statusbar.clock', { time: formatTime(now), zone: zoneLabel })}
        </span>

        <span className="hidden sm:inline-block rounded bg-[#1e1e24] px-1.5 py-0.5 text-[10px] text-zinc-400 font-medium">
          {t('statusbar.livePreview')}
        </span>
      </div>
    </footer>
  );
}
