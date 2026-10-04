import { marked } from 'marked';
import { describe, expect, it } from 'vitest';
import { processObsidianSyntax } from './obsidian-markdown-preview';

describe('ObsidianMarkdownPreview and Syntax Processing', () => {
  it('converts [[wikilinks]] into clickable anchor tags with encoded data attributes', () => {
    const raw = 'Check [[Daily Note]] and [[2026 Goals]]';
    const processed = processObsidianSyntax(raw);

    expect(processed).toContain('data-wikilink="Daily%20Note"');
    expect(processed).toContain('data-wikilink="2026%20Goals"');
    expect(processed).toContain('class="wikilink-badge');
  });

  it('transforms #tags into badge elements while preserving surrounding text', () => {
    const raw = 'Learning #react and #obsidian today';
    const processed = processObsidianSyntax(raw);

    expect(processed).toContain('>#react</span>');
    expect(processed).toContain('>#obsidian</span>');
    expect(processed).toContain('bg-violet-950/60');
  });

  it('renders standard markdown headings, bold, and lists into HTML through marked', () => {
    const raw = '## Introduction\n\n- **Feature A**: Description\n- *Italic item*';
    const processed = processObsidianSyntax(raw);
    const html = marked.parse(processed, { async: false }) as string;

    expect(html).toContain('<h2>Introduction</h2>');
    expect(html).toContain('<strong>Feature A</strong>');
    expect(html).toContain('<em>Italic item</em>');
    expect(html).toContain('<ul>');
    expect(html).toContain('<li>');
  });
});
