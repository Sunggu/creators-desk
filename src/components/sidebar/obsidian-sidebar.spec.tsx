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
  it('renders single toolbar without duplicate headers or close X button, and without collapseAll/selectMode', () => {
    const { container } = renderSidebar();
    const toolbar = container.querySelector('.h-9') as HTMLElement;
    expect(within(toolbar).getByText('탐색기')).toBeInTheDocument();
    expect(within(toolbar).getByTitle('새 노트 (+)')).toBeInTheDocument();
    expect(within(toolbar).getByTitle('새 폴더')).toBeInTheDocument();
    expect(within(toolbar).getByTitle('새로고침')).toBeInTheDocument();
    expect(screen.queryByTitle('닫기')).toBeNull();
    expect(screen.queryByTitle('선택 모드')).toBeNull();
    expect(screen.queryByTitle('폴더 모두 접기')).toBeNull();
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
    expect(screen.queryByText(/개 선택됨/)).toBeNull();

    expect(screen.queryByText('Child')).toBeNull();
    await user.click(screen.getByText('AlphaFolder'));
    expect(screen.getByText('Child')).toBeInTheDocument();
  });

  it('Ctrl+Click selects items and switches toolbar in-place to bulk delete without selectAll', async () => {
    const { container } = renderSidebar();
    const user = userEvent.setup();

    fireEvent.click(screen.getByText('Apple'), { ctrlKey: true });
    expect(screen.getByText('1개 선택됨')).toBeInTheDocument();
    expect(screen.queryByText('전체 선택')).toBeNull();
    expect(screen.getByTitle('선택된 항목 일괄 삭제')).toBeInTheDocument();

    fireEvent.click(screen.getByText('Zebra'), { ctrlKey: true });
    expect(screen.getByText('2개 선택됨')).toBeInTheDocument();

    await user.click(screen.getByText('취소'));
    expect(screen.queryByText(/개 선택됨/)).toBeNull();
    const toolbar = container.querySelector('.h-9') as HTMLElement;
    expect(within(toolbar).getByTitle('새 노트 (+)')).toBeInTheDocument();
  });

  it('active file row has no border-l-2 class to avoid margin shift', () => {
    renderSidebar({ activeFileId: 'f-apple' });
    const appleRow = screen.getByText('Apple').closest('.group')!;
    expect(appleRow.className).toContain('bg-[#23232b]');
    expect(appleRow.className).toContain('text-violet-200');
    expect(appleRow.className).not.toContain('border-l-2');
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
});
