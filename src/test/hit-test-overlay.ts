/**
 * Guard against the failure that made the note editor unusable: a full-bleed
 * overlay rendered on top of the editor, becoming the top hit-test target and
 * swallowing every click, caret placement and selection inside CodeMirror.
 *
 * Tailwind utilities are not real CSS under jsdom, so the check reads both the
 * inline style and the utility class list.
 */

const OVERLAY_POSITION_CLASS = /(^|\s)(absolute|fixed)(\s|$)/;
const OVERLAY_COVER_CLASS = /(^|\s)(inset-0|inset-x-0|inset-y-0|top-0)(\s|$)/;
const HIT_TEST_CLASS = /(^|\s)pointer-events-(auto|all)(\s|$)/;

export interface HitTestOverlay {
  element: HTMLElement;
  reason: string;
}

function describes(position: string): boolean {
  return position === 'absolute' || position === 'fixed';
}

/**
 * Lists descendants of `pane` that would intercept pointer input for the whole
 * pane. Decorative overlays must declare `pointer-events: none`.
 */
export function findHitTestOverlays(pane: HTMLElement): HitTestOverlay[] {
  const found: HitTestOverlay[] = [];
  const walk = (element: HTMLElement) => {
    for (const child of Array.from(element.children) as HTMLElement[]) {
      const style = child.style;
      const classes = child.className ?? '';
      const position = style.position || (OVERLAY_POSITION_CLASS.test(classes) ? 'absolute' : '');
      const pointerEvents = style.pointerEvents || (HIT_TEST_CLASS.test(classes) ? 'auto' : '');

      if (describes(position) && pointerEvents !== 'none') {
        const covers = OVERLAY_COVER_CLASS.test(classes) || style.inset !== '';
        found.push({
          element: child,
          reason: covers
            ? 'covers the whole pane and would intercept editor clicks'
            : 'is positioned over the pane and would intercept editor clicks',
        });
      }
      walk(child);
    }
  };
  walk(pane);
  return found;
}