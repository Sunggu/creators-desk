import { renderHook } from '@testing-library/react';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import {
  broadcastWorkspaceSync,
  resetWorkspaceSyncChannelForTesting,
} from '../utils/workspace-sync-channel';
import { useWorkspaceSync } from './use-workspace-sync';

describe('useWorkspaceSync', () => {
  let listeners: ((event: { data: unknown }) => void)[] = [];

  beforeEach(() => {
    resetWorkspaceSyncChannelForTesting();
    listeners = [];

    class MockBroadcastChannel {
      postMessage(data: unknown) {
        for (const listener of listeners) {
          listener({ data });
        }
      }
      addEventListener(_event: string, cb: (event: { data: unknown }) => void) {
        listeners.push(cb);
      }
      removeEventListener(_event: string, cb: (event: { data: unknown }) => void) {
        const idx = listeners.indexOf(cb);
        if (idx !== -1) listeners.splice(idx, 1);
      }
      close() {}
    }

    vi.stubGlobal('BroadcastChannel', MockBroadcastChannel);
  });

  afterEach(() => {
    resetWorkspaceSyncChannelForTesting();
    vi.unstubAllGlobals();
  });

  it('triggers onRevalidate on window focus', () => {
    const onRevalidate = vi.fn();
    renderHook(() => useWorkspaceSync({ onRevalidate }));

    window.dispatchEvent(new Event('focus'));
    expect(onRevalidate).toHaveBeenCalledTimes(1);
  });

  it('triggers onRevalidate on visibilitychange when visible', () => {
    const onRevalidate = vi.fn();
    renderHook(() => useWorkspaceSync({ onRevalidate }));

    Object.defineProperty(document, 'visibilityState', {
      value: 'visible',
      configurable: true,
    });
    document.dispatchEvent(new Event('visibilitychange'));
    expect(onRevalidate).toHaveBeenCalledTimes(1);
  });

  it('does not trigger onRevalidate when document is hidden', () => {
    const onRevalidate = vi.fn();
    renderHook(() => useWorkspaceSync({ onRevalidate }));

    Object.defineProperty(document, 'visibilityState', {
      value: 'hidden',
      configurable: true,
    });
    document.dispatchEvent(new Event('visibilitychange'));
    expect(onRevalidate).not.toHaveBeenCalled();
  });

  it('triggers onRevalidate and onRemoteFileSaved on file-saved broadcast', () => {
    const onRevalidate = vi.fn();
    const onRemoteFileSaved = vi.fn();
    renderHook(() => useWorkspaceSync({ onRevalidate, onRemoteFileSaved }));

    broadcastWorkspaceSync({
      type: 'file-saved',
      fileId: 'file-abc',
      vaultId: 'v1',
      updatedAt: 123456,
    });

    expect(onRevalidate).toHaveBeenCalledTimes(1);
    expect(onRemoteFileSaved).toHaveBeenCalledWith('file-abc');
  });

  it('triggers onRevalidate but not onRemoteFileSaved on tree-changed broadcast', () => {
    const onRevalidate = vi.fn();
    const onRemoteFileSaved = vi.fn();
    renderHook(() => useWorkspaceSync({ onRevalidate, onRemoteFileSaved }));

    broadcastWorkspaceSync({
      type: 'tree-changed',
      vaultId: 'v1',
      updatedAt: 123456,
    });

    expect(onRevalidate).toHaveBeenCalledTimes(1);
    expect(onRemoteFileSaved).not.toHaveBeenCalled();
  });

  it('cleans up event listeners and subscription on unmount', () => {
    const onRevalidate = vi.fn();
    const { unmount } = renderHook(() => useWorkspaceSync({ onRevalidate }));

    unmount();

    window.dispatchEvent(new Event('focus'));
    broadcastWorkspaceSync({
      type: 'tree-changed',
      updatedAt: 123456,
    });

    expect(onRevalidate).not.toHaveBeenCalled();
  });
});
