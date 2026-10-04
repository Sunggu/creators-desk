import { describe, expect, it } from 'vitest';
import { app } from './app';

describe('Hono Server API', () => {
  it('responds with 200 OK on /api/health', async () => {
    const res = await app.request('/api/health');
    expect(res.status).toBe(200);
    const body = await res.json<{ status: string; runtime: string }>();
    expect(body.status).toBe('ok');
    expect(body.runtime).toBe('universal-hono');
  });

  it('handles missing D1 binding gracefully with 503', async () => {
    const res = await app.request('/api/vaults');
    expect(res.status).toBe(503);
    const body = await res.json<{ error: string }>();
    expect(body.error).toContain('D1');
  });

  it('creates and lists vaults using mock D1 bindings', async () => {
    const mockStorage: Array<Record<string, unknown>> = [];
    const mockD1 = {
      prepare(query: string) {
        return {
          bind(...args: unknown[]) {
            return {
              async run() {
                if (query.includes('INSERT INTO vaults')) {
                  mockStorage.push({
                    id: args[0],
                    key: args[1],
                    alias: args[2],
                    name: args[2],
                    created_at: args[3],
                    updated_at: args[4],
                  });
                }
                return { success: true };
              },
              async first() {
                const key = args[0];
                return mockStorage.find((s) => s.key === key || s.id === key) ?? null;
              },
            };
          },
          async all() {
            return { results: mockStorage };
          },
        };
      },
    };

    const env = { DB: mockD1 as unknown as D1Database };

    // 1. Create a vault
    const createRes = await app.request(
      '/api/vaults',
      {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ alias: 'Cloud Lore Vault' }),
      },
      env,
    );
    expect(createRes.status).toBe(201);
    const created = await createRes.json<{ key: string; alias: string }>();
    expect(created.alias).toBe('Cloud Lore Vault');
    expect(created.key).toMatch(/^vlt_/);

    // 2. List vaults
    const listRes = await app.request('/api/vaults', {}, env);
    expect(listRes.status).toBe(200);
    const list = await listRes.json<Array<{ key: string; alias: string }>>();
    expect(list).toHaveLength(1);
    expect(list[0].key).toBe(created.key);
  });
});
