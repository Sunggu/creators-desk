import { ICON_PATHS, type IconName } from './icon-paths';

export type { IconName };

/** Default box so an icon inherits the caller's rhythm instead of guessing. */
export const ICON_SIZE_CLASS = 'h-4 w-4';

/**
 * One stroke weight for the whole app.
 *
 * Previously every call site passed its own value (1.5 / 1.75 / 2 / 2.5), which
 * is why glyphs read as coming from different sets. A single default is what
 * makes the icon family look like one family.
 */
export const ICON_STROKE_WIDTH = 1.75;

interface MonochromeIconProps {
  name: IconName;
  /** Tailwind sizing, e.g. `h-3.5 w-3.5`. */
  className?: string;
  strokeWidth?: number;
}

/**
 * The app's only icon primitive: outline geometry, single colour, no emoji.
 *
 * Decorative by contract (`aria-hidden`), so an icon never duplicates or
 * contradicts the accessible name of the control that wraps it.
 */
export default function MonochromeIcon({
  name,
  className = ICON_SIZE_CLASS,
  strokeWidth = ICON_STROKE_WIDTH,
}: MonochromeIconProps) {
  return (
    <svg
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth={strokeWidth}
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden="true"
      focusable="false"
      className={className}
    >
      {ICON_PATHS[name].map((d) => (
        <path key={d} d={d} />
      ))}
    </svg>
  );
}