import { act, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { beforeEach, describe, expect, it, vi } from 'vitest';
import { mountEditorPane, renderEditor, TEST_FILE } from '../../test/editor-pane-harness';
import type { DragInit } from '../../test/dispatch-drag';
import { dispatchDrag } from '../../test/dispatch-drag';
import { findHitTestOverlays } from '../../test/hit-test-overlay';

vi.mock('../../infrastructure/di', async (importOriginal) => {
  const actual = await importOriginal<typeof import('../../infrastructure/di')>();
  return {
    ...actual,
    fileContentUseCase: {
      getContent: vi.fn(async () => 'hello world'),
      saveContent: vi.fn(async () => {}),
    },
  };
});

/** `act` keeps the armed edge committed before the matching drop is fired. */
function fireDrag(type: 'dragover' | 'drop', target: HTMLElement, init: DragInit) {
  let dispatched!: Event;
  act(() => {
    dispatched = dispatchDrag(type, target, init);
  });
  return dispatched;
}

const dragOver = (target: HTMLElement, init: DragInit) => fireDrag('dragover', target, init);
const dropOn = (target: HTMLElement, init: DragInit) => fireDrag('drop', target, init);

beforeEach(() => {
  vi.clearAllMocks();
});

describe('split drop targeting', () => {
  it('arms a non-interactive overlay for a tab drag near the right edge', async () => {
    const { pane } = await mountEditorPane();

    dragOver(pane, { fileId: TEST_FILE.id, x: 900, y: 100 });

    const overlay = await waitFor(() => {
      const el = pane.querySelector('[aria-hidden="true"]') as HTMLElement | null;
      if (!el) throw new Error('split overlay not shown');
      return el;
    });
    expect(overlay).toHaveStyle({ pointerEvents: 'none' });
    expect(findHitTestOverlays(pane)).toEqual([]);
  });

  it('splits horizontally when dropped on the right edge', async () => {
    const onSplit = vi.fn();
    const { pane } = await mountEditorPane({ onSplit });

    dragOver(pane, { fileId: TEST_FILE.id, x: 900, y: 100 });
    dropOn(pane, { fileId: TEST_FILE.id, x: 900, y: 100 });

    await waitFor(() => expect(onSplit).toHaveBeenCalledWith(TEST_FILE.id, 'horizontal'));
  });

  it('splits vertically when dropped on the bottom edge', async () => {
    const onSplit = vi.fn();
    const { pane } = await mountEditorPane({ onSplit });

    dragOver(pane, { fileId: TEST_FILE.id, x: 400, y: 380 });
    dropOn(pane, { fileId: TEST_FILE.id, x: 400, y: 380 });

    await waitFor(() => expect(onSplit).toHaveBeenCalledWith(TEST_FILE.id, 'vertical'));
  });

  it('ignores a drop in the centre region', async () => {
    const onSplit = vi.fn();
    const { pane } = await mountEditorPane({ onSplit });

    dragOver(pane, { fileId: TEST_FILE.id, x: 400, y: 200 });
    dropOn(pane, { fileId: TEST_FILE.id, x: 400, y: 200 });

    expect(onSplit).not.toHaveBeenCalled();
    expect(pane.querySelector('[aria-hidden="true"]')).toBeNull();
  });
});

describe('reading preview', () => {
  it('returns to edit mode on double click', async () => {
    const user = userEvent.setup();
    const onSwitchToEdit = vi.fn();
    renderEditor({ viewMode: 'preview', onSwitchToEdit });

    await user.dblClick(await screen.findByText(/hello world/));

    expect(onSwitchToEdit).toHaveBeenCalled();
  });
});