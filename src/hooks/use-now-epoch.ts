import { useEffect, useState } from 'react';
import type { EpochMillis } from '../core/domain/time/epoch-millis.dto';
import { nowEpochMillis } from '../core/domain/time/epoch-millis';

/**
 * Current instant as epoch milliseconds, refreshed on an interval.
 *
 * Exists so components that render a clock or a "3 minutes ago" label do not each
 * own a timer. The interval is cleaned up on unmount, so a backgrounded tab
 * cannot accumulate them.
 *
 * Defaults to 30s: fine for a status-bar clock, and cheap enough to run for the
 * whole session.
 */
export function useNowEpoch(intervalMs: number = 30_000): EpochMillis {
  const [now, setNow] = useState<EpochMillis>(() => nowEpochMillis());

  useEffect(() => {
    const id = setInterval(() => setNow(nowEpochMillis()), intervalMs);
    return () => clearInterval(id);
  }, [intervalMs]);

  return now;
}