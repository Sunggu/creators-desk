export interface WorkspaceSyncMessage {
  type: 'file-saved' | 'tree-changed';
  vaultId?: string;
  fileId?: string;
  updatedAt: number;
}

const CHANNEL_NAME = 'creators_desk_sync';
let sharedChannel: BroadcastChannel | null = null;

function getChannel(): BroadcastChannel | null {
  if (typeof window === 'undefined' || typeof BroadcastChannel === 'undefined') {
    return null;
  }
  if (!sharedChannel) {
    try {
      sharedChannel = new BroadcastChannel(CHANNEL_NAME);
    } catch {
      sharedChannel = null;
    }
  }
  return sharedChannel;
}

/**
 * Broadcasts workspace changes across browser tabs and monitors.
 */
export function broadcastWorkspaceSync(msg: WorkspaceSyncMessage): void {
  const channel = getChannel();
  if (!channel) return;
  try {
    channel.postMessage(msg);
  } catch (err) {
    console.warn('Failed to broadcast workspace sync message:', err);
  }
}

/**
 * Subscribes to cross-tab workspace updates.
 */
export function subscribeWorkspaceSync(
  handler: (msg: WorkspaceSyncMessage) => void,
): () => void {
  const channel = getChannel();
  if (!channel) return () => {};

  const listener = (event: MessageEvent<WorkspaceSyncMessage>) => {
    if (event?.data && typeof event.data === 'object' && event.data.type) {
      handler(event.data);
    }
  };

  channel.addEventListener('message', listener);
  return () => {
    channel.removeEventListener('message', listener);
  };
}

/**
 * Resets the channel instance (primarily for isolated test environments).
 */
export function resetWorkspaceSyncChannelForTesting(): void {
  if (sharedChannel) {
    try {
      sharedChannel.close();
    } catch {
      // ignore
    }
    sharedChannel = null;
  }
}
