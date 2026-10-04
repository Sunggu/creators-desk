import type { PanelSlot, PanelWindowConfig } from '../../core/domain/panel-layout.dto';

interface PanelWindowHeaderProps {
  panel: PanelWindowConfig;
  onMoveLeft?: () => void;
  onMoveRight?: () => void;
  onToggleSplit?: () => void;
  onClose?: () => void;
}

export default function PanelWindowHeader({
  panel,
  onMoveLeft,
  onMoveRight,
  onToggleSplit,
  onClose,
}: PanelWindowHeaderProps) {
  const slotLabel: Record<PanelSlot, string> = {
    left: '좌측',
    center: '중앙',
    right: '우측',
  };

  return (
    <div className="flex h-8 items-center justify-between border-b border-[#26262e] bg-[#141417] px-3 select-none text-zinc-400">
      <div className="flex items-center space-x-2">
        <span className="text-xs font-semibold text-zinc-200">{panel.title}</span>
        <span className="rounded bg-zinc-800/80 px-1.5 py-0.2 text-[10px] text-zinc-400 font-mono">
          {slotLabel[panel.slot]}
        </span>
      </div>

      <div className="flex items-center space-x-1">
        {panel.slot !== 'left' && onMoveLeft && (
          <button
            onClick={onMoveLeft}
            className="flex h-6 w-6 items-center justify-center rounded hover:bg-[#222228] hover:text-zinc-200 transition cursor-pointer"
            title="좌측 슬롯으로 이동"
          >
            <svg className="h-3.5 w-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
            </svg>
          </button>
        )}

        {panel.slot !== 'right' && onMoveRight && (
          <button
            onClick={onMoveRight}
            className="flex h-6 w-6 items-center justify-center rounded hover:bg-[#222228] hover:text-zinc-200 transition cursor-pointer"
            title="우측 슬롯으로 이동"
          >
            <svg className="h-3.5 w-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
            </svg>
          </button>
        )}

        {onToggleSplit && (
          <button
            onClick={onToggleSplit}
            className="flex h-6 w-6 items-center justify-center rounded hover:bg-[#222228] hover:text-violet-400 transition cursor-pointer"
            title="분할 뷰어 토글 (나란히 보기)"
          >
            <svg className="h-3.5 w-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 4H5a1 1 0 00-1 1v14a1 1 0 001 1h4V4zm2 0v16h8a1 1 0 001-1V5a1 1 0 00-1-1h-8z" />
            </svg>
          </button>
        )}

        {panel.isClosable && onClose && (
          <button
            onClick={onClose}
            className="flex h-6 w-6 items-center justify-center rounded hover:bg-rose-500/20 hover:text-rose-300 transition cursor-pointer"
            title="창 닫기"
          >
            <svg className="h-3 w-3" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        )}
      </div>
    </div>
  );
}
