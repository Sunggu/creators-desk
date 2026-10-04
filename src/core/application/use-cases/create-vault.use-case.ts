import type { Clock } from '../ports/clock.port';
import type { CreateVaultDto } from '../../domain/create-vault.dto';
import type { VaultDto } from '../../domain/vault.dto';
import { AppError } from '../../domain/errors/app-error';
import type { FileRepository } from '../ports/file.repository';
import type { VaultRepository } from '../ports/vault.repository';
import { generateId } from '../../domain/generate-id';
import { DEFAULT_STARTER_FILE_NAME } from '../../domain/vault.dto';

export class CreateVaultUseCase {
  private readonly vaultRepo: VaultRepository;
  private readonly fileRepo?: FileRepository;
  private readonly clock: Clock;

  constructor(vaultRepo: VaultRepository, clock: Clock, fileRepo?: FileRepository) {
    this.vaultRepo = vaultRepo;
    this.fileRepo = fileRepo;
    this.clock = clock;
  }

  async execute(dto: CreateVaultDto): Promise<VaultDto> {
    const alias = (dto.alias || dto.name || '').trim();
    if (!alias) {
      throw new AppError('vault.nameRequired');
    }

    // Every timestamp written here is epoch milliseconds (UTC). Nothing in the
    // application layer formats or offsets it.
    const now = this.clock.now();
    const vaultId = generateId('vault');

    const key = dto.key?.trim() || `vlt_${vaultId.replace(/[^a-zA-Z0-9]/g, '').slice(0, 12)}`;

    const vault: VaultDto = {
      id: vaultId,
      key,
      alias,
      name: alias,
      createdAt: now,
      updatedAt: now,
    };

    const saved = await this.vaultRepo.create(vault);

    if (this.fileRepo) {
      await this.fileRepo.create({
        id: generateId('file'),
        vaultId: saved.id,
        parentId: null,
        name: dto.starterFileName ?? DEFAULT_STARTER_FILE_NAME,
        type: 'file',
        content: dto.starterContent ?? '',
        createdAt: now,
        updatedAt: now,
      });
    }

    return saved;
  }
}