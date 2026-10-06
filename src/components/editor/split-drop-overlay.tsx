import type { SplitDropEdge } from '../../utils/split-drop-edge';
import { useTranslate } from '../../i18n/use-i18n';

interface SplitDropOverlayProps {
  edge: SplitDropEdge | null;
}

const ZONE_STYLE = 'absolute bg-violet-600/25 border-2 border-dashed border-violet-400 pointer-events-none flex items-center justify-center text-xs font-semibold text-violet-200';

const EDGE_STYLE: Record<SplitDropEdge, string> = {
  right: `right-0 top-0 bottom-0 w-1/2 border-l-0 ${ZONE_STYLE}`,
  bottom: `left-0 right-0 bottom-0 h-1/2 border-t-0 ${ZONE_STYLE}`,
};

const EDGE_LABEL_KEY = {
  right: 'editor.splitRightHint',
  bottom: 'editor.splitBottomHint',
} as const;

/**
 * Purely decorative split affordance. `pointer-events: none` is declared inline
 * (not just as a utility class) because being hit-test-transparent is what keeps
 * the editor usable, and that invariant is asserted by the overlay-contract
 * tests. Renders nothing until a split edge is armed.
 */
export default function SplitDropOverlay({ edge }: SplitDropOverlayProps) {
  const t = useTranslate();
  if (!edge) return null;

  return (
    <div
      aria-hidden="true"
      style={{ pointerEvents: 'none' }}
      className={`absolute z-30 ${EDGE_STYLE[edge]}`}
    >
      {t(EDGE_LABEL_KEY[edge])}
    </div>
  );
}
