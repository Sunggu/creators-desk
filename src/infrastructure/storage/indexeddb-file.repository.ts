import type { FileRepository } from '../../core/application/ports/file.repository';
import type { FileNodeDto } from '../../core/domain/file-node.dto';
import { idbDatabase, type IdbDatabase, STORES } from './idb-database';

export class IndexedDbFileRepository implements FileRepository {
  private readonly db: IdbDatabase;

  constructor(db: IdbDatabase = idbDatabase) {
    this.db = db;
  }

  async findByVaultId(vaultId: string): Promise<FileNodeDto[]> {
    return this.db.runTransaction(STORES.FILE_NODES, 'readonly', (store) => {
      return new Promise<FileNodeDto[]>((resolve, reject) => {
        const index = store.index('vaultId');
        const req = index.getAll(vaultId);
        req.onsuccess = () => resolve(req.result as FileNodeDto[]);
        req.onerror = () => reject(req.error);
      });
    });
  }

  async findById(id: string): Promise<FileNodeDto | null> {
    return this.db.runTransaction(STORES.FILE_NODES, 'readonly', (store) => {
      return new Promise<FileNodeDto | null>((resolve, reject) => {
        const req = store.get(id);
        req.onsuccess = () => resolve((req.result as FileNodeDto) || null);
        req.onerror = () => reject(req.error);
      });
    });
  }

  async create(node: FileNodeDto): Promise<FileNodeDto> {
    return this.db.runTransaction(STORES.FILE_NODES, 'readwrite', (store) => {
      return new Promise<FileNodeDto>((resolve, reject) => {
        const req = store.put(node);
        req.onsuccess = () => resolve(node);
        req.onerror = () => reject(req.error);
      });
    });
  }

  async update(id: string, updates: Partial<FileNodeDto>): Promise<FileNodeDto> {
    return this.db.runTransaction(STORES.FILE_NODES, 'readwrite', (store) => {
      return new Promise<FileNodeDto>((resolve, reject) => {
        const getReq = store.get(id);
        getReq.onerror = () => reject(getReq.error);
        getReq.onsuccess = () => {
          const current = getReq.result as FileNodeDto;
          if (!current) {
            reject(new Error(`FileNode ${id} not found`));
            return;
          }
          const updated = { ...current, ...updates, updatedAt: Date.now() };
          const putReq = store.put(updated);
          putReq.onsuccess = () => resolve(updated);
          putReq.onerror = () => reject(putReq.error);
        };
      });
    });
  }

  async delete(id: string): Promise<void> {
    return this.db.runTransaction(STORES.FILE_NODES, 'readwrite', (store) => {
      return new Promise<void>((resolve, reject) => {
        const req = store.delete(id);
        req.onsuccess = () => resolve();
        req.onerror = () => reject(req.error);
      });
    });
  }

  async deleteByVaultId(vaultId: string): Promise<void> {
    const nodes = await this.findByVaultId(vaultId);
    return this.db.runTransaction(STORES.FILE_NODES, 'readwrite', (store) => {
      return new Promise<void>((resolve) => {
        for (const node of nodes) {
          store.delete(node.id);
        }
        resolve();
      });
    });
  }
}
