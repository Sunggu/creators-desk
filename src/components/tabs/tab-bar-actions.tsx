import { useTranslate } from '../../i18n/use-i18n';

interface TabBarActionsProps {
  activeFileId: string | null;
  viewMode: 'edit' | 'preview';
  canCloseGroup: boolean;
  isRightPanelOpen?: boolean;
  onSplitHorizontal?: () => void;
  onSplitVertical?: () => void;
  onToggleViewMode?: () => void;
  onToggleRightPanel?: () => void;
  onCloseGroup?: () => void;
}

const ICON_CLASS = 'h-3.5 w-3.5';
const BUTTON_CLASS =
  'flex h-6 w-6 items-center justify-center rounded text-zinc-400 hover:bg-[#202026] hover:text-violet-300 transition cursor-pointer';

export default function TabBarActions({
  activeFileId,
  viewMode,
  canCloseGroup,
  isRightPanelOpen,
  onSplitHorizontal,
  onSplitVertical,
  onToggleViewMode,
  onToggleRightPanel,
  onCloseGroup,
}: TabBarActionsProps) {
  const t = useTranslate();

  return (
    <div className="mb-1.5 flex items-center space-x-1 pr-2">
      {onSplitHorizontal && (
        <button onClick={() => onSplitHorizontal()} className={BUTTON_CLASS} title={t('tab.splitRight')}>
          <svg className={ICON_CLASS} fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.75} d="M9 4H5a1 1 0 00-1 1v14a1 1 0 001 1h4V4zm2 0v16h8a1 1 0 001-1V5a1 1 0 00-1-1h-8z" />
          </svg>
        </button>
      )}

      {onSplitVertical && (
        <button onClick={() => onSplitVertical()} className={BUTTON_CLASS} title={t('tab.splitDown')}>
          <svg className={ICON_CLASS} fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.75} d="M4 9V5a1 1 0 011-1h14a1 1 0 011 1v4H4zm0 2h16v8a1 1 0 01-1 1H5a1 1 0 01-1-1v-8z" />
          </svg>
        </button>
      )}

      {activeFileId && onToggleViewMode && (
        <button
          onClick={onToggleViewMode}
          className={`flex items-center justify-center h-6 w-6 rounded text-xs transition cursor-pointer ${
            viewMode === 'preview'
              ? 'bg-violet-950 text-violet-300 border border-violet-700/60'
              : 'text-zinc-400 hover:bg-[#202026] hover:text-zinc-200'
          }`}
          title={viewMode === 'preview' ? t('tab.switchToEditMode') : t('tab.switchToReadMode')}
        >
          <svg className={ICON_CLASS} fill="none" viewBox="0 0 24 24" stroke="currentColor">
            {viewMode === 'preview' ? (
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253" />
            ) : (
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15.232 5.232l3.536 3.536m-2.036-5.036a2.5 2.5 0 113.536 3.536L6.5 21.036H3v-3.572L16.732 3.732z" />
            )}
          </svg>
        </button>
      )}

      {onToggleRightPanel && (
        <button
          onClick={onToggleRightPanel}
          className={`flex items-center justify-center h-6 w-6 rounded text-xs transition cursor-pointer ${
            isRightPanelOpen
              ? 'bg-violet-950 text-violet-300 border border-violet-700/60'
              : 'text-zinc-400 hover:bg-[#202026] hover:text-zinc-200'
          }`}
          title={isRightPanelOpen ? t('tab.outlineClose') : t('tab.outlineOpen')}
        >
          <svg className={ICON_CLASS} fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.75} d="M4 6h16M4 12h10M4 18h14" />
          </svg>
        </button>
      )}

      {canCloseGroup && onCloseGroup && (
        <button
          onClick={onCloseGroup}
          className="flex h-6 w-6 items-center justify-center rounded text-zinc-400 hover:bg-rose-500/20 hover:text-rose-300 transition cursor-pointer"
          title={t('tab.closeSplitGroup')}
        >
          <svg className={ICON_CLASS} fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
          </svg>
        </button>
      )}
    </div>
  );
}
