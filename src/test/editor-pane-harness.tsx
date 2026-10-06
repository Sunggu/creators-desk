import { render, waitFor } from '@testing-library/react';
import { expect } from 'vitest';
import type { FileNodeDto } from '../core/domain/file-node.dto';
import I18nProvider from '../i18n/i18n-provider';
import EditorGroupView from '../components/editor/editor-group-view';
import type { EditorGroupViewProps } from '../components/editor/editor-group-view';
import ObsidianEditor from '../components/editor/obsidian-editor';
import type { ObsidianEditorProps } from '../components/editor/obsidian-editor';

export const PANE_RECT = { left: 0, top: 0, width: 1000, height: 400 };

export const TEST_FILE: FileNodeDto = {
  id: 'file-1',
  vaultId: 'vault-1',
  parentId: null,
  name: 'Notes.md',
  type: 'file',
  content: '',
  createdAt: 0,
  updatedAt: 0,
};

export const TEST_GROUP = { id: 'group-1', fileIds: [TEST_FILE.id], activeFileId: TEST_FILE.id };

const PANE_DEFAULTS = {
  group: TEST_GROUP,
  nodes: [TEST_FILE],
  viewMode: 'edit',
  canCloseGroup: false,
  onToggleViewMode: () => {},
  onSelectTab: () => {},
  onCloseTab: () => {},
  onNewNote: () => {},
  onSplit: () => {},
  onCloseGroup: () => {},
  onSavingChange: () => {},
  onStatsChange: () => {},
  onRenameFile: () => Promise.resolve(),
  onSwitchToEdit: () => {},
} satisfies EditorGroupViewProps;

/** Renders a pane with inert defaults; override any prop per test. */
export function renderEditorPane(overrides: Partial<EditorGroupViewProps> = {}) {
  return render(
    <I18nProvider>
      <EditorGroupView {...PANE_DEFAULTS} {...overrides} />
    </I18nProvider>,
  );
}

/** Resolves the pane element and pins its geometry for drag coordinates. */
export async function mountEditorPane(overrides: Partial<EditorGroupViewProps> = {}) {
  const utils = renderEditorPane(overrides);
  const pane = utils.container.querySelector('[data-editor-pane]') as HTMLElement;
  pane.getBoundingClientRect = () =>
    ({
      ...PANE_RECT,
      right: PANE_RECT.width,
      bottom: PANE_RECT.height,
      x: 0,
      y: 0,
      toJSON: () => PANE_RECT,
    }) as DOMRect;

  await waitFor(() => expect(document.querySelector('.cm-content')).not.toBeNull());
  return { ...utils, pane };
}

export const codeMirrorContent = () => document.querySelector('.cm-content') as HTMLElement;

export const titleInput = (container: HTMLElement) =>
  container.querySelector('input[type="text"]') as HTMLInputElement;

const EDITOR_DEFAULTS = {
  activeFile: TEST_FILE,
  viewMode: 'edit',
  onSwitchToEdit: () => {},
  onSavingChange: () => {},
  onStatsChange: () => {},
  onNewNote: () => {},
} satisfies ObsidianEditorProps;

/** Renders a single `ObsidianEditor` surface, bypassing the pane chrome. */
export function renderEditor(overrides: Partial<ObsidianEditorProps> = {}) {
  return render(
    <I18nProvider>
      <ObsidianEditor {...EDITOR_DEFAULTS} {...overrides} />
    </I18nProvider>,
  );
}