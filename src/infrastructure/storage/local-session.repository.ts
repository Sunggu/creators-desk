import type { SessionRepository } from '../../core/application/ports/session.repository';
import {
  parseWorkspaceUrl,
  syncWorkspaceUrlToHistory,
} from '../../utils/workspace-url';

const KEYS = {
  ACTIVE_VAULT: 'creators_desk_active_vault',
  ACTIVE_FILE_PREFIX: 'creators_desk_active_file_',
} as const;

export class LocalSessionRepository implements SessionRepository {
  getLastActiveVaultId(): string | null {
    if (typeof window !== 'undefined' && window.location?.search) {
      const fromUrl = parseWorkspaceUrl(window.location.search).vaultId;
      if (fromUrl) return fromUrl;
    }
    if (typeof window !== 'undefined' && window.sessionStorage) {
      const fromSession = window.sessionStorage.getItem(KEYS.ACTIVE_VAULT);
      if (fromSession) return fromSession;
    }
    if (typeof window !== 'undefined' && window.localStorage) {
      return window.localStorage.getItem(KEYS.ACTIVE_VAULT);
    }
    return null;
  }

  setLastActiveVaultId(vaultId: string | null): void {
    if (typeof window !== 'undefined') {
      if (vaultId) {
        window.sessionStorage?.setItem(KEYS.ACTIVE_VAULT, vaultId);
        window.localStorage?.setItem(KEYS.ACTIVE_VAULT, vaultId);
      } else {
        window.sessionStorage?.removeItem(KEYS.ACTIVE_VAULT);
        window.localStorage?.removeItem(KEYS.ACTIVE_VAULT);
      }
    }
    syncWorkspaceUrlToHistory(
      vaultId,
      vaultId ? this.getLastActiveFileId(vaultId) : null,
    );
  }

  getLastActiveFileId(vaultId: string): string | null {
    if (typeof window !== 'undefined' && window.location?.search) {
      const parsed = parseWorkspaceUrl(window.location.search);
      if (parsed.fileId && (parsed.vaultId === null || parsed.vaultId === vaultId)) {
        return parsed.fileId;
      }
    }
    const key = `${KEYS.ACTIVE_FILE_PREFIX}${vaultId}`;
    if (typeof window !== 'undefined' && window.sessionStorage) {
      const fromSession = window.sessionStorage.getItem(key);
      if (fromSession) return fromSession;
    }
    if (typeof window !== 'undefined' && window.localStorage) {
      return window.localStorage.getItem(key);
    }
    return null;
  }

  setLastActiveFileId(vaultId: string, fileId: string | null): void {
    const key = `${KEYS.ACTIVE_FILE_PREFIX}${vaultId}`;
    if (typeof window !== 'undefined') {
      if (fileId) {
        window.sessionStorage?.setItem(key, fileId);
        window.localStorage?.setItem(key, fileId);
      } else {
        window.sessionStorage?.removeItem(key);
        window.localStorage?.removeItem(key);
      }
    }
    syncWorkspaceUrlToHistory(vaultId, fileId);
  }
}

export const localSessionRepository = new LocalSessionRepository();
