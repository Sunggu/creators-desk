import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { HttpVaultRepository } from './http-vault.repository';

describe('HttpVaultRepository', () => {
  let repo: HttpVaultRepository;
  const mockFetch = vi.fn();

  beforeEach(() => {
    vi.stubGlobal('fetch', mockFetch);
    repo = new HttpVaultRepository('/api/vaults');
  });

  afterEach(() => {
    vi.restoreAllMocks();
  });

  it('fetches all vaults via GET /api/vaults', async () => {
    mockFetch.mockResolvedValueOnce({
      ok: true,
      json: async () => [
        { id: 'v1', key: 'vlt_1', alias: 'My Vault', createdAt: 100, updatedAt: 200 },
      ],
    });

    const list = await repo.findAll();
    expect(mockFetch).toHaveBeenCalledWith('/api/vaults');
    expect(list).toHaveLength(1);
    expect(list[0].alias).toBe('My Vault');
    expect(list[0].key).toBe('vlt_1');
  });

  it('creates vault via POST /api/vaults', async () => {
    mockFetch.mockResolvedValueOnce({
      ok: true,
      json: async () => ({ id: 'v2', key: 'vlt_2', alias: 'New Vault', createdAt: 300, updatedAt: 300 }),
    });

    const created = await repo.create({
      id: 'v2',
      key: 'vlt_2',
      alias: 'New Vault',
      name: 'New Vault',
      createdAt: 300,
      updatedAt: 300,
    });

    expect(mockFetch).toHaveBeenCalledWith(
      '/api/vaults',
      expect.objectContaining({
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
      }),
    );
    expect(created.id).toBe('v2');
  });

  it('updates vault via PATCH /api/vaults/:id', async () => {
    mockFetch.mockResolvedValueOnce({
      ok: true,
      json: async () => ({ id: 'v1', key: 'vlt_1', alias: 'Old', createdAt: 100, updatedAt: 100 }),
    });
    mockFetch.mockResolvedValueOnce({
      ok: true,
      json: async () => ({ key: 'vlt_1', alias: 'Renamed Vault', updatedAt: 500 }),
    });

    const updated = await repo.update('v1', { alias: 'Renamed Vault' });
    expect(updated.alias).toBe('Renamed Vault');
  });

  it('deletes vault via DELETE /api/vaults/:id', async () => {
    mockFetch.mockResolvedValueOnce({ ok: true, json: async () => ({ success: true }) });
    await repo.delete('v1');
    expect(mockFetch).toHaveBeenCalledWith('/api/vaults/v1', { method: 'DELETE' });
  });
});
