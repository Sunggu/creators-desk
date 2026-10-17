import { describe, expect, it, vi } from 'vitest';
import {
  buildWorkspaceUrl,
  parseWorkspaceUrl,
  syncWorkspaceUrlToHistory,
} from './workspace-url';

describe('workspace-url', () => {
  describe('parseWorkspaceUrl', () => {
    it('returns nulls for empty search string', () => {
      expect(parseWorkspaceUrl('')).toEqual({ vaultId: null, fileId: null });
      expect(parseWorkspaceUrl('?')).toEqual({ vaultId: null, fileId: null });
    });

    it('parses vaultId and fileId from query', () => {
      expect(parseWorkspaceUrl('?vault=v1&file=f1')).toEqual({
        vaultId: 'v1',
        fileId: 'f1',
      });
      expect(parseWorkspaceUrl('vault=v2&file=f2')).toEqual({
        vaultId: 'v2',
        fileId: 'f2',
      });
    });

    it('handles only vaultId or only fileId', () => {
      expect(parseWorkspaceUrl('?vault=v1')).toEqual({
        vaultId: 'v1',
        fileId: null,
      });
      expect(parseWorkspaceUrl('?file=f1')).toEqual({
        vaultId: null,
        fileId: 'f1',
      });
    });

    it('handles blank/whitespace query params as null', () => {
      expect(parseWorkspaceUrl('?vault=&file=  ')).toEqual({
        vaultId: null,
        fileId: null,
      });
    });
  });

  describe('buildWorkspaceUrl', () => {
    it('returns bare pathname when both are null', () => {
      expect(buildWorkspaceUrl(null, null)).toBe('/');
      expect(buildWorkspaceUrl(null, null, '/app')).toBe('/app');
    });

    it('appends vault query param', () => {
      expect(buildWorkspaceUrl('v1', null)).toBe('/?vault=v1');
    });

    it('appends file query param', () => {
      expect(buildWorkspaceUrl(null, 'f1')).toBe('/?file=f1');
    });

    it('appends both query params', () => {
      expect(buildWorkspaceUrl('v1', 'f1')).toBe('/?vault=v1&file=f1');
      expect(buildWorkspaceUrl('v1', 'f1', '/workspace')).toBe(
        '/workspace?vault=v1&file=f1',
      );
    });
  });

  describe('syncWorkspaceUrlToHistory', () => {
    it('safely handles undefined window in node', () => {
      expect(() => syncWorkspaceUrlToHistory('v1', 'f1')).not.toThrow();
    });

    it('calls replaceState with formatted url when window is present', () => {
      const replaceState = vi.fn();
      vi.stubGlobal('window', {
        location: { pathname: '/', search: '' },
        history: { replaceState },
      });
      try {
        syncWorkspaceUrlToHistory('v1', 'f1');
        expect(replaceState).toHaveBeenCalledWith(null, '', '/?vault=v1&file=f1');
      } finally {
        vi.unstubAllGlobals();
      }
    });

    it('does not replaceState if url already matches current location', () => {
      const replaceState = vi.fn();
      vi.stubGlobal('window', {
        location: { pathname: '/', search: '?vault=v1&file=f1' },
        history: { replaceState },
      });
      try {
        syncWorkspaceUrlToHistory('v1', 'f1');
        expect(replaceState).not.toHaveBeenCalled();
      } finally {
        vi.unstubAllGlobals();
      }
    });
  });
});
