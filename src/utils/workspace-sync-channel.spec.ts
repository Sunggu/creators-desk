import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import {
  broadcastWorkspaceSync,
  resetWorkspaceSyncChannelForTesting,
  subscribeWorkspaceSync,
  type WorkspaceSyncMessage,
} from './workspace-sync-channel';

describe('workspace-sync-channel', () => {
  beforeEach(() => {
    resetWorkspaceSyncChannelForTesting();
  });

  afterEach(() => {
    resetWorkspaceSyncChannelForTesting();
    vi.unstubAllGlobals();
  });

  it('safely handles missing window or BroadcastChannel', () => {
    expect(() =>
      broadcastWorkspaceSync({ type: 'file-saved', updatedAt: Date.now() }),
    ).not.toThrow();

    const unsubscribe = subscribeWorkspaceSync(() => {});
    expect(typeof unsubscribe).toBe('function');
    expect(() => unsubscribe()).not.toThrow();
  });

  it('broadcasts message and notifies subscribers when BroadcastChannel exists', () => {
    const listeners: ((event: { data: WorkspaceSyncMessage }) => void)[] = [];
    const postMessageMock = vi.fn((data: WorkspaceSyncMessage) => {
      for (const listener of listeners) {
        listener({ data });
      }
    });
    const addEventListenerMock = vi.fn(
      (_event: string, cb: (event: { data: WorkspaceSyncMessage }) => void) => {
        listeners.push(cb);
      },
    );
    const removeEventListenerMock = vi.fn(
      (_event: string, cb: (event: { data: WorkspaceSyncMessage }) => void) => {
        const idx = listeners.indexOf(cb);
        if (idx !== -1) listeners.splice(idx, 1);
      },
    );
    const closeMock = vi.fn();

    class MockBroadcastChannel {
      postMessage = postMessageMock;
      addEventListener = addEventListenerMock;
      removeEventListener = removeEventListenerMock;
      close = closeMock;
    }

    vi.stubGlobal('window', {});
    vi.stubGlobal('BroadcastChannel', MockBroadcastChannel);

    const received: WorkspaceSyncMessage[] = [];
    const unsubscribe = subscribeWorkspaceSync((msg) => {
      received.push(msg);
    });

    const testMsg: WorkspaceSyncMessage = {
      type: 'file-saved',
      fileId: 'f1',
      vaultId: 'v1',
      updatedAt: 12345,
    };

    broadcastWorkspaceSync(testMsg);

    expect(postMessageMock).toHaveBeenCalledWith(testMsg);
    expect(received).toHaveLength(1);
    expect(received[0]).toEqual(testMsg);

    unsubscribe();
    expect(removeEventListenerMock).toHaveBeenCalled();
  });
});
