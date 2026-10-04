import { describe, expect, it } from 'vitest';
import type { FileNodeDto } from '../../domain/file-node.dto';
import type { VaultDto } from '../../domain/vault.dto';
import type { FileRepository } from '../ports/file.repository';
import type { SessionRepository } from '../ports/session.repository';
import type { VaultRepository } from '../ports/vault.repository';
import { FixedClock } from '../../../infrastructure/storage/system-clock';
import { AppError } from '../../domain/errors/app-error';
import { CreateVaultUseCase } from './create-vault.use-case';
import { DeleteVaultUseCase } from './delete-vault.use-case';
import { ListVaultsUseCase } from './list-vaults.use-case';
import { UpdateVaultUseCase } from './update-vault.use-case';

class InMemoryVaultRepository implements VaultRepository {
  private vaults = new Map<string, VaultDto>();

  async findAll(): Promise<VaultDto[]> {
    return Array.from(this.vaults.values());
  }
  async findById(id: string): Promise<VaultDto | null> {
    return this.vaults.get(id) ?? null;
  }
  async findByKey(key: string): Promise<VaultDto | null> {
    return Array.from(this.vaults.values()).find((v) => v.key === key) ?? null;
  }
  async create(vault: VaultDto): Promise<VaultDto> {
    this.vaults.set(vault.id, vault);
    return vault;
  }
  async update(id: string, updates: Partial<VaultDto>): Promise<VaultDto> {
    const existing = this.vaults.get(id);
    if (!existing) throw new Error('Not found');
    const updated = { ...existing, ...updates };
    this.vaults.set(id, updated);
    return updated;
  }
  async delete(id: string): Promise<void> {
    this.vaults.delete(id);
  }
}

class InMemoryFileRepository implements FileRepository {
  public files = new Map<string, FileNodeDto>();

  async findByVaultId(vaultId: string): Promise<FileNodeDto[]> {
    return Array.from(this.files.values()).filter((f) => f.vaultId === vaultId);
  }
  async findById(id: string): Promise<FileNodeDto | null> {
    return this.files.get(id) ?? null;
  }
  async create(node: FileNodeDto): Promise<FileNodeDto> {
    this.files.set(node.id, node);
    return node;
  }
  async update(id: string, updates: Partial<FileNodeDto>): Promise<FileNodeDto> {
    const existing = this.files.get(id);
    if (!existing) throw new Error('Not found');
    const updated = { ...existing, ...updates };
    this.files.set(id, updated);
    return updated;
  }
  async delete(id: string): Promise<void> {
    this.files.delete(id);
  }
  async deleteByVaultId(vaultId: string): Promise<void> {
    for (const [id, f] of this.files.entries()) {
      if (f.vaultId === vaultId) this.files.delete(id);
    }
  }
}

class InMemorySessionRepository implements SessionRepository {
  private activeVault: string | null = null;
  private activeFiles = new Map<string, string | null>();

  getLastActiveVaultId(): string | null {
    return this.activeVault;
  }
  setLastActiveVaultId(vaultId: string | null): void {
    this.activeVault = vaultId;
  }
  getLastActiveFileId(vaultId: string): string | null {
    return this.activeFiles.get(vaultId) ?? null;
  }
  setLastActiveFileId(vaultId: string, fileId: string | null): void {
    this.activeFiles.set(vaultId, fileId);
  }
}

/** Pinned instant so timestamp assertions stay deterministic. */
const T0 = 1_700_000_000_000;

describe('Vault Use Cases', () => {
  it('creates vault with immutable key, alias, and starter note', async () => {
    const vaultRepo = new InMemoryVaultRepository();
    const fileRepo = new InMemoryFileRepository();
    const createVault = new CreateVaultUseCase(vaultRepo, new FixedClock(T0), fileRepo);

    const vault = await createVault.execute({
      name: '  My Research  ',
      starterContent: '# Welcome to My Research\n\nLocalized body.',
    });
    expect(vault.alias).toBe('My Research');
    expect(vault.name).toBe('My Research');
    expect(vault.key).toMatch(/^vlt_/);
    expect(vault.id).toBeDefined();

    const files = await fileRepo.findByVaultId(vault.id);
    expect(files).toHaveLength(1);
    expect(files[0].name).toBe('Welcome.md');
    expect(files[0].content).toContain('# Welcome to My Research');
  });

  it('seeds the welcome note with caller-supplied localized copy', async () => {
    const vaultRepo = new InMemoryVaultRepository();
    const fileRepo = new InMemoryFileRepository();
    const createVault = new CreateVaultUseCase(vaultRepo, new FixedClock(T0), fileRepo);

    const vault = await createVault.execute({
      name: 'Korean Vault',
      starterContent: '# 환영합니다',
    });

    const [note] = await fileRepo.findByVaultId(vault.id);
    expect(note.content).toBe('# 환영합니다');
  });

  it('writes epoch-millisecond timestamps taken from the clock', async () => {
    const vaultRepo = new InMemoryVaultRepository();
    const clock = new FixedClock(T0);
    const createVault = new CreateVaultUseCase(vaultRepo, clock);

    const vault = await createVault.execute({ name: 'Timed' });
    expect(vault.createdAt).toBe(T0);
    expect(vault.updatedAt).toBe(T0);

    clock.advance(30_000);
    const renamed = await new UpdateVaultUseCase(vaultRepo, clock).execute(vault.id, {
      alias: 'Later',
    });
    expect(renamed.updatedAt).toBe(T0 + 30_000);
    expect(renamed.createdAt).toBe(T0);
  });

  it('never rewrites the immutable key on rename', async () => {
    const vaultRepo = new InMemoryVaultRepository();
    const createVault = new CreateVaultUseCase(vaultRepo, new FixedClock(T0));
    const vault = await createVault.execute({ name: 'Key Holder' });

    const renamed = await new UpdateVaultUseCase(vaultRepo, new FixedClock(T0)).execute(vault.id, {
      alias: 'Renamed',
    });

    expect(renamed.key).toBe(vault.key);
  });

  it('updates vault alias while preserving immutable key', async () => {
    const vaultRepo = new InMemoryVaultRepository();
    const createVault = new CreateVaultUseCase(vaultRepo, new FixedClock(T0));
    const updateVault = new UpdateVaultUseCase(vaultRepo, new FixedClock(T0));

    const vault = await createVault.execute({ alias: 'Original Project' });
    const originalKey = vault.key;

    const renamed = await updateVault.execute(vault.id, { alias: 'Renamed Project' });
    expect(renamed.alias).toBe('Renamed Project');
    expect(renamed.name).toBe('Renamed Project');
    expect(renamed.key).toBe(originalKey);
  });

  it('rejects empty vault name', async () => {
    const vaultRepo = new InMemoryVaultRepository();
    const createVault = new CreateVaultUseCase(vaultRepo, new FixedClock(T0));

    await expect(createVault.execute({ name: '   ' })).rejects.toMatchObject({
      code: 'vault.nameRequired',
    });
    await expect(createVault.execute({ name: '   ' })).rejects.toBeInstanceOf(AppError);
  });

  it('lists vaults sorted by updatedAt descending', async () => {
    const vaultRepo = new InMemoryVaultRepository();
    await vaultRepo.create({ id: '1', key: 'vlt_1', alias: 'Old', name: 'Old', createdAt: 100, updatedAt: 100 });
    await vaultRepo.create({ id: '2', key: 'vlt_2', alias: 'New', name: 'New', createdAt: 200, updatedAt: 300 });

    const listVaults = new ListVaultsUseCase(vaultRepo);
    const result = await listVaults.execute();

    expect(result.map((v) => v.id)).toEqual(['2', '1']);
  });

  it('deletes vault, clears files, and resets session if matching', async () => {
    const vaultRepo = new InMemoryVaultRepository();
    const fileRepo = new InMemoryFileRepository();
    const sessionRepo = new InMemorySessionRepository();

    await vaultRepo.create({ id: 'v1', key: 'vlt_v1', alias: 'To Delete', name: 'To Delete', createdAt: 1, updatedAt: 1 });
    await fileRepo.create({ id: 'f1', vaultId: 'v1', parentId: null, name: 'Note.md', type: 'file', createdAt: 1, updatedAt: 1 });
    sessionRepo.setLastActiveVaultId('v1');

    const deleteVault = new DeleteVaultUseCase(vaultRepo, fileRepo, sessionRepo);
    await deleteVault.execute('v1');

    expect(await vaultRepo.findById('v1')).toBeNull();
    expect(await fileRepo.findByVaultId('v1')).toHaveLength(0);
    expect(sessionRepo.getLastActiveVaultId()).toBeNull();
  });
});
