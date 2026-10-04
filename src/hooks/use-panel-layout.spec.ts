import { describe, expect, it } from 'vitest';
import type { PanelWindowConfig } from '../core/domain/panel-layout.dto';
import { movePanelHelper, togglePanelHelper } from './use-panel-layout';

describe('usePanelLayout pure helpers', () => {
  const initialPanels: PanelWindowConfig[] = [
    { id: 'panel-explorer', type: 'explorer', slot: 'left', title: '파일 탐색기', isClosable: true },
    { id: 'panel-editor', type: 'editor', slot: 'center', title: '편집기', isClosable: false },
  ];

  it('moves panel to target slot without affecting other panels', () => {
    const moved = movePanelHelper(initialPanels, 'panel-explorer', 'right');
    expect(moved.find((p) => p.id === 'panel-explorer')?.slot).toBe('right');
    expect(moved.find((p) => p.id === 'panel-editor')?.slot).toBe('center');
  });

  it('moves editor to left slot', () => {
    const moved = movePanelHelper(initialPanels, 'panel-editor', 'left');
    expect(moved.find((p) => p.id === 'panel-editor')?.slot).toBe('left');
  });

  it('toggles panel on and off', () => {
    const previewPanel: PanelWindowConfig = {
      id: 'panel-preview',
      type: 'preview',
      slot: 'right',
      title: '읽기 뷰어',
      isClosable: true,
    };

    // Toggle ON
    const opened = togglePanelHelper(initialPanels, previewPanel);
    expect(opened).toHaveLength(3);
    expect(opened.some((p) => p.id === 'panel-preview')).toBe(true);

    // Toggle OFF
    const closed = togglePanelHelper(opened, previewPanel);
    expect(closed).toHaveLength(2);
    expect(closed.some((p) => p.id === 'panel-preview')).toBe(false);
  });
});
