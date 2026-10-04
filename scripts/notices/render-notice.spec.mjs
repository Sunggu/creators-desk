import { describe, expect, it } from 'vitest';
import { buildNoticeModel } from './build-notice-model.mjs';
import { escapeHtml, renderNoticeHtml } from './render-notice-html.mjs';
import { renderNoticeText } from './render-notice-text.mjs';

const PROJECT = {
  productName: 'Creators Desk',
  licenseId: 'AGPL-3.0',
  copyrightYear: '2026',
  copyrightHolder: 'Creators Desk Contributors',
  sourceUrl: 'https://example.test/repo',
  contactEmail: 'hello@example.test',
};

const LICENSE_TEXTS = new Map([['MIT', { title: 'MIT License', text: 'MIT License\n\nCopyright (c) X\n' }]]);

const HOSTILE_ENTRY = {
  name: 'evil<script>',
  version: '1.0.0',
  group: '테스트 <b>그룹</b>',
  description: '설명 & "따옴표"',
  repositoryUrl: 'https://example.test/evil"><script>alert(1)</script>',
  licenseId: 'MIT',
  licenseFileName: 'LICENSE',
  copyright: 'Copyright (c) X & Y',
  scope: 'bundled',
};

function render(entry = HOSTILE_ENTRY) {
  const model = buildNoticeModel({
    project: PROJECT,
    version: '1.2.3',
    entries: [entry],
    licenseTexts: LICENSE_TEXTS,
  });
  return { model, html: renderNoticeHtml(model), text: renderNoticeText(model) };
}

describe('escapeHtml', () => {
  it('escapes every html-significant character', () => {
    expect(escapeHtml('<a href="x">&\'</a>')).toBe(
      '&lt;a href=&quot;x&quot;&gt;&amp;&#39;&lt;/a&gt;',
    );
  });

  it('renders null and undefined as an empty string', () => {
    expect(escapeHtml(null)).toBe('');
    expect(escapeHtml(undefined)).toBe('');
  });
});

describe('renderNoticeHtml', () => {
  it('emits a standalone utf-8 korean document with inline assets', () => {
    const { html } = render();
    expect(html).toMatch(/^<!doctype html>/);
    expect(html).toContain('<html lang="ko">');
    expect(html).toContain('<meta charset="UTF-8" />');
    expect(html).toContain('<style>');
    expect(html).toContain('<script>');
    expect(html).not.toMatch(/<link\b/);
    expect(html).not.toMatch(/src="http/);
  });

  it('states the project license and the AGPL source offer', () => {
    const { html } = render();
    expect(html).toContain('본 제품 라이선스: AGPL-3.0');
    expect(html).toContain('AGPL-3.0 제13조');
    expect(html).toContain('https://example.test/repo');
    expect(html).toContain('mailto:hello@example.test');
  });

  it('escapes untrusted package metadata instead of injecting markup', () => {
    const { html } = render();
    expect(html).not.toContain('<script>alert(1)</script>');
    expect(html).toContain('evil&lt;script&gt;');
    expect(html).toContain('https://example.test/evil&quot;&gt;&lt;script&gt;alert(1)&lt;/script&gt;');
  });

  it('links every table-of-contents item to its entry anchor', () => {
    const { model, html } = render();
    for (const item of model.entries) {
      expect(html).toContain(`data-toc="${item.anchor}"`);
      expect(html).toContain(`id="${item.anchor}"`);
    }
  });

  it('embeds the full license text and the search filter', () => {
    const { html } = render();
    expect(html).toContain('id="license-mit"');
    expect(html).toContain('<summary>MIT License</summary>');
    expect(html).toContain('id="notice-search"');
    expect(html).toContain('id="notice-count"');
  });
});

describe('renderNoticeText', () => {
  it('includes the table of contents, copyright notice and license text', () => {
    const { text } = render();
    expect(text).toContain('Open Source Software Notice');
    expect(text).toContain('목록 (Table of Contents)');
    expect(text).toContain('1. evil<script> (v1.0.0) - MIT');
    expect(text).toContain('Copyright (c) X & Y');
    expect(text).toContain('MIT License');
  });

  it('is deterministic for identical input', () => {
    expect(render().text).toBe(render().text);
  });
});