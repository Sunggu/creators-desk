import { describe, expect, it } from 'vitest';
import { FixedClock } from '../../../infrastructure/storage/system-clock';
import { AppError } from '../../domain/errors/app-error';
import { T0 } from '../../../test/fixed-clock';
import { InMemoryFileRepository } from '../../../test/in-memory-file.repository';
import { ManageFileNodeUseCase } from './manage-file-node.use-case';

function createClock(): FixedClock {
  return new FixedClock(T0);
}

describe('ManageFileNodeUseCase', () => {
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

  it('moves files and folders and prevents circular moves', async () => {
    const fileRepo = new InMemoryFileRepository();
    const useCase = new ManageFileNodeUseCase(fileRepo, createClock());

    const folderA = await useCase.createFile({ vaultId: 'v1', parentId: null, name: 'FolderA', type: 'folder' });
    const folderB = await useCase.createFile({ vaultId: 'v1', parentId: null, name: 'FolderB', type: 'folder' });
    const note = await useCase.createFile({ vaultId: 'v1', parentId: null, name: 'Note.md', type: 'file' });

    const movedNote = await useCase.move(note.id, folderA.id);
    expect(movedNote.parentId).toBe(folderA.id);

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

  it('rejects a rename on a missing file', async () => {
    const fileRepo = new InMemoryFileRepository();
    const useCase = new ManageFileNodeUseCase(fileRepo, createClock());

    await expect(useCase.rename('nope', 'x')).rejects.toMatchObject({ code: 'file.notFound' });
  });

  it('surfaces failures as AppError, never as raw sentences', async () => {
    const fileRepo = new InMemoryFileRepository();
    const useCase = new ManageFileNodeUseCase(fileRepo, createClock());

    await expect(useCase.rename('nope', 'x')).rejects.toBeInstanceOf(AppError);
  });
});