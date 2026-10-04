import { describe, expect, it } from 'vitest';
import type { FileNodeDto } from '../../domain/file-node.dto';
import { AppError } from '../../domain/errors/app-error';
import { FixedClock } from '../../../infrastructure/storage/system-clock';
import type { Clock } from '../ports/clock.port';
import type { FileRepository } from '../ports/file.repository';
import { FileContentUseCase } from './file-content.use-case';
import { ManageFileNodeUseCase } from './manage-file-node.use-case';

/** Pinned instant so `createdAt`/`updatedAt` assertions stay deterministic. */
const T0 = 1_700_000_000_000;

function createClock(): FixedClock {
  return new FixedClock(T0);
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

describe('File Node Use Cases', () => {
  it('appends .md extension to markdown files automatically', async () => {
    const fileRepo = new InMemoryFileRepository();
    const useCase = new ManageFileNodeUseCase(fileRepo, createClock());

    const file = await useCase.createFile({
      vaultId: 'v1',
      parentId: null,
      name: 'Meeting Notes',
      type: 'file',
    });

    expect(file.name).toBe('Meeting Notes.md');
    expect(file.type).toBe('file');
  });

  it('keeps folder name without .md extension', async () => {
    const fileRepo = new InMemoryFileRepository();
    const useCase = new ManageFileNodeUseCase(fileRepo, createClock());

    const folder = await useCase.createFile({
      vaultId: 'v1',
      parentId: null,
      name: 'Chapters',
      type: 'folder',
    });

    expect(folder.name).toBe('Chapters');
    expect(folder.type).toBe('folder');
  });

  it('renames file and retains .md extension', async () => {
    const fileRepo = new InMemoryFileRepository();
    const useCase = new ManageFileNodeUseCase(fileRepo, createClock());

    const file = await useCase.createFile({
      vaultId: 'v1',
      parentId: null,
      name: 'Draft.md',
      type: 'file',
    });

    const renamed = await useCase.rename(file.id, 'Final Draft');
    expect(renamed.name).toBe('Final Draft.md');
  });

  it('recursively deletes folder and all nested files and subfolders', async () => {
    const fileRepo = new InMemoryFileRepository();
    const useCase = new ManageFileNodeUseCase(fileRepo, createClock());

    const parentFolder = await useCase.createFile({
      vaultId: 'v1',
      parentId: null,
      name: 'Parent',
      type: 'folder',
    });

    const subFolder = await useCase.createFile({
      vaultId: 'v1',
      parentId: parentFolder.id,
      name: 'Sub',
      type: 'folder',
    });

    const nestedFile = await useCase.createFile({
      vaultId: 'v1',
      parentId: subFolder.id,
      name: 'Secret.md',
      type: 'file',
    });

    await useCase.delete(parentFolder.id);

    expect(await fileRepo.findById(parentFolder.id)).toBeNull();
    expect(await fileRepo.findById(subFolder.id)).toBeNull();
    expect(await fileRepo.findById(nestedFile.id)).toBeNull();
  });

  it('gets and saves file content', async () => {
    const fileRepo = new InMemoryFileRepository();
    const nodeUseCase = new ManageFileNodeUseCase(fileRepo, createClock());
    const contentUseCase = new FileContentUseCase(fileRepo, createClock());

    const file = await nodeUseCase.createFile({
      vaultId: 'v1',
      parentId: null,
      name: 'Story.md',
      type: 'file',
      content: '# Initial',
    });

    expect(await contentUseCase.getContent(file.id)).toBe('# Initial');

    await contentUseCase.saveContent(file.id, '# Updated Content');
    expect(await contentUseCase.getContent(file.id)).toBe('# Updated Content');
  });

  it('moves files and folders and prevents circular moves', async () => {
    const fileRepo = new InMemoryFileRepository();
    const useCase = new ManageFileNodeUseCase(fileRepo, createClock());

    const folderA = await useCase.createFile({ vaultId: 'v1', parentId: null, name: 'FolderA', type: 'folder' });
    const folderB = await useCase.createFile({ vaultId: 'v1', parentId: null, name: 'FolderB', type: 'folder' });
    const note = await useCase.createFile({ vaultId: 'v1', parentId: null, name: 'Note.md', type: 'file' });

    // Move note into FolderA
    const movedNote = await useCase.move(note.id, folderA.id);
    expect(movedNote.parentId).toBe(folderA.id);

    // Move FolderB into FolderA
    const movedFolderB = await useCase.move(folderB.id, folderA.id);
    expect(movedFolderB.parentId).toBe(folderA.id);

    // Cannot move FolderA into FolderB (descendant circular reference)
    await expect(useCase.move(folderA.id, folderB.id)).rejects.toMatchObject({
      code: 'file.moveIntoDescendant',
    });

    // Cannot move into itself
    await expect(useCase.move(folderA.id, folderA.id)).rejects.toMatchObject({
      code: 'file.moveIntoSelf',
    });

    // Move back to root
    const rootNote = await useCase.move(note.id, null);
    expect(rootNote.parentId).toBeNull();
  });

  it('stamps createdAt and updatedAt from the injected clock', async () => {
    const fileRepo = new InMemoryFileRepository();
    const clock = createClock();
    const useCase = new ManageFileNodeUseCase(fileRepo, clock);

    const file = await useCase.createFile({
      vaultId: 'v1',
      parentId: null,
      name: 'Timed',
      type: 'file',
    });

    expect(file.createdAt).toBe(T0);
    expect(file.updatedAt).toBe(T0);

    clock.advance(5_000);
    const renamed = await useCase.rename(file.id, 'Renamed');
    expect(renamed.createdAt).toBe(T0);
    expect(renamed.updatedAt).toBe(T0 + 5_000);
  });

  it('rejects a blank name with a translatable error code', async () => {
    const fileRepo = new InMemoryFileRepository();
    const useCase = new ManageFileNodeUseCase(fileRepo, createClock());

    await expect(
      useCase.createFile({ vaultId: 'v1', parentId: null, name: '   ', type: 'file' }),
    ).rejects.toMatchObject({ code: 'file.nameRequired' });
  });

  it('rejects operations on a missing file with file.notFound', async () => {
    const fileRepo = new InMemoryFileRepository();
    const useCase = new ManageFileNodeUseCase(fileRepo, createClock());
    const contentUseCase = new FileContentUseCase(fileRepo, createClock());

    await expect(useCase.rename('nope', 'x')).rejects.toMatchObject({ code: 'file.notFound' });
    await expect(contentUseCase.getContent('nope')).rejects.toMatchObject({ code: 'file.notFound' });
    await expect(contentUseCase.saveContent('nope', 'y')).rejects.toMatchObject({ code: 'file.notFound' });
  });

  it('surfaces failures as AppError, never as raw sentences', async () => {
    const fileRepo = new InMemoryFileRepository();
    const useCase = new ManageFileNodeUseCase(fileRepo, createClock());

    await expect(useCase.rename('nope', 'x')).rejects.toBeInstanceOf(AppError);
  });
});

/** Compile-time guard: the clock is a required collaborator, not optional. */
const _clockIsRequired: Clock = new FixedClock(T0);
void _clockIsRequired;
