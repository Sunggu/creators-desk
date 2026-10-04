import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { HttpFileRepository } from './http-file.repository';

describe('HttpFileRepository', () => {
  let repo: HttpFileRepository;
  const mockFetch = vi.fn();

  beforeEach(() => {
    vi.stubGlobal('fetch', mockFetch);
    repo = new HttpFileRepository('/api/vaults');
  });

  afterEach(() => {
    vi.restoreAllMocks();
  });

  it('fetches files by vault key', async () => {
    mockFetch.mockResolvedValueOnce({
      ok: true,
      json: async () => [
        { id: 'f1', vaultId: 'v1', parentId: null, name: 'note.md', type: 'file', size: 10, createdAt: 1, updatedAt: 1 },
      ],
    });

    const files = await repo.findByVaultId('v1');
    expect(mockFetch).toHaveBeenCalledWith('/api/vaults/v1/files');
    expect(files).toHaveLength(1);
    expect(files[0].name).toBe('note.md');
  });

  it('creates file and uploads markdown content', async () => {
    mockFetch.mockResolvedValueOnce({
      ok: true,
      json: async () => ({
        id: 'f2',
        vaultId: 'v1',
        parentId: null,
        name: 'hello.md',
        type: 'file',
        createdAt: 2,
        updatedAt: 2,
      }),
    });
    mockFetch.mockResolvedValueOnce({
      ok: true,
      text: async () => 'OK',
    });

    const created = await repo.create({
      id: 'f2',
      vaultId: 'v1',
      parentId: null,
      name: 'hello.md',
      type: 'file',
      content: '# Hello World',
      createdAt: 2,
      updatedAt: 2,
    });

    expect(mockFetch).toHaveBeenCalledWith(
      '/api/vaults/v1/files',
      expect.objectContaining({ method: 'POST' }),
    );
    expect(mockFetch).toHaveBeenCalledWith(
      '/api/vaults/v1/files/f2/content',
      expect.objectContaining({ method: 'PUT', body: '# Hello World' }),
    );
    expect(created.name).toBe('hello.md');
  });

  it('lazily fetches content in findById if not yet populated', async () => {
    mockFetch.mockResolvedValueOnce({
      ok: true,
      json: async () => [
        { id: 'f3', vaultId: 'v1', parentId: null, name: 'lazy.md', type: 'file', createdAt: 3, updatedAt: 3 },
      ],
    });
    await repo.findByVaultId('v1');

    mockFetch.mockResolvedValueOnce({
      ok: true,
      text: async () => 'Lazy Content Body',
    });

    const found = await repo.findById('f3');
    expect(mockFetch).toHaveBeenCalledWith('/api/vaults/v1/files/f3/content');
    expect(found?.content).toBe('Lazy Content Body');
  });

  it('updates file name and content', async () => {
    mockFetch.mockResolvedValueOnce({
      ok: true,
      json: async () => [
        { id: 'f4', vaultId: 'v1', parentId: null, name: 'old.md', type: 'file', createdAt: 4, updatedAt: 4 },
      ],
    });
    await repo.findByVaultId('v1');

    mockFetch.mockResolvedValueOnce({ ok: true, json: async () => ({}) });
    mockFetch.mockResolvedValueOnce({ ok: true, json: async () => ({}) });

    const updated = await repo.update('f4', { name: 'new.md', content: 'New Content' });
    expect(mockFetch).toHaveBeenCalledWith(
      '/api/vaults/v1/files/f4',
      expect.objectContaining({ method: 'PATCH' }),
    );
    expect(mockFetch).toHaveBeenCalledWith(
      '/api/vaults/v1/files/f4/content',
      expect.objectContaining({ method: 'PUT', body: 'New Content' }),
    );
    expect(updated.name).toBe('new.md');
  });
});
