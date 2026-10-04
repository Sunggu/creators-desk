import { describe, expect, it } from 'vitest';
import { parseWikilinksAndTags } from './wikilink-parser';

describe('parseWikilinksAndTags', () => {
  it('extracts simple wikilinks', () => {
    const text = 'Here is [[Research Note]] and [[Ideas]].';
    const { links } = parseWikilinksAndTags(text);
    expect(links).toEqual(['Research Note', 'Ideas']);
  });

  it('extracts piped wikilinks ignoring display text', () => {
    const text = 'Check out [[Protagonist Profile|Hero]] for details.';
    const { links } = parseWikilinksAndTags(text);
    expect(links).toEqual(['Protagonist Profile']);
  });

  it('extracts inline hashtags while ignoring markdown headers', () => {
    const text = '# Main Header\n\nThis is a #lore note with #worldbuilding and #설정.';
    const { tags } = parseWikilinksAndTags(text);
    expect(tags).toContain('lore');
    expect(tags).toContain('worldbuilding');
    expect(tags).toContain('설정');
    expect(tags).not.toContain('Main');
  });
});
