import { describe, expect, it } from 'vitest';
import { mergeCatalog } from './merge-catalog.mjs';

function meta(overrides = {}) {
  return {
    name: 'react',
    version: '19.3.0',
    description: 'fallback description',
    repositoryUrl: 'https://github.com/facebook/react',
    licenseId: 'MIT',
    licenseFileName: 'LICENSE',
    copyrightLines: ['Copyright (c) Meta Platforms, Inc. and affiliates.'],
    ...overrides,
  };
}

function collectedOf(...metas) {
  return new Map(metas.map((entry) => [entry.name, entry]));
}

describe('mergeCatalog', () => {
  it('applies catalog overrides and defaults the group', () => {
    const { entries, errors } = mergeCatalog(
      collectedOf(meta()),
      { packages: { react: { group: 'React', description: 'UI 라이브러리' } } },
    );
    expect(errors).toEqual([]);
    expect(entries[0]).toMatchObject({
      name: 'react',
      group: 'React',
      description: 'UI 라이브러리',
      scope: 'bundled',
      copyright: 'Copyright (c) Meta Platforms, Inc. and affiliates.',
    });
  });

  it('falls back to the manifest description and a default group', () => {
    const { entries } = mergeCatalog(collectedOf(meta()), { packages: {} });
    expect(entries[0]).toMatchObject({
      group: '기타 오픈소스',
      description: 'fallback description',
    });
  });

  it('honours the build-output scope hint from the collector', () => {
    const { entries } = mergeCatalog(
      collectedOf(meta({ name: 'tailwindcss', scopeHint: 'build-output' })),
      { packages: {} },
    );
    expect(entries[0].scope).toBe('build-output');
  });

  it('reports an error when the license cannot be identified', () => {
    const { entries, errors } = mergeCatalog(
      collectedOf(meta({ licenseId: null })),
      { packages: {} },
    );
    expect(entries).toEqual([]);
    expect(errors[0]).toContain('react@19.3.0');
    expect(errors[0]).toContain('라이선스를 판별할 수 없습니다');
  });

  it('reports an error when the license text original is missing', () => {
    const { entries, errors } = mergeCatalog(
      collectedOf(meta({ licenseId: 'WTFPL' })),
      { packages: {} },
    );
    expect(entries).toEqual([]);
    expect(errors[0]).toContain('notices/WTFPL.txt');
  });

  it('warns about a missing copyright notice without failing', () => {
    const { entries, warnings } = mergeCatalog(
      collectedOf(meta({ copyrightLines: [] })),
      { packages: {} },
    );
    expect(entries).toHaveLength(1);
    expect(warnings[0]).toContain('저작권 문구');
  });

  it('warns about catalog entries missing from the dependency tree', () => {
    const { warnings } = mergeCatalog(collectedOf(meta()), {
      packages: { 'left-pad': { group: '기타' } },
    });
    expect(warnings[0]).toContain("'left-pad'");
  });
});