import { useEffect, useState } from 'react';
import { getTailscaleStatus } from '../core/application/use-cases/get-tailscale-status';
import type { TailscaleStatusViewModel } from '../core/application/use-cases/get-tailscale-status';
import { HttpTailscaleStatusRepository } from '../infrastructure/tailscale/http.tailscale-status.repository';

const DEFAULT_POLL_INTERVAL_MS = 10_000;
const repository = new HttpTailscaleStatusRepository();

export function useTailscaleStatus(
  pollIntervalMs: number = DEFAULT_POLL_INTERVAL_MS,
) {
  const [status, setStatus] = useState<TailscaleStatusViewModel>({
    kind: 'starting',
    tailscaleIps: [],
  });

  useEffect(() => {
    let cancelled = false;

    async function refresh() {
      const next = await getTailscaleStatus(repository);
      if (!cancelled) setStatus(next);
    }

    void refresh();
    const interval = setInterval(() => void refresh(), pollIntervalMs);

    return () => {
      cancelled = true;
      clearInterval(interval);
    };
  }, [pollIntervalMs]);

  return status;
}