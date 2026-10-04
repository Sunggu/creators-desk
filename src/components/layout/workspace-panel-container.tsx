import React from 'react';
import type { PanelSlot, PanelWindowConfig } from '../../core/domain/panel-layout.dto';
import PanelWindowHeader from './panel-window-header';

interface WorkspacePanelContainerProps {
  panels: PanelWindowConfig[];
  onMovePanel: (id: string, targetSlot: PanelSlot) => void;
  onClosePanel: (id: string) => void;
  onToggleSplitPreview: () => void;
  renderPanelContent: (panel: PanelWindowConfig) => React.ReactNode;
}

export default function WorkspacePanelContainer({
  panels,
  onMovePanel,
  onClosePanel,
  onToggleSplitPreview,
  renderPanelContent,
}: WorkspacePanelContainerProps) {
  const slots: PanelSlot[] = ['left', 'center', 'right'];

  const getTargetSlot = (current: PanelSlot, direction: 'left' | 'right'): PanelSlot => {
    if (direction === 'left') {
      return current === 'right' ? 'center' : 'left';
    }
    return current === 'left' ? 'center' : 'right';
  };

  return (
    <div className="flex h-full w-full overflow-hidden bg-[#1e1e22]">
      {slots.map((slot) => {
        const slotPanels = panels.filter((p) => p.slot === slot);
        if (slotPanels.length === 0) return null;

        const hasOnlyExplorer = slotPanels.every((p) => p.type === 'explorer');
        const widthClass = hasOnlyExplorer ? 'w-64 shrink-0' : 'flex-1 min-w-[320px]';

        return (
          <div
            key={slot}
            className={`flex flex-col h-full border-r border-[#26262e] last:border-r-0 overflow-hidden ${widthClass}`}
          >
            {slotPanels.map((panel) => (
              <div key={panel.id} className="flex flex-1 flex-col overflow-hidden">
                <PanelWindowHeader
                  panel={panel}
                  onMoveLeft={
                    panel.slot !== 'left'
                      ? () => onMovePanel(panel.id, getTargetSlot(panel.slot, 'left'))
                      : undefined
                  }
                  onMoveRight={
                    panel.slot !== 'right'
                      ? () => onMovePanel(panel.id, getTargetSlot(panel.slot, 'right'))
                      : undefined
                  }
                  onToggleSplit={panel.type === 'editor' ? onToggleSplitPreview : undefined}
                  onClose={panel.isClosable ? () => onClosePanel(panel.id) : undefined}
                />
                <div className="flex-1 overflow-hidden relative">
                  {renderPanelContent(panel)}
                </div>
              </div>
            ))}
          </div>
        );
      })}
    </div>
  );
}
