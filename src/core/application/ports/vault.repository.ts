import type { VaultDto } from '../../domain/vault.dto';

export interface VaultRepository {
  findAll(): Promise<VaultDto[]>;
  findById(id: string): Promise<VaultDto | null>;
  create(vault: VaultDto): Promise<VaultDto>;
  delete(id: string): Promise<void>;
}
