import { render } from '@testing-library/react';
import { describe, expect, it } from 'vitest';
import { ICON_PATHS, type IconName } from './icon-paths';
import MonochromeIcon, { ICON_STROKE_WIDTH } from './monochrome-icon';

/** Pictographic ranges, so emoji can never sneak back into the registry. */
const EMOJI_RANGES =
  /[\u{1F000}-\u{1FAFF}\u{2600}-\u{27BF}\u{2B00}-\u{2BFF}\u{2190}-\u{21FF}]/u;

/** Checked separately: a combining mark inside a class reads as ambiguous. */
const VARIATION_SELECTOR = '\uFE0F';

const containsEmoji = (value: string) =>
  EMOJI_RANGES.test(value) || value.includes(VARIATION_SELECTOR);

const ICON_NAMES = Object.keys(ICON_PATHS) as IconName[];

describe('icon registry', () => {
  it('declares outline path data for every glyph', () => {
    expect(ICON_NAMES.length).toBeGreaterThan(0);
    for (const name of ICON_NAMES) {
      expect(ICON_PATHS[name].length, name).toBeGreaterThan(0);
      for (const d of ICON_PATHS[name]) {
        expect(d.length, name).toBeGreaterThan(0);
        expect(d, name).toMatch(/^[Mm]/);
      }
    }
  });

  it('contains no emoji or arrow glyphs', () => {
    for (const name of ICON_NAMES) {
      for (const d of ICON_PATHS[name]) {
        expect(containsEmoji(d), name).toBe(false);
      }
    }
  });

  it('bakes no colour into the geometry', () => {
    for (const name of ICON_NAMES) {
      for (const d of ICON_PATHS[name]) {
        expect(d, name).not.toMatch(/#[0-9a-f]{3,8}|rgb|hsl|url\(|\bfill=|\bstroke=/i);
      }
    }
  });
});

describe('MonochromeIcon', () => {
  it('renders a single-colour stroked glyph', () => {
    const { container } = render(<MonochromeIcon name="menu" />);
    const svg = container.querySelector('svg');

    expect(svg).toHaveAttribute('viewBox', '0 0 24 24');
    expect(svg).toHaveAttribute('fill', 'none');
    expect(svg).toHaveAttribute('stroke', 'currentColor');
    expect(svg).toHaveAttribute('stroke-width', String(ICON_STROKE_WIDTH));
    expect(container.querySelectorAll('path')).toHaveLength(ICON_PATHS.menu.length);
  });

  it('is hidden from assistive technology', () => {
    const { container } = render(<MonochromeIcon name="close" />);

    expect(container.querySelector('svg')).toHaveAttribute('aria-hidden', 'true');
    expect(container.querySelector('svg')).toHaveAttribute('focusable', 'false');
  });

  it('takes its colour and size from the calling control', () => {
    const { container } = render(<MonochromeIcon name="settings" className="h-5 w-5" />);
    const svg = container.querySelector('svg');

    expect(svg).toHaveClass('h-5', 'w-5');
    expect(svg?.getAttribute('stroke')).toBe('currentColor');
  });
});