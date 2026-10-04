import { afterAll, describe, expect, it } from 'vitest';
import { rmSync } from 'node:fs';
import { join } from 'node:path';
import { createLocalDbAdapter, createLocalFileStorageAdapter } from './local-adapters';

const TEST_DIR = join(process.cwd(), '.tmp-test-storage');

describe('Local Adapters (SQLite & Filesystem)', () => {
  afterAll(() => {
    try {
      rmSync(TEST_DIR, { recursive: true, force: true });
    } catch {
      // ignore cleanup errors
    }
  });

  it('initializes SQLite tables and executes CRUD operations', async () => {
    const db = createLocalDbAdapter(':memory:');

    // Insert a vault
    await db.run(
      'INSERT INTO vaults (id, key, alias, created_at, updated_at) VALUES (?, ?, ?, ?, ?)',
      ['v1', 'vlt_test', 'Local Vault', 1000, 1000],
    );

    // Query vault
    const vault = await db.first<{ key: string; alias: string }>(
      'SELECT key, alias FROM vaults WHERE key = ?',
      ['vlt_test'],
    );
    expect(vault?.alias).toBe('Local Vault');

    // Update alias
    await db.run('UPDATE vaults SET alias = ? WHERE key = ?', ['Renamed Vault', 'vlt_test']);
    const updated = await db.first<{ alias: string }>('SELECT alias FROM vaults WHERE key = ?', ['vlt_test']);
    expect(updated?.alias).toBe('Renamed Vault');
  });

  it('stores, retrieves, and deletes files in local directory', async () => {
    const storage = createLocalFileStorageAdapter(TEST_DIR);

    // Put file
    await storage.put('vaults/vlt_test/files/note1.md', '# Hello Local File');

    // Get file
    const content = await storage.get('vaults/vlt_test/files/note1.md');
    expect(content).toBe('# Hello Local File');

    // Delete file
    await storage.delete('vaults/vlt_test/files/note1.md');
    const deleted = await storage.get('vaults/vlt_test/files/note1.md');
    expect(deleted).toBeNull();
  });
});
