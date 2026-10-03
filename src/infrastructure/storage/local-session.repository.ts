import type { SessionRepository } from '../../core/application/ports/session.repository';

const KEYS = {
  ACTIVE_VAULT: 'creators_desk_active_vault',
  ACTIVE_FILE_PREFIX: 'creators_desk_active_file_',
} as const;

export class LocalSessionRepository implements SessionRepository {
  getLastActiveVaultId(): string | null {
    if (typeof window === 'undefined' || !window.localStorage) return null;
    return window.localStorage.getItem(KEYS.ACTIVE_VAULT);
  }

  setLastActiveVaultId(vaultId: string | null): void {
    if (typeof window === 'undefined' || !window.localStorage) return;
    if (vaultId) {
      window.localStorage.setItem(KEYS.ACTIVE_VAULT, vaultId);
    } else {
      window.localStorage.removeItem(KEYS.ACTIVE_VAULT);
    }
  }

  getLastActiveFileId(vaultId: string): string | null {
    if (typeof window === 'undefined' || !window.localStorage) return null;
    return window.localStorage.getItem(`${KEYS.ACTIVE_FILE_PREFIX}${vaultId}`);
  }

  setLastActiveFileId(vaultId: string, fileId: string | null): void {
    if (typeof window === 'undefined' || !window.localStorage) return;
    const key = `${KEYS.ACTIVE_FILE_PREFIX}${vaultId}`;
    if (fileId) {
      window.localStorage.setItem(key, fileId);
    } else {
      window.localStorage.removeItem(key);
    }
  }
}

export const localSessionRepository = new LocalSessionRepository();
