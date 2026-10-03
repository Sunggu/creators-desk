import type { FileRepository } from '../ports/file.repository';
import type { SessionRepository } from '../ports/session.repository';
import type { VaultRepository } from '../ports/vault.repository';

export class DeleteVaultUseCase {
  private readonly vaultRepo: VaultRepository;
  private readonly fileRepo?: FileRepository;
  private readonly sessionRepo?: SessionRepository;

  constructor(
    vaultRepo: VaultRepository,
    fileRepo?: FileRepository,
    sessionRepo?: SessionRepository,
  ) {
    this.vaultRepo = vaultRepo;
    this.fileRepo = fileRepo;
    this.sessionRepo = sessionRepo;
  }

  async execute(id: string): Promise<void> {
    await this.vaultRepo.delete(id);

    if (this.fileRepo) {
      await this.fileRepo.deleteByVaultId(id);
    }

    if (this.sessionRepo && this.sessionRepo.getLastActiveVaultId() === id) {
      this.sessionRepo.setLastActiveVaultId(null);
    }
  }
}
