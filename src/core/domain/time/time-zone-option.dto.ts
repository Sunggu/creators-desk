import type { TimeZoneSetting } from './time-zone.dto';

/**
 * A single row of the time-zone picker.
 *
 * `value` is what gets persisted; `label` is a pre-computed, locale-neutral
 * descriptor so that building the list stays a pure, testable function.
 */
export interface TimeZoneOption {
  readonly value: TimeZoneSetting;
  readonly label: string;
  readonly offsetMinutes: number;
  /** True for the "follow the runtime" row. */
  readonly isSystem: boolean;
}