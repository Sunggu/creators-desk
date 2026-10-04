import type { VaultRepository } from '../../core/application/ports/vault.repository';
import type { VaultDto } from '../../core/domain/vault.dto';
import { idbDatabase, type IdbDatabase, STORES } from './idb-database';

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
          const list = req.result as VaultDto[];
          for (const v of list) this.memoryCache.set(v.id, v);
          resolve(list);
        };
        req.onerror = () => reject(req.error);
      });
    } catch {
      return Array.from(this.memoryCache.values());
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
          const result = (req.result as VaultDto) || null;
          if (result) this.memoryCache.set(result.id, result);
          resolve(result);
        };
        req.onerror = () => reject(req.error);
      });
    } catch {
      return this.memoryCache.get(id) ?? null;
    }
  }

  async create(vault: VaultDto): Promise<VaultDto> {
    this.memoryCache.set(vault.id, vault);
    try {
      const db = await this.db.getDb();
      return new Promise<VaultDto>((resolve, reject) => {
        const tx = db.transaction(STORES.VAULTS, 'readwrite');
        const store = tx.objectStore(STORES.VAULTS);
        const req = store.put(vault);
        req.onsuccess = () => resolve(vault);
        req.onerror = () => reject(req.error);
      });
    } catch {
      return vault;
    }
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
