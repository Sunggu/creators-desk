import type { FileNodeDto } from '../core/domain/file-node.dto';
import type { FileRepository } from '../core/application/ports/file.repository';

/** In-memory `FileRepository` for use-case tests. Exposes storage for assertions. */
export class InMemoryFileRepository implements FileRepository {
  public files = new Map<string, FileNodeDto>();

  async findByVaultId(vaultId: string): Promise<FileNodeDto[]> {
    return Array.from(this.files.values()).filter((f) => f.vaultId === vaultId);
  }
  async findById(id: string): Promise<FileNodeDto | null> {
    return this.files.get(id) ?? null;
  }
  async create(node: FileNodeDto): Promise<FileNodeDto> {
    this.files.set(node.id, node);
    return node;
  }
  async update(id: string, updates: Partial<FileNodeDto>): Promise<FileNodeDto> {
    const existing = this.files.get(id);
    if (!existing) throw new Error('Not found');
    const updated = { ...existing, ...updates };
    this.files.set(id, updated);
    return updated;
  }
  async delete(id: string): Promise<void> {
    this.files.delete(id);
  }
  async deleteByVaultId(vaultId: string): Promise<void> {
    for (const [id, f] of this.files.entries()) {
      if (f.vaultId === vaultId) this.files.delete(id);
    }
  }
}