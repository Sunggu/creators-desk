import type { Clock } from '../../core/application/ports/clock.port';
import type { EpochMillis } from '../../core/domain/time/epoch-millis.dto';
import { nowEpochMillis } from '../../core/domain/time/epoch-millis';

/**
 * Wall-clock implementation of {@link Clock}.
 *
 * The single sanctioned way for infrastructure code to read the current time,
 * so every layer funnels through one place and tests can substitute
 * `FixedClock` instead of stubbing `Date.now()`.
 */
export class SystemClock implements Clock {
  now(): EpochMillis {
    return nowEpochMillis();
  }
}

/** Deterministic clock for tests. */
export class FixedClock implements Clock {
  private current: EpochMillis;

  constructor(initialMillis: EpochMillis) {
    this.current = initialMillis;
  }

  now(): EpochMillis {
    return this.current;
  }

  set(millis: EpochMillis): void {
    this.current = millis;
  }

  advance(deltaMillis: number): void {
    this.current += deltaMillis;
  }
}

export const systemClock = new SystemClock();