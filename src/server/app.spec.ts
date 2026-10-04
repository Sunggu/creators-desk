import { describe, expect, it } from 'vitest';
import { app } from './app';

describe('Hono Server API (Dual-Target)', () => {
  it('responds with 200 OK on /api/health', async () => {
    const res = await app.request('/api/health');
    expect(res.status).toBe(200);
    const body = await res.json<{ status: string; runtime: string }>();
    expect(body.status).toBe('ok');
    expect(body.runtime).toBe('universal-hono');
  });

  it('runs seamlessly in local standalone mode without Cloudflare bindings', async () => {
    // 1. Create a vault in local standalone mode
    const createRes = await app.request('/api/vaults', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ alias: 'Local Standalone Vault' }),
    });
    expect(createRes.status).toBe(201);
    const created = await createRes.json<{ key: string; alias: string }>();
    expect(created.alias).toBe('Local Standalone Vault');
    expect(created.key).toMatch(/^vlt_/);

    // 2. Query vault by key
    const getRes = await app.request(`/api/vaults/${created.key}`);
    expect(getRes.status).toBe(200);
    const fetched = await getRes.json<{ key: string; alias: string }>();
    expect(fetched.alias).toBe('Local Standalone Vault');

    // 3. Rename vault alias (O(1))
    const patchRes = await app.request(`/api/vaults/${created.key}`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ alias: 'Renamed Standalone' }),
    });
    expect(patchRes.status).toBe(200);

    const getRenamed = await app.request(`/api/vaults/${created.key}`);
    const renamed = await getRenamed.json<{ alias: string }>();
    expect(renamed.alias).toBe('Renamed Standalone');
  });

  it('works with Cloudflare D1 and R2 bindings when provided', async () => {
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
                return { meta: { changes: 1 } };
              },
              async first() {
                const key = args[0];
                return mockStorage.find((s) => s.key === key || s.id === key) ?? null;
              },
              async all() {
                return { results: mockStorage };
              },
            };
          },
          async all() {
            return { results: mockStorage };
          },
        };
      },
    };

    const mockBucket = {
      async get() { return null; },
      async put() {},
      async delete() {},
    };

    const env = {
      DB: mockD1 as unknown as D1Database,
      BUCKET: mockBucket as unknown as R2Bucket,
    };

    const createRes = await app.request(
      '/api/vaults',
      {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ alias: 'Cloud D1 Vault' }),
      },
      env,
    );
    expect(createRes.status).toBe(201);
    const created = await createRes.json<{ key: string; alias: string }>();
    expect(created.alias).toBe('Cloud D1 Vault');
    expect(created.key).toMatch(/^vlt_/);
  });
});
