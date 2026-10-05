import { useCallback, useState } from 'react';
import type { PanelSlot, PanelWindowConfig } from '../core/domain/panel-layout.dto';

/**
 * Default workspace layout.
 *
 * Titles are resource ids, so the explorer and editor labels are localized
 * without this hook knowing anything about language.
 */
export const DEFAULT_PANELS: PanelWindowConfig[] = [
  {
    id: 'panel-explorer',
    type: 'explorer',
    slot: 'left',
    titleKey: 'panel.explorerTitle',
    isClosable: true,
  },
  {
    id: 'panel-editor',
    type: 'editor',
    slot: 'center',
    titleKey: 'panel.editorTitle',
    isClosable: false,
  },
];

const EXPLORER_TEMPLATE: PanelWindowConfig = DEFAULT_PANELS[0];
const PREVIEW_TEMPLATE: PanelWindowConfig = {
  id: 'panel-preview',
  type: 'preview',
  slot: 'right',
  titleKey: 'panel.previewTitle',
  fileId: null,
  isClosable: true,
};

export function movePanelHelper(
  panels: PanelWindowConfig[],
  panelId: string,
  targetSlot: PanelSlot,
): PanelWindowConfig[] {
  return panels.map((panel) =>
    panel.id === panelId ? { ...panel, slot: targetSlot } : panel,
  );
}

export function togglePanelHelper(
  panels: PanelWindowConfig[],
  template: PanelWindowConfig,
): PanelWindowConfig[] {
  const exists = panels.some((panel) => panel.id === template.id);
  if (exists) {
    return panels.filter((panel) => panel.id !== template.id);
  }
  return [...panels, template];
}

export function usePanelLayout(initialPanels: PanelWindowConfig[] = DEFAULT_PANELS) {
  const [panels, setPanels] = useState<PanelWindowConfig[]>(initialPanels);

  const movePanel = useCallback((panelId: string, targetSlot: PanelSlot) => {
    setPanels((prev) => movePanelHelper(prev, panelId, targetSlot));
  }, []);

  const closePanel = useCallback((panelId: string) => {
    setPanels((prev) => prev.filter((panel) => panel.id !== panelId || !panel.isClosable));
  }, []);

  const toggleExplorer = useCallback(() => {
    setPanels((prev) => togglePanelHelper(prev, EXPLORER_TEMPLATE));
  }, []);

  const toggleSplitPreview = useCallback((fileId?: string | null) => {
    setPanels((prev) => {
      if (prev.some((panel) => panel.id === PREVIEW_TEMPLATE.id)) {
        return prev.filter((panel) => panel.id !== PREVIEW_TEMPLATE.id);
      }
      return [...prev, { ...PREVIEW_TEMPLATE, fileId: fileId ?? null }];
    });
  }, []);

  const isExplorerOpen = panels.some((panel) => panel.id === EXPLORER_TEMPLATE.id);
  const isSplitPreviewOpen = panels.some((panel) => panel.id === PREVIEW_TEMPLATE.id);

  const getPanelsInSlot = useCallback(
    (slot: PanelSlot) => panels.filter((panel) => panel.slot === slot),
    [panels],
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