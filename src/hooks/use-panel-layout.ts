import { useCallback, useState } from 'react';
import type { PanelSlot, PanelWindowConfig } from '../core/domain/panel-layout.dto';

const DEFAULT_PANELS: PanelWindowConfig[] = [
  { id: 'panel-explorer', type: 'explorer', slot: 'left', title: '파일 탐색기', isClosable: true },
  { id: 'panel-editor', type: 'editor', slot: 'center', title: '편집기', isClosable: false },
];

export function movePanelHelper(
  panels: PanelWindowConfig[],
  panelId: string,
  targetSlot: PanelSlot
): PanelWindowConfig[] {
  return panels.map((p) => (p.id === panelId ? { ...p, slot: targetSlot } : p));
}

export function togglePanelHelper(
  panels: PanelWindowConfig[],
  template: PanelWindowConfig
): PanelWindowConfig[] {
  const exists = panels.some((p) => p.id === template.id);
  if (exists) {
    return panels.filter((p) => p.id !== template.id);
  }
  return [...panels, template];
}

export function usePanelLayout(initialPanels: PanelWindowConfig[] = DEFAULT_PANELS) {
  const [panels, setPanels] = useState<PanelWindowConfig[]>(initialPanels);

  const movePanel = useCallback((panelId: string, targetSlot: PanelSlot) => {
    setPanels((prev) => movePanelHelper(prev, panelId, targetSlot));
  }, []);

  const closePanel = useCallback((panelId: string) => {
    setPanels((prev) => prev.filter((p) => p.id !== panelId || !p.isClosable));
  }, []);

  const toggleExplorer = useCallback(() => {
    setPanels((prev) =>
      togglePanelHelper(prev, {
        id: 'panel-explorer',
        type: 'explorer',
        slot: 'left',
        title: '파일 탐색기',
        isClosable: true,
      })
    );
  }, []);

  const toggleSplitPreview = useCallback((fileId?: string | null) => {
    setPanels((prev) => {
      const exists = prev.some((p) => p.id === 'panel-preview');
      if (exists) {
        return prev.filter((p) => p.id !== 'panel-preview');
      }
      return [
        ...prev,
        {
          id: 'panel-preview',
          type: 'preview',
          slot: 'right',
          title: '읽기 뷰어',
          fileId: fileId ?? null,
          isClosable: true,
        },
      ];
    });
  }, []);

  const isExplorerOpen = panels.some((p) => p.id === 'panel-explorer');
  const isSplitPreviewOpen = panels.some((p) => p.id === 'panel-preview');

  const getPanelsInSlot = useCallback(
    (slot: PanelSlot) => panels.filter((p) => p.slot === slot),
    [panels]
  );

  return {
    panels,
    isExplorerOpen,
    isSplitPreviewOpen,
    movePanel,
    closePanel,
    toggleExplorer,
    toggleSplitPreview,
    getPanelsInSlot,
  };
}
