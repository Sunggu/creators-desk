const DB_NAME = 'creators_desk_db';
const DB_VERSION = 1;

export const STORES = {
  VAULTS: 'vaults',
  FILE_NODES: 'file_nodes',
} as const;

export class IdbDatabase {
  private dbPromise: Promise<IDBDatabase> | null = null;

  async getDb(): Promise<IDBDatabase> {
    if (typeof window === 'undefined' || !window.indexedDB) {
      throw new Error('IndexedDB is not supported in this environment');
    }

    if (!this.dbPromise) {
      this.dbPromise = new Promise((resolve, reject) => {
        const request = window.indexedDB.open(DB_NAME, DB_VERSION);

        request.onupgradeneeded = (event) => {
          const db = (event.target as IDBOpenDBRequest).result;

          if (!db.objectStoreNames.contains(STORES.VAULTS)) {
            db.createObjectStore(STORES.VAULTS, { keyPath: 'id' });
          }

          if (!db.objectStoreNames.contains(STORES.FILE_NODES)) {
            const store = db.createObjectStore(STORES.FILE_NODES, { keyPath: 'id' });
            store.createIndex('vaultId', 'vaultId', { unique: false });
            store.createIndex('parentId', 'parentId', { unique: false });
          }
        };

        request.onsuccess = () => resolve(request.result);
        request.onerror = () => reject(request.error);
      });
    }

    return this.dbPromise;
  }

  async runTransaction<T>(
    storeName: string,
    mode: IDBTransactionMode,
    operation: (store: IDBObjectStore) => Promise<T> | T,
  ): Promise<T> {
    const db = await this.getDb();
    return new Promise((resolve, reject) => {
      const tx = db.transaction(storeName, mode);
      const store = tx.objectStore(storeName);

      let result: T;
      Promise.resolve()
        .then(() => operation(store))
        .then((res) => {
          result = res;
        })
        .catch(reject);

      tx.oncomplete = () => resolve(result);
      tx.onerror = () => reject(tx.error);
      tx.onabort = () => reject(tx.error);
    });
  }
}

export const idbDatabase = new IdbDatabase();
