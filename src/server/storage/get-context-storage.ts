import type { Context } from 'hono';
import type { AppContext } from '../bindings';
import {
  createCloudflareDbAdapter,
  createCloudflareStorageAdapter,
} from './cloudflare-adapters';
import type { DbAdapter } from './db-adapter';
import type { FileStorageAdapter } from './file-storage-adapter';
import {
  createLocalDbAdapter,
  createLocalFileStorageAdapter,
} from './local-adapters';

let cachedLocalDb: DbAdapter | null = null;
let cachedLocalStorage: FileStorageAdapter | null = null;

export function getContextStorage(c: Context<AppContext>): {
  db: DbAdapter;
  storage: FileStorageAdapter;
} {
  const customDb = c.get('customDb' as never) as DbAdapter | undefined;
  const customStorage = c.get('customStorage' as never) as
    | FileStorageAdapter
    | undefined;

  if (customDb && customStorage) {
    return { db: customDb, storage: customStorage };
  }

  if (c.env?.DB && c.env?.BUCKET) {
    return {
      db: createCloudflareDbAdapter(c.env.DB),
      storage: createCloudflareStorageAdapter(c.env.BUCKET),
    };
  }

  if (!cachedLocalDb || !cachedLocalStorage) {
    const dataDir = (typeof process !== 'undefined' && process.env?.DATA_DIR) || './data';
    cachedLocalDb = createLocalDbAdapter(`${dataDir}/creators.db`);
    cachedLocalStorage = createLocalFileStorageAdapter(`${dataDir}/vaults`);
  }

  return {
    db: cachedLocalDb,
    storage: cachedLocalStorage,
  };
}
