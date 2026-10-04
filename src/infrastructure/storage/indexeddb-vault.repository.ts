import type { VaultRepository } from '../../core/application/ports/vault.repository';
import type { VaultDto } from '../../core/domain/vault.dto';
import { idbDatabase, type IdbDatabase, STORES } from './idb-database';

function normalizeVault(v: VaultDto): VaultDto {
  const alias = v.alias || v.name || 'Untitled Vault';
  const key = v.key || v.id;
  return {
    ...v,
    key,
    alias,
    name: alias,
  };
}

export class IndexedDbVaultRepository implements VaultRepository {
  private readonly db: IdbDatabase;
  private readonly memoryCache = new Map<string, VaultDto>();

  constructor(db: IdbDatabase = idbDatabase) {
    this.db = db;
  }

  async findAll(): Promise<VaultDto[]> {
    try {
      const db = await this.db.getDb();
      return new Promise<VaultDto[]>((resolve, reject) => {
        const tx = db.transaction(STORES.VAULTS, 'readonly');
        const store = tx.objectStore(STORES.VAULTS);
        const req = store.getAll();
        req.onsuccess = () => {
          const list = (req.result as VaultDto[]).map(normalizeVault);
          for (const v of list) this.memoryCache.set(v.id, v);
          resolve(list);
        };
        req.onerror = () => reject(req.error);
      });
    } catch {
      return Array.from(this.memoryCache.values()).map(normalizeVault);
    }
  }

  async findById(id: string): Promise<VaultDto | null> {
    try {
      const db = await this.db.getDb();
      return new Promise<VaultDto | null>((resolve, reject) => {
        const tx = db.transaction(STORES.VAULTS, 'readonly');
        const store = tx.objectStore(STORES.VAULTS);
        const req = store.get(id);
        req.onsuccess = () => {
          const raw = req.result as VaultDto | undefined;
          const result = raw ? normalizeVault(raw) : null;
          if (result) this.memoryCache.set(result.id, result);
          resolve(result);
        };
        req.onerror = () => reject(req.error);
      });
    } catch {
      const cached = this.memoryCache.get(id);
      return cached ? normalizeVault(cached) : null;
    }
  }

  async findByKey(key: string): Promise<VaultDto | null> {
    const all = await this.findAll();
    return all.find((v) => v.key === key) ?? null;
  }

  async create(vault: VaultDto): Promise<VaultDto> {
    const normalized = normalizeVault(vault);
    this.memoryCache.set(normalized.id, normalized);
    try {
      const db = await this.db.getDb();
      return new Promise<VaultDto>((resolve, reject) => {
        const tx = db.transaction(STORES.VAULTS, 'readwrite');
        const store = tx.objectStore(STORES.VAULTS);
        const req = store.put(normalized);
        req.onsuccess = () => resolve(normalized);
        req.onerror = () => reject(req.error);
      });
    } catch {
      return normalized;
    }
  }

  async update(id: string, updates: Partial<VaultDto>): Promise<VaultDto> {
    const existing = await this.findById(id);
    if (!existing) throw new Error('Vault not found');
    const updated = normalizeVault({
      ...existing,
      ...updates,
      updatedAt: Date.now(),
    });
    return this.create(updated);
  }

  async delete(id: string): Promise<void> {
    this.memoryCache.delete(id);
    try {
      const db = await this.db.getDb();
      return new Promise<void>((resolve, reject) => {
        const tx = db.transaction(STORES.VAULTS, 'readwrite');
        const store = tx.objectStore(STORES.VAULTS);
        const req = store.delete(id);
        req.onsuccess = () => resolve();
        req.onerror = () => reject(req.error);
      });
    } catch {
      // Memory cache already updated
    }
  }
}
