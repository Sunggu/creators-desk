import type { SplitDirection } from '../../core/domain/editor-grid.dto';

interface GridSplitterProps {
  direction: SplitDirection;
  onMouseDown: (e: React.MouseEvent) => void;
  isResizing?: boolean;
}

export default function GridSplitter({ direction, onMouseDown, isResizing }: GridSplitterProps) {
  const isHorizontal = direction === 'horizontal';

  return (
    <div
      onMouseDown={onMouseDown}
      className={`relative z-20 shrink-0 select-none transition-colors ${
        isHorizontal
          ? 'w-1 h-full cursor-col-resize hover:bg-violet-500/60 bg-[#26262e]'
          : 'h-1 w-full cursor-row-resize hover:bg-violet-500/60 bg-[#26262e]'
      } ${isResizing ? 'bg-violet-500' : ''}`}
      title={isHorizontal ? '좌우 창 크기 조절' : '상하 창 크기 조절'}
    >
      {/* Invisible Expanded Hitbox for smoother mouse grabbing */}
      <div
        className={`absolute inset-0 ${
          isHorizontal ? '-left-1 -right-1' : '-top-1 -bottom-1'
        }`}
      />
    </div>
  );
}
