import type { FileRepository } from '../../core/application/ports/file.repository';
import type { FileNodeDto } from '../../core/domain/file-node.dto';
import { idbDatabase, type IdbDatabase, STORES } from './idb-database';

export class IndexedDbFileRepository implements FileRepository {
  private readonly db: IdbDatabase;
  private readonly memoryCache = new Map<string, FileNodeDto>();

  constructor(db: IdbDatabase = idbDatabase) {
    this.db = db;
  }

  async findByVaultId(vaultId: string): Promise<FileNodeDto[]> {
    try {
      const db = await this.db.getDb();
      return new Promise<FileNodeDto[]>((resolve, reject) => {
        const tx = db.transaction(STORES.FILE_NODES, 'readonly');
        const store = tx.objectStore(STORES.FILE_NODES);
        const index = store.index('vaultId');
        const req = index.getAll(vaultId);
        req.onsuccess = () => {
          const list = req.result as FileNodeDto[];
          for (const item of list) this.memoryCache.set(item.id, item);
          resolve(list);
        };
        req.onerror = () => reject(req.error);
      });
    } catch {
      return Array.from(this.memoryCache.values()).filter((n) => n.vaultId === vaultId);
    }
  }

  async findById(id: string): Promise<FileNodeDto | null> {
    try {
      const db = await this.db.getDb();
      return new Promise<FileNodeDto | null>((resolve, reject) => {
        const tx = db.transaction(STORES.FILE_NODES, 'readonly');
        const store = tx.objectStore(STORES.FILE_NODES);
        const req = store.get(id);
        req.onsuccess = () => {
          const res = (req.result as FileNodeDto) || null;
          if (res) this.memoryCache.set(res.id, res);
          resolve(res);
        };
        req.onerror = () => reject(req.error);
      });
    } catch {
      return this.memoryCache.get(id) ?? null;
    }
  }

  async create(node: FileNodeDto): Promise<FileNodeDto> {
    this.memoryCache.set(node.id, node);
    try {
      const db = await this.db.getDb();
      return new Promise<FileNodeDto>((resolve, reject) => {
        const tx = db.transaction(STORES.FILE_NODES, 'readwrite');
        const store = tx.objectStore(STORES.FILE_NODES);
        const req = store.put(node);
        req.onsuccess = () => resolve(node);
        req.onerror = () => reject(req.error);
      });
    } catch {
      return node;
    }
  }

  async update(id: string, updates: Partial<FileNodeDto>): Promise<FileNodeDto> {
    const existing = await this.findById(id);
    if (!existing) {
      throw new Error(`FileNode ${id} not found`);
    }

    const updated: FileNodeDto = {
      ...existing,
      ...updates,
      updatedAt: Date.now(),
    };
    this.memoryCache.set(id, updated);

    try {
      const db = await this.db.getDb();
      return new Promise<FileNodeDto>((resolve, reject) => {
        const tx = db.transaction(STORES.FILE_NODES, 'readwrite');
        const store = tx.objectStore(STORES.FILE_NODES);
        const req = store.put(updated);
        req.onsuccess = () => resolve(updated);
        req.onerror = () => reject(req.error);
      });
    } catch {
      return updated;
    }
  }

  async delete(id: string): Promise<void> {
    this.memoryCache.delete(id);
    try {
      const db = await this.db.getDb();
      return new Promise<void>((resolve, reject) => {
        const tx = db.transaction(STORES.FILE_NODES, 'readwrite');
        const store = tx.objectStore(STORES.FILE_NODES);
        const req = store.delete(id);
        req.onsuccess = () => resolve();
        req.onerror = () => reject(req.error);
      });
    } catch {
      // Memory cache updated
    }
  }

  async deleteByVaultId(vaultId: string): Promise<void> {
    for (const [id, node] of this.memoryCache.entries()) {
      if (node.vaultId === vaultId) this.memoryCache.delete(id);
    }
    try {
      const nodes = await this.findByVaultId(vaultId);
      const db = await this.db.getDb();
      return new Promise<void>((resolve, reject) => {
        const tx = db.transaction(STORES.FILE_NODES, 'readwrite');
        const store = tx.objectStore(STORES.FILE_NODES);
        for (const node of nodes) {
          store.delete(node.id);
        }
        tx.oncomplete = () => resolve();
        tx.onerror = () => reject(tx.error);
      });
    } catch {
      // Memory cache updated
    }
  }
}
