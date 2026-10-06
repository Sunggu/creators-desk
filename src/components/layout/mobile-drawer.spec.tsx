import { render, waitFor, within } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { beforeEach, describe, expect, it, vi } from 'vitest';
import type { FileNodeDto } from '../../core/domain/file-node.dto';
import type { VaultDto } from '../../core/domain/vault.dto';
import I18nProvider from '../../i18n/i18n-provider';
import type { InMemoryFileRepository } from '../../test/in-memory-file.repository';
import type { InMemoryVaultRepository } from '../../test/in-memory-vault.repository';
import ObsidianShell from './obsidian-shell';

/**
 * `vi.mock` is hoisted above the imports, so the in-memory seams are built
 * inside the factory and handed back through a hoisted holder.
 */
const seam = vi.hoisted(() => ({
  files: null as InMemoryFileRepository | null,
  vaults: null as InMemoryVaultRepository | null,
}));

vi.mock('../../infrastructure/di', async (importOriginal) => {
  const actual = await importOriginal<typeof import('../../infrastructure/di')>();
  const [{ FileContentUseCase }, { ManageFileNodeUseCase }, { ManageSessionUseCase }] =
    await Promise.all([
      import('../../core/application/use-cases/file-content.use-case'),
      import('../../core/application/use-cases/manage-file-node.use-case'),
      import('../../core/application/use-cases/manage-session.use-case'),
    ]);
  const [{ LocalSessionRepository }, { InMemoryFileRepository }, { InMemoryVaultRepository }] =
    await Promise.all([
      import('../../infrastructure/storage/local-session.repository'),
      import('../../test/in-memory-file.repository'),
      import('../../test/in-memory-vault.repository'),
    ]);

  const files = new InMemoryFileRepository();
  const vaults = new InMemoryVaultRepository();
  const clock = new actual.FixedClock(0);
  seam.files = files;
  seam.vaults = vaults;

  return {
    ...actual,
    manageFileNodeUseCase: new ManageFileNodeUseCase(files, clock),
    fileContentUseCase: new FileContentUseCase(files, clock),
    manageSessionUseCase: new ManageSessionUseCase(new LocalSessionRepository(), vaults),
  };
});

const VAULT: VaultDto = {
  id: 'vault-1',
  key: 'demo',
  alias: 'Demo Vault',
  name: 'Demo Vault',
  createdAt: 0,
  updatedAt: 0,
};

const NOTE: FileNodeDto = {
  id: 'file-1',
  vaultId: VAULT.id,
  parentId: null,
  name: 'Welcome.md',
  type: 'file',
  content: 'hello',
  createdAt: 0,
  updatedAt: 0,
};

const OTHER_NOTE: FileNodeDto = { ...NOTE, id: 'file-2', name: 'Second.md', content: 'world' };

beforeEach(async () => {
  seam.files!.files.clear();
  seam.files!.files.set(NOTE.id, NOTE);
  seam.files!.files.set(OTHER_NOTE.id, OTHER_NOTE);
  await seam.vaults!.create(VAULT);
});

function renderShell() {
  return render(
    <I18nProvider>
      <ObsidianShell
        vault={VAULT}
        vaults={[VAULT]}
        onSelectVault={vi.fn()}
        onCreateVault={vi.fn()}
        onDeleteVault={vi.fn()}
      />
    </I18nProvider>,
  );
}

const drawer = (c: HTMLElement) => c.querySelector('[data-drawer]') as HTMLElement;
const backdrop = (c: HTMLElement) => c.querySelector('[data-drawer-backdrop]') as HTMLElement;

/**
 * Queries are scoped because the drawer and the desktop sidebar are both in the
 * DOM - only their responsive visibility differs, which jsdom does not model.
 * The header trigger also relabels itself, so its name proves the drawer state.
 */
const headerToggle = (c: HTMLElement) =>
  within(c.querySelector('header')!).getByRole('button', { name: /탐색기 (열기|닫기)/ });

const isOpen = (c: HTMLElement) => !drawer(c).className.includes('-translate-x-full');

describe('mobile drawer', () => {
  it('starts closed so a phone lands on the editor, not the sidebar', async () => {
    const { container } = renderShell();

    await waitFor(() => expect(container.querySelector('.cm-content')).not.toBeNull());
    expect(isOpen(container)).toBe(false);
    expect(headerToggle(container)).toHaveAttribute('aria-expanded', 'false');
  });

  it('opens from the header trigger', async () => {
    const user = userEvent.setup();
    const { container } = renderShell();

    await user.click(headerToggle(container));

    expect(isOpen(container)).toBe(true);
  });

  it('closes again from the header trigger', async () => {
    // Regression: the trigger used to force the panel open, so it could never dismiss.
    const user = userEvent.setup();
    const { container } = renderShell();

    await user.click(headerToggle(container));
    await user.click(headerToggle(container));

    expect(isOpen(container)).toBe(false);
  });

  it('closes when the backdrop is tapped', async () => {
    const user = userEvent.setup();
    const { container } = renderShell();

    await user.click(headerToggle(container));
    await user.click(backdrop(container));

    expect(isOpen(container)).toBe(false);
  });

  it('dismisses after a note is picked, so the editor takes focus back', async () => {
    const user = userEvent.setup();
    const { container } = renderShell();

    await user.click(headerToggle(container));
    await user.click(await within(drawer(container)).findByText('Welcome'));

    expect(isOpen(container)).toBe(false);
  });

  it('exposes search and settings, which had no mobile entry point', async () => {
    const user = userEvent.setup();
    const { container } = renderShell();

    await user.click(headerToggle(container));

    expect(within(drawer(container)).getByRole('button', { name: /빠른 검색/ })).toBeInTheDocument();
    expect(within(drawer(container)).getByRole('button', { name: /환경설정/ })).toBeInTheDocument();
  });

  it('keeps a closed drawer out of the tab order and the hit test', () => {
    const { container } = renderShell();

    expect(drawer(container)).toHaveAttribute('inert');
    expect(drawer(container).className).toContain('pointer-events-none');
  });
});