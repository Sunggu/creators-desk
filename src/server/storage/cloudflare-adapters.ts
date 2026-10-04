import type { DbAdapter } from './db-adapter';
import type { FileStorageAdapter } from './file-storage-adapter';

export function createCloudflareDbAdapter(d1: D1Database): DbAdapter {
  return {
    async all<T = Record<string, unknown>>(sql: string, params: unknown[] = []): Promise<T[]> {
      const stmt = d1.prepare(sql);
      const bound = params.length > 0 ? stmt.bind(...params) : stmt;
      const { results } = await bound.all();
      return (results as T[]) || [];
    },
    async first<T = Record<string, unknown>>(sql: string, params: unknown[] = []): Promise<T | null> {
      const stmt = d1.prepare(sql);
      const bound = params.length > 0 ? stmt.bind(...params) : stmt;
      const result = await bound.first();
      return (result as T) || null;
    },
    async run(sql: string, params: unknown[] = []): Promise<{ changes?: number }> {
      const stmt = d1.prepare(sql);
      const bound = params.length > 0 ? stmt.bind(...params) : stmt;
      const res = await bound.run();
      return { changes: res.meta?.changes };
    },
  };
}

export function createCloudflareStorageAdapter(bucket: R2Bucket): FileStorageAdapter {
  return {
    async get(key: string): Promise<string | null> {
      const obj = await bucket.get(key);
      if (!obj) return null;
      return obj.text();
    },
    async put(key: string, content: string): Promise<void> {
      await bucket.put(key, content, {
        httpMetadata: { contentType: 'text/markdown; charset=utf-8' },
      });
    },
    async delete(key: string): Promise<void> {
      await bucket.delete(key);
    },
  };
}
