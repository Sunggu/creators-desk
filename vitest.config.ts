import { defineConfig } from 'vitest/config';

import pkg from './package.json' with { type: 'json' };

/**
 * Two isolated suites so DOM-dependent specs never leak a `document` global
 * into pure domain/application specs (which must stay runtime-agnostic).
 *
 * - `unit` : node env, `.spec.ts`  -> domain / application / infrastructure
 * - `dom`  : jsdom env, `.spec.tsx` -> components, hooks, CodeMirror mounting
 */
export default defineConfig({
  test: {
    passWithNoTests: true,
    testTimeout: 15000,
    projects: [
      {
        test: {
          name: 'unit',
          environment: 'node',
          include: ['src/**/*.spec.ts', 'scripts/**/*.spec.mjs'],
        },
      },
      {
        // Mirrors the `define` in `vite.config.ts`; without it any spec that
        // reaches a component importing `core/app-version` fails to evaluate.
        define: { __APP_VERSION__: JSON.stringify(pkg.version) },
        test: {
          name: 'dom',
          environment: 'jsdom',
          include: ['src/**/*.spec.tsx'],
          setupFiles: ['src/test/setup-dom.ts'],
        },
      },
    ],
  },
});
