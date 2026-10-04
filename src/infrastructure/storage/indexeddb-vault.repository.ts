import type { VaultRepository } from '../../core/application/ports/vault.repository';
import type { Clock } from '../../core/application/ports/clock.port';
import type { VaultDto } from '../../core/domain/vault.dto';
import type { EpochMillis } from '../../core/domain/time/epoch-millis.dto';
import { AppError } from '../../core/domain/errors/app-error';
import { idbDatabase, type IdbDatabase, STORES } from './idb-database';
import { systemClock } from './system-clock';
import { applyUpdate } from './timestamps';

function normalizeVault(v: VaultDto, fallbackMillis: EpochMillis): VaultDto {
  const alias = v.alias || v.name || 'Untitled Vault';
  const key = v.key || v.id;
  return {
    ...v,
    key,
    alias,
    name: alias,
    createdAt: v.createdAt ?? fallbackMillis,
    updatedAt: v.updatedAt ?? fallbackMillis,
  };
}

export class IndexedDbVaultRepository implements VaultRepository {
  private readonly db: IdbDatabase;
  private readonly clock: Clock;
  private readonly memoryCache = new Map<string, VaultDto>();

  constructor(db: IdbDatabase = idbDatabase, clock: Clock = systemClock) {
    this.db = db;
    this.clock = clock;
  }

  async findAll(): Promise<VaultDto[]> {
    try {
      const db = await this.db.getDb();
      return new Promise<VaultDto[]>((resolve, reject) => {
        const tx = db.transaction(STORES.VAULTS, 'readonly');
        const store = tx.objectStore(STORES.VAULTS);
        const req = store.getAll();
        req.onsuccess = () => {
          const list = (req.result as VaultDto[]).map((v) => normalizeVault(v, this.clock.now()));
          for (const v of list) this.memoryCache.set(v.id, v);
          resolve(list);
        };
        req.onerror = () => reject(req.error);
      });
    } catch {
      return Array.from(this.memoryCache.values()).map((v) => normalizeVault(v, this.clock.now()));
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
          const result = raw ? normalizeVault(raw, this.clock.now()) : null;
          if (result) this.memoryCache.set(result.id, result);
          resolve(result);
        };
        req.onerror = () => reject(req.error);
      });
    } catch {
      const cached = this.memoryCache.get(id);
      return cached ? normalizeVault(cached, this.clock.now()) : null;
    }
  }

  async findByKey(key: string): Promise<VaultDto | null> {
    const all = await this.findAll();
    return all.find((v) => v.key === key) ?? null;
  }

  async create(vault: VaultDto): Promise<VaultDto> {
    const normalized = normalizeVault(vault, this.clock.now());
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
    if (!existing) throw new AppError('vault.notFound', { vaultId: id });
    const updated = normalizeVault(
      applyUpdate(existing, updates, this.clock.now()),
      this.clock.now(),
    );
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
