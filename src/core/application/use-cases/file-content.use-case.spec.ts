import { describe, expect, it } from 'vitest';
import { FixedClock } from '../../../infrastructure/storage/system-clock';
import { T0 } from '../../../test/fixed-clock';
import { InMemoryFileRepository } from '../../../test/in-memory-file.repository';
import { FileContentUseCase } from './file-content.use-case';
import { ManageFileNodeUseCase } from './manage-file-node.use-case';

describe('FileContentUseCase', () => {
  it('gets and saves file content', async () => {
    const fileRepo = new InMemoryFileRepository();
    const clock = new FixedClock(T0);
    const nodeUseCase = new ManageFileNodeUseCase(fileRepo, clock);
    const contentUseCase = new FileContentUseCase(fileRepo, clock);

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

  it('stamps updatedAt from the injected clock on save', async () => {
    const fileRepo = new InMemoryFileRepository();
    const clock = new FixedClock(T0);
    const nodeUseCase = new ManageFileNodeUseCase(fileRepo, clock);
    const contentUseCase = new FileContentUseCase(fileRepo, clock);

    const file = await nodeUseCase.createFile({
      vaultId: 'v1',
      parentId: null,
      name: 'Timed.md',
      type: 'file',
      content: '',
    });

    clock.advance(2_500);
    await contentUseCase.saveContent(file.id, 'body');

    const stored = await fileRepo.findById(file.id);
    expect(stored?.updatedAt).toBe(T0 + 2_500);
    expect(stored?.content).toBe('body');
  });

  it('reads and writes a missing file as file.notFound', async () => {
    const contentUseCase = new FileContentUseCase(new InMemoryFileRepository(), new FixedClock(T0));

    await expect(contentUseCase.getContent('nope')).rejects.toMatchObject({ code: 'file.notFound' });
    await expect(contentUseCase.saveContent('nope', 'y')).rejects.toMatchObject({ code: 'file.notFound' });
  });
});