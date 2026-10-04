import type { Clock } from '../ports/clock.port';
import type { UpdateVaultDto } from '../../domain/update-vault.dto';
import type { VaultDto } from '../../domain/vault.dto';
import { AppError } from '../../domain/errors/app-error';
import type { VaultRepository } from '../ports/vault.repository';

export class UpdateVaultUseCase {
  private readonly vaultRepo: VaultRepository;
  private readonly clock: Clock;

  constructor(vaultRepo: VaultRepository, clock: Clock) {
    this.vaultRepo = vaultRepo;
    this.clock = clock;
  }

  async execute(id: string, dto: UpdateVaultDto): Promise<VaultDto> {
    const alias = (dto.alias || dto.name || '').trim();
    if (!alias) {
      throw new AppError('vault.nameRequired');
    }

    // The use case owns the timestamp; the repository must not overwrite it.
    return this.vaultRepo.update(id, {
      alias,
      name: alias,
      updatedAt: this.clock.now(),
    });
  }
}
