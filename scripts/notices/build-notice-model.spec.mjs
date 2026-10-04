import { describe, expect, it } from 'vitest';
import { buildNoticeModel, toAnchor } from './build-notice-model.mjs';

const PROJECT = {
  productName: 'Creators Desk',
  licenseId: 'AGPL-3.0',
  copyrightYear: '2026',
  copyrightHolder: 'Creators Desk Contributors',
  sourceUrl: 'https://example.test/repo',
  contactEmail: 'hello@example.test',
};

const LICENSE_TEXTS = new Map([
  ['MIT', { title: 'MIT License', text: 'MIT License\n\nCopyright (c) X\n' }],
  ['Apache-2.0', { title: 'Apache License, Version 2.0', text: 'Apache License\n' }],
]);

function entry(overrides = {}) {
  return {
    name: 'react',
    version: '19.3.0',
    group: 'React',
    description: '',
    repositoryUrl: null,
    licenseId: 'MIT',
    licenseFileName: 'LICENSE',
    copyright: 'Copyright (c) Meta',
    scope: 'bundled',
    ...overrides,
  };
}

function build(entries) {
  return buildNoticeModel({ project: PROJECT, version: '1.2.3', entries, licenseTexts: LICENSE_TEXTS });
}

describe('toAnchor', () => {
  it('produces a stable url-safe anchor for scoped package names', () => {
    expect(toAnchor('@codemirror/lang-markdown')).toBe('pkg-codemirror-lang-markdown');
  });
});

describe('buildNoticeModel', () => {
  it('projects product metadata into the notice header', () => {
    const model = build([entry()]);
    expect(model).toMatchObject({
      productName: 'Creators Desk',
      version: '1.2.3',
      projectLicenseId: 'AGPL-3.0',
      copyrightLine: 'Copyright (C) 2026 Creators Desk Contributors',
      contactEmail: 'hello@example.test',
    });
  });

  it('numbers entries continuously across sections and groups', () => {
    const model = build([
      entry({ name: 'marked', group: '마크다운' }),
      entry({ name: 'react', group: 'React' }),
      entry({ name: 'tailwindcss', group: 'CSS', scope: 'build-output' }),
    ]);
    expect(model.entries.map((item) => item.index)).toEqual([1, 2, 3]);
    expect(model.sections.map((section) => section.scope)).toEqual(['bundled', 'build-output']);
  });

  it('sorts groups by Korean collation and entries by package name', () => {
    const model = build([
      entry({ name: 'react', group: 'React' }),
      entry({ name: 'marked', group: '마크다운' }),
      entry({ name: 'hono', group: 'React' }),
    ]);
    const groups = model.sections[0].groups;
    expect(groups.map((group) => group.name)).toEqual(['마크다운', 'React']);
    expect(groups[1].entries.map((item) => item.name)).toEqual(['hono', 'react']);
  });

  it('places the fallback group last', () => {
    const model = build([
      entry({ name: 'anonymous', group: '기타 오픈소스' }),
      entry({ name: 'react', group: 'React' }),
    ]);
    expect(model.sections[0].groups.map((group) => group.name)).toEqual([
      'React',
      '기타 오픈소스',
    ]);
  });

  it('drops empty sections when no build-output packages exist', () => {
    const model = build([entry()]);
    expect(model.sections).toHaveLength(1);
  });

  it('collects one license text per distinct license id', () => {
    const model = build([entry(), entry({ name: 'typescript', licenseId: 'Apache-2.0' })]);
    expect(model.licenseTexts.map((text) => text.licenseId)).toEqual(['Apache-2.0', 'MIT']);
    expect(model.totals).toEqual({ packages: 2, licenses: 2 });
  });

  it('reports license ids whose text original is unavailable', () => {
    const model = build([entry({ name: 'weird', licenseId: 'WTFPL' })]);
    expect(model.missingLicenseTexts).toEqual(['WTFPL']);
    expect(model.licenseTexts).toEqual([]);
  });
});