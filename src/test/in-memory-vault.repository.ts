import type { VaultRepository } from '../core/application/ports/vault.repository';
import type { VaultDto } from '../core/domain/vault.dto';

/** In-memory `VaultRepository` for use-case tests. */
export class InMemoryVaultRepository implements VaultRepository {
  private vaults = new Map<string, VaultDto>();

  async findAll(): Promise<VaultDto[]> {
    return Array.from(this.vaults.values());
  }
  async findById(id: string): Promise<VaultDto | null> {
    return this.vaults.get(id) ?? null;
  }
  async findByKey(key: string): Promise<VaultDto | null> {
    return Array.from(this.vaults.values()).find((v) => v.key === key) ?? null;
  }
  async create(vault: VaultDto): Promise<VaultDto> {
    this.vaults.set(vault.id, vault);
    return vault;
  }
  async update(id: string, updates: Partial<VaultDto>): Promise<VaultDto> {
    const existing = this.vaults.get(id);
    if (!existing) throw new Error('Not found');
    const updated = { ...existing, ...updates };
    this.vaults.set(id, updated);
    return updated;
  }
  async delete(id: string): Promise<void> {
    this.vaults.delete(id);
  }
}