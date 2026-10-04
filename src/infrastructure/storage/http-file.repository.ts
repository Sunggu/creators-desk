import type { FileRepository } from '../../core/application/ports/file.repository';
import type { Clock } from '../../core/application/ports/clock.port';
import type { FileNodeDto } from '../../core/domain/file-node.dto';
import { AppError } from '../../core/domain/errors/app-error';
import { systemClock } from './system-clock';
import { applyUpdate } from './timestamps';

export class HttpFileRepository implements FileRepository {
  private readonly baseUrl: string;
  private readonly cache = new Map<string, FileNodeDto>();
  private readonly fallback?: FileRepository;
  private readonly clock: Clock;

  constructor(
    baseUrl: string = '/api/vaults',
    fallback?: FileRepository,
    clock: Clock = systemClock,
  ) {
    this.baseUrl = baseUrl;
    this.fallback = fallback;
    this.clock = clock;
  }

  async findByVaultId(vaultId: string): Promise<FileNodeDto[]> {
    try {
      const res = await fetch(`${this.baseUrl}/${vaultId}/files`);
      if (!res.ok) throw new Error(`Failed to fetch files for vault ${vaultId}: ${res.statusText}`);
      const list = (await res.json()) as FileNodeDto[];
      for (const item of list) {
        const existing = this.cache.get(item.id);
        this.cache.set(item.id, { ...item, content: existing?.content });
      }
      return list;
    } catch (err) {
      if (this.fallback) return this.fallback.findByVaultId(vaultId);
      throw err;
    }
  }

  async findById(id: string): Promise<FileNodeDto | null> {
    const cached = this.cache.get(id);
    if (!cached && this.fallback) {
      return this.fallback.findById(id);
    }
    if (!cached) return null;

    if (cached.type === 'file' && cached.content === undefined) {
      try {
        const res = await fetch(`${this.baseUrl}/${cached.vaultId}/files/${id}/content`);
        if (res.ok) {
          cached.content = await res.text();
          this.cache.set(id, cached);
        }
      } catch (err) {
        if (this.fallback) return this.fallback.findById(id);
        throw err;
      }
    }

    return cached;
  }

  async create(node: FileNodeDto): Promise<FileNodeDto> {
    try {
      const res = await fetch(`${this.baseUrl}/${node.vaultId}/files`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name: node.name,
          type: node.type,
          parentId: node.parentId ?? null,
        }),
      });

      if (!res.ok) throw new Error(`Failed to create file node: ${res.statusText}`);

      const created = (await res.json()) as FileNodeDto;
      created.content = node.content ?? '';

      if (node.type === 'file' && node.content) {
        await fetch(`${this.baseUrl}/${node.vaultId}/files/${created.id}/content`, {
          method: 'PUT',
          headers: { 'Content-Type': 'text/plain; charset=utf-8' },
          body: node.content,
        });
      }

      this.cache.set(created.id, created);
      return created;
    } catch (err) {
      if (this.fallback) return this.fallback.create(node);
      throw err;
    }
  }

  async update(id: string, updates: Partial<FileNodeDto>): Promise<FileNodeDto> {
    const existing = this.cache.get(id);
    if (!existing && this.fallback) {
      return this.fallback.update(id, updates);
    }
    if (!existing) throw new AppError('file.notFound', { fileId: id });

    try {
      if (updates.name !== undefined || updates.parentId !== undefined) {
        const res = await fetch(`${this.baseUrl}/${existing.vaultId}/files/${id}`, {
          method: 'PATCH',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ name: updates.name, parentId: updates.parentId }),
        });
        if (!res.ok) throw new Error(`Failed to update file node ${id}: ${res.statusText}`);
      }

      if (updates.content !== undefined) {
        const res = await fetch(`${this.baseUrl}/${existing.vaultId}/files/${id}/content`, {
          method: 'PUT',
          headers: { 'Content-Type': 'text/plain; charset=utf-8' },
          body: updates.content,
        });
        if (!res.ok) throw new Error(`Failed to save file content for ${id}: ${res.statusText}`);
      }

      const updated = applyUpdate(existing, updates, this.clock.now());
      this.cache.set(id, updated);
      return updated;
    } catch (err) {
      if (this.fallback) return this.fallback.update(id, updates);
      throw err;
    }
  }

  async delete(id: string): Promise<void> {
    const existing = this.cache.get(id);
    if (!existing && this.fallback) {
      return this.fallback.delete(id);
    }
    if (!existing) return;

    try {
      const res = await fetch(`${this.baseUrl}/${existing.vaultId}/files/${id}`, {
        method: 'DELETE',
      });
      if (!res.ok) throw new Error(`Failed to delete file node ${id}: ${res.statusText}`);
      this.cache.delete(id);
    } catch (err) {
      if (this.fallback) return this.fallback.delete(id);
      throw err;
    }
  }

  async deleteByVaultId(vaultId: string): Promise<void> {
    for (const [id, item] of this.cache.entries()) {
      if (item.vaultId === vaultId) this.cache.delete(id);
    }
    if (this.fallback) {
      await this.fallback.deleteByVaultId(vaultId);
    }
  }
}
