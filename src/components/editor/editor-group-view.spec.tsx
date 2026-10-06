import { EditorView } from '@codemirror/view';
import { waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { beforeEach, describe, expect, it, vi } from 'vitest';
import { codeMirrorContent, mountEditorPane, titleInput } from '../../test/editor-pane-harness';
import { dispatchDrag } from '../../test/dispatch-drag';
import type { DragInit } from '../../test/dispatch-drag';
import { findHitTestOverlays } from '../../test/hit-test-overlay';

const contentStore = new Map<string, string>();
const savedStore: { fileId: string; content: string }[] = [];

vi.mock('../../infrastructure/di', async (importOriginal) => {
  const actual = await importOriginal<typeof import('../../infrastructure/di')>();
  return {
    ...actual,
    fileContentUseCase: {
      getContent: vi.fn(async (fileId: string) => contentStore.get(fileId) ?? ''),
      saveContent: vi.fn(async (fileId: string, content: string) => {
        contentStore.set(fileId, content);
        savedStore.push({ fileId, content });
      }),
    },
  };
});

const editorDoc = () =>
  EditorView.findFromDOM(document.querySelector('.cm-editor') as HTMLElement)?.state.doc.toString();

const dragOver = (target: HTMLElement, init: DragInit) => dispatchDrag('dragover', target, init);

beforeEach(() => {
  contentStore.clear();
  savedStore.length = 0;
  contentStore.set('file-1', 'hello world');
});

describe('note editor interactivity', () => {
  it('mounts an editable CodeMirror surface for the active note', async () => {
    await mountEditorPane();

    expect(codeMirrorContent().getAttribute('contenteditable')).toBe('true');
    expect(editorDoc()).toBe('hello world');
  });

  it('accepts typed input', async () => {
    const user = userEvent.setup();
    await mountEditorPane();

    await user.click(codeMirrorContent());
    await user.keyboard('!!');

    await waitFor(() => expect(editorDoc()).toContain('!!'));
    expect(editorDoc()).toContain('hello world');
  });

  it('autosaves the edited document through the content use case', async () => {
    const user = userEvent.setup();
    await mountEditorPane();

    await user.click(codeMirrorContent());
    await user.keyboard('Z');

    await waitFor(() => expect(savedStore.at(-1)?.content).toContain('hello world'));
  });

  it('keeps the inline title input clickable and renameable', async () => {
    const user = userEvent.setup();
    const onRenameFile = vi.fn();
    const { container } = await mountEditorPane({ onRenameFile });

    const input = titleInput(container);
    await user.click(input);
    await user.clear(input);
    await user.type(input, 'Renamed{Enter}');

    await waitFor(() => expect(onRenameFile).toHaveBeenCalledWith('file-1', 'Renamed.md'));
  });
});

describe('pane overlay contract', () => {
  it('has nothing that can intercept clicks inside the editor pane', async () => {
    const { pane } = await mountEditorPane();
    expect(findHitTestOverlays(pane)).toEqual([]);
  });

  it('stays inert for a drag that is not a tab drag', async () => {
    const { pane } = await mountEditorPane();

    const event = dragOver(pane, { fileId: 'file-1', x: 900, y: 100, types: ['text/plain'] });

    expect(event.defaultPrevented).toBe(false);
    expect(findHitTestOverlays(pane)).toEqual([]);
    expect(pane.querySelector('[aria-hidden="true"]')).toBeNull();
  });
});