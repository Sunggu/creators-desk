import type { VaultDto } from '../../domain/vault.dto';
import type { VaultRepository } from '../ports/vault.repository';

export class ListVaultsUseCase {
  private readonly vaultRepo: VaultRepository;

  constructor(vaultRepo: VaultRepository) {
    this.vaultRepo = vaultRepo;
  }

  async execute(): Promise<VaultDto[]> {
    const vaults = await this.vaultRepo.findAll();
    return [...vaults].sort((a, b) => b.updatedAt - a.updatedAt);
  }
}
