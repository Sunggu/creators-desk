import type { VaultRepository } from '../../core/application/ports/vault.repository';
import type { VaultDto } from '../../core/domain/vault.dto';

function normalizeVault(v: Partial<VaultDto> & { alias?: string; name?: string; key?: string; id: string }): VaultDto {
  const alias = v.alias || v.name || 'Untitled Vault';
  const key = v.key || v.id;
  return {
    id: v.id,
    key,
    alias,
    name: alias,
    createdAt: v.createdAt || Date.now(),
    updatedAt: v.updatedAt || Date.now(),
  };
}

export class HttpVaultRepository implements VaultRepository {
  private readonly baseUrl: string;
  private readonly cache = new Map<string, VaultDto>();
  private readonly fallback?: VaultRepository;

  constructor(baseUrl: string = '/api/vaults', fallback?: VaultRepository) {
    this.baseUrl = baseUrl;
    this.fallback = fallback;
  }

  async findAll(): Promise<VaultDto[]> {
    try {
      const res = await fetch(this.baseUrl);
      if (!res.ok) throw new Error(`Failed to fetch vaults: ${res.statusText}`);
      const data = await res.json();
      const list = (data as Array<Partial<VaultDto> & { id: string }>).map(normalizeVault);
      this.cache.clear();
      for (const v of list) {
        this.cache.set(v.id, v);
        this.cache.set(v.key, v);
      }
      return list;
    } catch (err) {
      if (this.fallback) return this.fallback.findAll();
      throw err;
    }
  }

  async findById(id: string): Promise<VaultDto | null> {
    const cached = this.cache.get(id);
    if (cached) return cached;

    try {
      const res = await fetch(`${this.baseUrl}/${id}`);
      if (res.status === 404) return null;
      if (!res.ok) throw new Error(`Failed to find vault by id: ${id}`);

      const data = (await res.json()) as Partial<VaultDto> & { id: string };
      const vault = normalizeVault(data);
      this.cache.set(vault.id, vault);
      this.cache.set(vault.key, vault);
      return vault;
    } catch (err) {
      if (this.fallback) return this.fallback.findById(id);
      throw err;
    }
  }

  async findByKey(key: string): Promise<VaultDto | null> {
    return this.findById(key);
  }

  async create(vault: VaultDto): Promise<VaultDto> {
    try {
      const res = await fetch(this.baseUrl, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          alias: vault.alias || vault.name,
          key: vault.key,
        }),
      });

      if (!res.ok) throw new Error(`Failed to create vault: ${res.statusText}`);

      const data = (await res.json()) as Partial<VaultDto> & { id: string };
      const created = normalizeVault(data);
      this.cache.set(created.id, created);
      this.cache.set(created.key, created);
      return created;
    } catch (err) {
      if (this.fallback) return this.fallback.create(vault);
      throw err;
    }
  }

  async update(id: string, updates: Partial<VaultDto>): Promise<VaultDto> {
    try {
      const res = await fetch(`${this.baseUrl}/${id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          alias: updates.alias || updates.name,
        }),
      });

      if (!res.ok) throw new Error(`Failed to update vault: ${res.statusText}`);

      const existing = await this.findById(id);
      const updated = normalizeVault({
        ...(existing || {}),
        id,
        ...updates,
        updatedAt: Date.now(),
      });
      this.cache.set(updated.id, updated);
      this.cache.set(updated.key, updated);
      return updated;
    } catch (err) {
      if (this.fallback) return this.fallback.update(id, updates);
      throw err;
    }
  }

  async delete(id: string): Promise<void> {
    try {
      const res = await fetch(`${this.baseUrl}/${id}`, {
        method: 'DELETE',
      });

      if (!res.ok) throw new Error(`Failed to delete vault: ${res.statusText}`);

      const cached = this.cache.get(id);
      if (cached) {
        this.cache.delete(cached.id);
        this.cache.delete(cached.key);
      }
    } catch (err) {
      if (this.fallback) return this.fallback.delete(id);
      throw err;
    }
  }
}
