export interface SessionRepository {
  getLastActiveVaultId(): string | null;
  setLastActiveVaultId(vaultId: string | null): void;
  getLastActiveFileId(vaultId: string): string | null;
  setLastActiveFileId(vaultId: string, fileId: string | null): void;
}
