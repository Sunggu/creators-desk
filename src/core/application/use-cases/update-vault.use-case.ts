import type { UpdateVaultDto } from '../../domain/update-vault.dto';
import type { VaultDto } from '../../domain/vault.dto';
import type { VaultRepository } from '../ports/vault.repository';

export class UpdateVaultUseCase {
  private readonly vaultRepo: VaultRepository;

  constructor(vaultRepo: VaultRepository) {
    this.vaultRepo = vaultRepo;
  }

  async execute(id: string, dto: UpdateVaultDto): Promise<VaultDto> {
    const alias = (dto.alias || dto.name || '').trim();
    if (!alias) {
      throw new Error('Vault name cannot be empty');
    }

    return this.vaultRepo.update(id, {
      alias,
      name: alias,
      updatedAt: Date.now(),
    });
  }
}
