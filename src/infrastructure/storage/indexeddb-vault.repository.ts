import type { VaultRepository } from '../../core/application/ports/vault.repository';
import type { VaultDto } from '../../core/domain/vault.dto';
import { idbDatabase, type IdbDatabase, STORES } from './idb-database';

export class IndexedDbVaultRepository implements VaultRepository {
  private readonly db: IdbDatabase;

  constructor(db: IdbDatabase = idbDatabase) {
    this.db = db;
  }

  async findAll(): Promise<VaultDto[]> {
    return this.db.runTransaction(STORES.VAULTS, 'readonly', (store) => {
      return new Promise<VaultDto[]>((resolve, reject) => {
        const req = store.getAll();
        req.onsuccess = () => resolve(req.result as VaultDto[]);
        req.onerror = () => reject(req.error);
      });
    });
  }

  async findById(id: string): Promise<VaultDto | null> {
    return this.db.runTransaction(STORES.VAULTS, 'readonly', (store) => {
      return new Promise<VaultDto | null>((resolve, reject) => {
        const req = store.get(id);
        req.onsuccess = () => resolve((req.result as VaultDto) || null);
        req.onerror = () => reject(req.error);
      });
    });
  }

  async create(vault: VaultDto): Promise<VaultDto> {
    return this.db.runTransaction(STORES.VAULTS, 'readwrite', (store) => {
      return new Promise<VaultDto>((resolve, reject) => {
        const req = store.put(vault);
        req.onsuccess = () => resolve(vault);
        req.onerror = () => reject(req.error);
      });
    });
  }

  async delete(id: string): Promise<void> {
    return this.db.runTransaction(STORES.VAULTS, 'readwrite', (store) => {
      return new Promise<void>((resolve, reject) => {
        const req = store.delete(id);
        req.onsuccess = () => resolve();
        req.onerror = () => reject(req.error);
      });
    });
  }
}
