import { fireEvent, render, screen, within } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { describe, expect, it, vi } from 'vitest';
import type { FileNodeDto } from '../../core/domain/file-node.dto';
import type { VaultDto } from '../../core/domain/vault.dto';
import I18nProvider from '../../i18n/i18n-provider';
import ObsidianSidebar from './obsidian-sidebar';

const VAULT: VaultDto = {
  id: 'v1', key: 'demo', alias: 'Demo', name: 'Demo', createdAt: 0, updatedAt: 0,
};

const NODES: FileNodeDto[] = [
  { id: 'f-zebra', vaultId: 'v1', parentId: null, name: 'Zebra.md', type: 'file', content: '', createdAt: 0, updatedAt: 0 },
  { id: 'dir-alpha', vaultId: 'v1', parentId: null, name: 'AlphaFolder', type: 'folder', content: '', createdAt: 0, updatedAt: 0 },
  { id: 'f-apple', vaultId: 'v1', parentId: null, name: 'Apple.md', type: 'file', content: '', createdAt: 0, updatedAt: 0 },
  { id: 'f-child', vaultId: 'v1', parentId: 'dir-alpha', name: 'Child.md', type: 'file', content: '', createdAt: 0, updatedAt: 0 },
];

function renderSidebar(props: Partial<Parameters<typeof ObsidianSidebar>[0]> = {}) {
  const defaultProps = {
    vault: VAULT,
    vaults: [VAULT],
    nodes: NODES,
    activeFileId: null,
    onOpenVaultModal: vi.fn(),
    onSelectVault: vi.fn(),
    onSelectFile: vi.fn(),
    onCreateFile: vi.fn().mockResolvedValue(undefined),
    onCreateFolder: vi.fn().mockResolvedValue(undefined),
    onRenameNode: vi.fn().mockResolvedValue(undefined),
    onDeleteNode: vi.fn().mockResolvedValue(undefined),
    onDeleteNodes: vi.fn().mockResolvedValue(undefined),
    onMoveNode: vi.fn().mockResolvedValue(undefined),
    onRefresh: vi.fn(),
    ...props,
  };
  return render(
    <I18nProvider>
      <ObsidianSidebar {...defaultProps} />
    </I18nProvider>,
  );
}

describe('ObsidianSidebar', () => {
  it('renders single toolbar without duplicate headers or close X button', () => {
    const { container } = renderSidebar();
    const toolbar = container.querySelector('.h-9') as HTMLElement;
    expect(within(toolbar).getByText('탐색기')).toBeInTheDocument();
    expect(screen.queryByTitle('닫기')).toBeNull();
    expect(within(toolbar).getByTitle('선택 모드')).toBeInTheDocument();
    expect(within(toolbar).getByTitle('새 노트 (+)')).toBeInTheDocument();
  });

  it('sorts folders before files in natural alphabetical order', () => {
    const { container } = renderSidebar();
    const tree = container.querySelector('[tabindex="0"]')!;
    const itemNames = Array.from(tree.querySelectorAll('.truncate')).map((el) => el.textContent);
    expect(itemNames).toEqual(['AlphaFolder', 'Apple', 'Zebra']);
  });

  it('normal click opens file or expands folder without multi-selection', async () => {
    const onSelectFile = vi.fn();
    const user = userEvent.setup();
    renderSidebar({ onSelectFile });

    await user.click(screen.getByText('Apple'));
    expect(onSelectFile).toHaveBeenCalledWith('f-apple');
    expect(screen.queryByText('항목 선택')).toBeNull();
    expect(screen.queryByText(/개 선택됨/)).toBeNull();

    expect(screen.queryByText('Child')).toBeNull();
    await user.click(screen.getByText('AlphaFolder'));
    expect(screen.getByText('Child')).toBeInTheDocument();
  });

  it('selection mode toggles in-place and updates count with bulk delete', async () => {
    const user = userEvent.setup();
    renderSidebar();

    await user.click(screen.getByTitle('선택 모드'));
    expect(screen.getByText('항목 선택')).toBeInTheDocument();
    expect(screen.getByText('전체 선택')).toBeInTheDocument();
    expect(screen.getByText('취소')).toBeInTheDocument();

    const deleteBtn = screen.getByTitle('선택된 항목 일괄 삭제');
    expect(deleteBtn).toBeDisabled();

    await user.click(screen.getByText('Apple'));
    expect(screen.getByText('1개 선택됨')).toBeInTheDocument();
    expect(deleteBtn).not.toBeDisabled();

    await user.click(screen.getByText('취소'));
    expect(screen.queryByText('1개 선택됨')).toBeNull();
    expect(screen.getByTitle('선택 모드')).toBeInTheDocument();
  });

  it('opens inline input on context menu rename without window.prompt', async () => {
    const promptSpy = vi.spyOn(window, 'prompt').mockReturnValue(null);
    const user = userEvent.setup();
    renderSidebar();

    fireEvent.contextMenu(screen.getByText('Apple'));
    const renameMenuItem = screen.getByText('F2').closest('button')!;
    await user.click(renameMenuItem);

    expect(promptSpy).not.toHaveBeenCalled();
    const input = screen.getByDisplayValue('Apple');
    expect(input).toBeInTheDocument();
    expect(input.tagName).toBe('INPUT');
    promptSpy.mockRestore();
  });

  it('collapses expanded folders on collapseAll button click', async () => {
    const user = userEvent.setup();
    renderSidebar();

    await user.click(screen.getByText('AlphaFolder'));
    expect(screen.getByText('Child')).toBeInTheDocument();

    await user.click(screen.getByTitle('폴더 모두 접기'));
    expect(screen.queryByText('Child')).toBeNull();
  });
});
