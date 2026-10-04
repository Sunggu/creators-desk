import { existsSync, mkdirSync, readFileSync, unlinkSync, writeFileSync } from 'node:fs';
import { dirname, join } from 'node:path';
import { DatabaseSync } from 'node:sqlite';
import type { DbAdapter } from './db-adapter';
import type { FileStorageAdapter } from './file-storage-adapter';

export function createLocalDbAdapter(dbPath: string): DbAdapter {
  const dir = dirname(dbPath);
  if (dir && !existsSync(dir)) {
    mkdirSync(dir, { recursive: true });
  }

  const db = new DatabaseSync(dbPath);

  // Initialize SQLite tables if not present
  db.exec(`
    CREATE TABLE IF NOT EXISTS vaults (
      id TEXT PRIMARY KEY,
      key TEXT UNIQUE NOT NULL,
      alias TEXT NOT NULL,
      created_at INTEGER NOT NULL,
      updated_at INTEGER NOT NULL
    );
    CREATE TABLE IF NOT EXISTS file_nodes (
      id TEXT PRIMARY KEY,
      vault_key TEXT NOT NULL,
      parent_id TEXT,
      name TEXT NOT NULL,
      type TEXT NOT NULL,
      r2_key TEXT,
      size INTEGER DEFAULT 0,
      created_at INTEGER NOT NULL,
      updated_at INTEGER NOT NULL
    );
    CREATE TABLE IF NOT EXISTS links (
      id TEXT PRIMARY KEY,
      vault_key TEXT NOT NULL,
      source_file_id TEXT NOT NULL,
      target_file_name TEXT NOT NULL,
      target_file_id TEXT
    );
    CREATE VIRTUAL TABLE IF NOT EXISTS notes_fts USING fts5(
      file_id UNINDEXED,
      vault_key UNINDEXED,
      title,
      content
    );
  `);

  return {
    async all<T = Record<string, unknown>>(sql: string, params: unknown[] = []): Promise<T[]> {
      const stmt = db.prepare(sql);
      const rows = stmt.all(...(params as (string | number | bigint | null)[]));
      return (rows as T[]) || [];
    },
    async first<T = Record<string, unknown>>(sql: string, params: unknown[] = []): Promise<T | null> {
      const stmt = db.prepare(sql);
      const row = stmt.get(...(params as (string | number | bigint | null)[]));
      return (row as T) || null;
    },
    async run(sql: string, params: unknown[] = []): Promise<{ changes?: number }> {
      const stmt = db.prepare(sql);
      const result = stmt.run(...(params as (string | number | bigint | null)[]));
      return { changes: Number(result.changes) };
    },
  };
}

export function createLocalFileStorageAdapter(baseDir: string): FileStorageAdapter {
  if (!existsSync(baseDir)) {
    mkdirSync(baseDir, { recursive: true });
  }

  return {
    async get(key: string): Promise<string | null> {
      const filePath = join(baseDir, key);
      if (!existsSync(filePath)) return null;
      return readFileSync(filePath, 'utf-8');
    },
    async put(key: string, content: string): Promise<void> {
      const filePath = join(baseDir, key);
      const parentDir = dirname(filePath);
      if (!existsSync(parentDir)) {
        mkdirSync(parentDir, { recursive: true });
      }
      writeFileSync(filePath, content, 'utf-8');
    },
    async delete(key: string): Promise<void> {
      const filePath = join(baseDir, key);
      if (existsSync(filePath)) {
        unlinkSync(filePath);
      }
    },
  };
}
