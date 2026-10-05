import { useState } from 'react';
import type { SplitDirection } from '../../core/domain/editor-grid.dto';
import { TAB_DRAG_MIME } from '../../core/domain/tab-drag.dto';

interface EditorDropZoneProps {
  onSplitDrop: (fileId: string, direction: SplitDirection) => void;
}

export default function EditorDropZone({ onSplitDrop }: EditorDropZoneProps) {
  const [activeZone, setActiveZone] = useState<'right' | 'bottom' | null>(null);

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    const rect = e.currentTarget.getBoundingClientRect();
    const xRatio = (e.clientX - rect.left) / rect.width;
    const yRatio = (e.clientY - rect.top) / rect.height;

    if (xRatio > 0.65) {
      setActiveZone('right');
    } else if (yRatio > 0.65) {
      setActiveZone('bottom');
    } else {
      setActiveZone(null);
    }
  };

  const handleDragLeave = () => {
    setActiveZone(null);
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    const fileId = e.dataTransfer.getData('text/plain') || e.dataTransfer.getData(TAB_DRAG_MIME);
    if (fileId && activeZone) {
      onSplitDrop(fileId, activeZone === 'right' ? 'horizontal' : 'vertical');
    }
    setActiveZone(null);
  };

  return (
    <div
      onDragOver={handleDragOver}
      onDragLeave={handleDragLeave}
      onDrop={handleDrop}
      className="absolute inset-0 pointer-events-auto"
    >
      {activeZone === 'right' && (
        <div className="absolute right-0 top-0 bottom-0 w-1/2 bg-violet-600/25 border-2 border-dashed border-violet-400 z-30 flex items-center justify-center text-xs font-semibold text-violet-200 pointer-events-none animate-in fade-in duration-100">
          우측으로 창 분할
        </div>
      )}
      {activeZone === 'bottom' && (
        <div className="absolute left-0 right-0 bottom-0 h-1/2 bg-violet-600/25 border-2 border-dashed border-violet-400 z-30 flex items-center justify-center text-xs font-semibold text-violet-200 pointer-events-none animate-in fade-in duration-100">
          하단으로 창 분할
        </div>
      )}
    </div>
  );
}
