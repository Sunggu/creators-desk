import type { SessionRepository } from '../core/application/ports/session.repository';

/** In-memory `SessionRepository` for use-case tests. */
export class InMemorySessionRepository implements SessionRepository {
  private activeVault: string | null = null;
  private activeFiles = new Map<string, string | null>();

  getLastActiveVaultId(): string | null {
    return this.activeVault;
  }
  setLastActiveVaultId(vaultId: string | null): void {
    this.activeVault = vaultId;
  }
  getLastActiveFileId(vaultId: string): string | null {
    return this.activeFiles.get(vaultId) ?? null;
  }
  setLastActiveFileId(vaultId: string, fileId: string | null): void {
    this.activeFiles.set(vaultId, fileId);
  }
}