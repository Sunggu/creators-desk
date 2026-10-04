import type { VaultDto } from '../../domain/vault.dto';
import { byUpdatedAtDesc } from '../../domain/time/epoch-millis';
import type { VaultRepository } from '../ports/vault.repository';

export class ListVaultsUseCase {
  private readonly vaultRepo: VaultRepository;

  constructor(vaultRepo: VaultRepository) {
    this.vaultRepo = vaultRepo;
  }

  async execute(): Promise<VaultDto[]> {
    const vaults = await this.vaultRepo.findAll();
    // Ordered by raw epoch milliseconds: the sequence must not depend on the
    // viewer's locale or time zone.
    return [...vaults].sort(byUpdatedAtDesc);
  }
}
