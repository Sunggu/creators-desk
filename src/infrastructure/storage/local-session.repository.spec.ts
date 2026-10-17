import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { LocalSessionRepository } from './local-session.repository';

describe('LocalSessionRepository', () => {
  let repo: LocalSessionRepository;
  let mockSessionStorage: Record<string, string>;
  let mockLocalStorage: Record<string, string>;
  let replaceStateMock: ReturnType<typeof vi.fn>;

  beforeEach(() => {
    repo = new LocalSessionRepository();
    mockSessionStorage = {};
    mockLocalStorage = {};
    replaceStateMock = vi.fn();

    vi.stubGlobal('window', {
      location: { pathname: '/', search: '' },
      history: { replaceState: replaceStateMock },
      sessionStorage: {
        getItem: (k: string) => mockSessionStorage[k] ?? null,
        setItem: (k: string, v: string) => {
          mockSessionStorage[k] = v;
        },
        removeItem: (k: string) => {
          delete mockSessionStorage[k];
        },
      },
      localStorage: {
        getItem: (k: string) => mockLocalStorage[k] ?? null,
        setItem: (k: string, v: string) => {
          mockLocalStorage[k] = v;
        },
        removeItem: (k: string) => {
          delete mockLocalStorage[k];
        },
      },
    });
  });

  afterEach(() => {
    vi.unstubAllGlobals();
  });

  describe('getLastActiveVaultId', () => {
    it('prioritizes URL query over session and local storage', () => {
      window.location.search = '?vault=url-vault';
      mockSessionStorage['creators_desk_active_vault'] = 'session-vault';
      mockLocalStorage['creators_desk_active_vault'] = 'local-vault';

      expect(repo.getLastActiveVaultId()).toBe('url-vault');
    });

    it('falls back to sessionStorage when URL query is absent', () => {
      window.location.search = '';
      mockSessionStorage['creators_desk_active_vault'] = 'session-vault';
      mockLocalStorage['creators_desk_active_vault'] = 'local-vault';

      expect(repo.getLastActiveVaultId()).toBe('session-vault');
    });

    it('falls back to localStorage when sessionStorage is empty', () => {
      window.location.search = '';
      mockLocalStorage['creators_desk_active_vault'] = 'local-vault';

      expect(repo.getLastActiveVaultId()).toBe('local-vault');
    });

    it('returns null when all storages are empty', () => {
      window.location.search = '';
      expect(repo.getLastActiveVaultId()).toBeNull();
    });
  });

  describe('setLastActiveVaultId', () => {
    it('sets both sessionStorage and localStorage and syncs URL', () => {
      repo.setLastActiveVaultId('v1');
      expect(mockSessionStorage['creators_desk_active_vault']).toBe('v1');
      expect(mockLocalStorage['creators_desk_active_vault']).toBe('v1');
      expect(replaceStateMock).toHaveBeenCalledWith(null, '', '/?vault=v1');
    });

    it('removes from both when vaultId is null', () => {
      mockSessionStorage['creators_desk_active_vault'] = 'v1';
      mockLocalStorage['creators_desk_active_vault'] = 'v1';

      repo.setLastActiveVaultId(null);
      expect(mockSessionStorage['creators_desk_active_vault']).toBeUndefined();
      expect(mockLocalStorage['creators_desk_active_vault']).toBeUndefined();
    });
  });

  describe('getLastActiveFileId', () => {
    it('prioritizes URL query fileId when matching vaultId', () => {
      window.location.search = '?vault=v1&file=f-url';
      mockSessionStorage['creators_desk_active_file_v1'] = 'f-session';
      mockLocalStorage['creators_desk_active_file_v1'] = 'f-local';

      expect(repo.getLastActiveFileId('v1')).toBe('f-url');
    });

    it('ignores URL fileId if URL vaultId does not match', () => {
      window.location.search = '?vault=other-vault&file=f-url';
      mockSessionStorage['creators_desk_active_file_v1'] = 'f-session';

      expect(repo.getLastActiveFileId('v1')).toBe('f-session');
    });

    it('falls back to sessionStorage then localStorage', () => {
      window.location.search = '';
      mockLocalStorage['creators_desk_active_file_v1'] = 'f-local';

      expect(repo.getLastActiveFileId('v1')).toBe('f-local');
      mockSessionStorage['creators_desk_active_file_v1'] = 'f-session';
      expect(repo.getLastActiveFileId('v1')).toBe('f-session');
    });
  });

  describe('setLastActiveFileId', () => {
    it('sets both sessionStorage and localStorage and updates history', () => {
      repo.setLastActiveFileId('v1', 'f1');
      expect(mockSessionStorage['creators_desk_active_file_v1']).toBe('f1');
      expect(mockLocalStorage['creators_desk_active_file_v1']).toBe('f1');
      expect(replaceStateMock).toHaveBeenCalledWith(
        null,
        '',
        '/?vault=v1&file=f1',
      );
    });

    it('removes keys when fileId is null', () => {
      mockSessionStorage['creators_desk_active_file_v1'] = 'f1';
      mockLocalStorage['creators_desk_active_file_v1'] = 'f1';

      repo.setLastActiveFileId('v1', null);
      expect(mockSessionStorage['creators_desk_active_file_v1']).toBeUndefined();
      expect(mockLocalStorage['creators_desk_active_file_v1']).toBeUndefined();
    });
  });
});
