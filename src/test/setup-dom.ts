import '@testing-library/jest-dom/vitest';
import { afterEach } from 'vitest';
import { cleanup } from '@testing-library/react';

/**
 * jsdom omits the layout/observer APIs that CodeMirror 6 probes during mount.
 * Providing inert stand-ins lets specs assert real mount/unmount and focus
 * behaviour instead of mocking the editor away.
 */
function installGeometryStub(target: object, method: string): void {
  Object.defineProperty(target, method, {
    configurable: true,
    writable: true,
    value: () => ({
      x: 0,
      y: 0,
      top: 0,
      left: 0,
      right: 0,
      bottom: 0,
      width: 0,
      height: 0,
      toJSON: () => ({}),
      length: 0,
      item: () => null,
      [Symbol.iterator]: function* () {},
    }),
  });
}

if (!Range.prototype.getClientRects) installGeometryStub(Range.prototype, 'getClientRects');
if (!Range.prototype.getBoundingClientRect) installGeometryStub(Range.prototype, 'getBoundingClientRect');

class ObserverStub {
  observe(): void {}
  unobserve(): void {}
  disconnect(): void {}
  takeRecords(): [] {
    return [];
  }
}

if (!('ResizeObserver' in globalThis)) {
  globalThis.ResizeObserver = ObserverStub as unknown as typeof ResizeObserver;
}
if (!('IntersectionObserver' in globalThis)) {
  globalThis.IntersectionObserver = ObserverStub as unknown as typeof IntersectionObserver;
}

if (!window.matchMedia) {
  window.matchMedia = ((query: string) => ({
    matches: false,
    media: query,
    onchange: null,
    addListener: () => {},
    removeListener: () => {},
    addEventListener: () => {},
    removeEventListener: () => {},
    dispatchEvent: () => false,
  })) as unknown as typeof window.matchMedia;
}

afterEach(() => {
  cleanup();
});
