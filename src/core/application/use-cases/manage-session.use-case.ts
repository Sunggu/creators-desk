import type { SessionRepository } from '../ports/session.repository';
import type { VaultRepository } from '../ports/vault.repository';

export class ManageSessionUseCase {
  private readonly sessionRepo: SessionRepository;
  private readonly vaultRepo: VaultRepository;

  constructor(sessionRepo: SessionRepository, vaultRepo: VaultRepository) {
    this.sessionRepo = sessionRepo;
    this.vaultRepo = vaultRepo;
  }

  async getInitialVaultId(): Promise<string | null> {
    const lastId = this.sessionRepo.getLastActiveVaultId();
    if (!lastId) return null;

    const exists = await this.vaultRepo.findById(lastId);
    if (!exists) {
      this.sessionRepo.setLastActiveVaultId(null);
      return null;
    }

    return lastId;
  }

  setActiveVaultId(vaultId: string | null): void {
    this.sessionRepo.setLastActiveVaultId(vaultId);
  }

  getLastActiveFileId(vaultId: string): string | null {
    return this.sessionRepo.getLastActiveFileId(vaultId);
  }

  setActiveFileId(vaultId: string, fileId: string | null): void {
    this.sessionRepo.setLastActiveFileId(vaultId, fileId);
  }
}
