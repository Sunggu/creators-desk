import { useTranslate } from '../../i18n/use-i18n';
import MonochromeIcon from '../../ui/icon/monochrome-icon';

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
          <MonochromeIcon name="splitRight" className={ICON_CLASS} />
        </button>
      )}

      {onSplitVertical && (
        <button onClick={() => onSplitVertical()} className={BUTTON_CLASS} title={t('tab.splitDown')}>
          <MonochromeIcon name="splitDown" className={ICON_CLASS} />
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
          <MonochromeIcon name={viewMode === 'preview' ? 'bookOpen' : 'pencil'} className={ICON_CLASS} />
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
          <MonochromeIcon name="outline" className={ICON_CLASS} />
        </button>
      )}

      {canCloseGroup && onCloseGroup && (
        <button
          onClick={onCloseGroup}
          className="flex h-6 w-6 items-center justify-center rounded text-zinc-400 hover:bg-rose-500/20 hover:text-rose-300 transition cursor-pointer"
          title={t('tab.closeSplitGroup')}
        >
          <MonochromeIcon name="close" className={ICON_CLASS} />
        </button>
      )}
    </div>
  );
}
