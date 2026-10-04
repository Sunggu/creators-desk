import type { CreateVaultDto } from '../../domain/create-vault.dto';
import type { VaultDto } from '../../domain/vault.dto';
import type { FileRepository } from '../ports/file.repository';
import type { VaultRepository } from '../ports/vault.repository';

export class CreateVaultUseCase {
  private readonly vaultRepo: VaultRepository;
  private readonly fileRepo?: FileRepository;

  constructor(vaultRepo: VaultRepository, fileRepo?: FileRepository) {
    this.vaultRepo = vaultRepo;
    this.fileRepo = fileRepo;
  }

  async execute(dto: CreateVaultDto): Promise<VaultDto> {
    const alias = (dto.alias || dto.name || '').trim();
    if (!alias) {
      throw new Error('Vault name cannot be empty');
    }

    const now = Date.now();
    const vaultId = typeof crypto !== 'undefined' && crypto.randomUUID
      ? crypto.randomUUID()
      : `vault-${now}-${Math.random().toString(36).substring(2, 9)}`;

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
      const starterId = typeof crypto !== 'undefined' && crypto.randomUUID
        ? crypto.randomUUID()
        : `file-${now}-${Math.random().toString(36).substring(2, 9)}`;

      await this.fileRepo.create({
        id: starterId,
        vaultId: saved.id,
        parentId: null,
        name: 'Welcome.md',
        type: 'file',
        content: `Welcome to ${saved.alias}\n\nThis is your first note in Creators Desk.\n\n- Plain markdown editing\n- Fast & distraction-free\n- Automatically saved\n`,
        createdAt: now,
        updatedAt: now,
      });
    }

    return saved;
  }
}
