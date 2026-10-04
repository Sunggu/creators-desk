export interface ParsedNoteMetadata {
  links: string[];
  tags: string[];
}

export function parseWikilinksAndTags(content: string): ParsedNoteMetadata {
  const linkSet = new Set<string>();
  const tagSet = new Set<string>();

  // Regex for [[Target Note]] or [[Target Note|Display Text]]
  const linkRegex = /\[\[([^[\]|]+)(?:\|[^[\]]+)?\]\]/g;
  let match: RegExpExecArray | null;

  while ((match = linkRegex.exec(content)) !== null) {
    const raw = match[1].trim();
    if (raw) {
      linkSet.add(raw);
    }
  }

  // Regex for #tag (avoiding markdown headers like # Header)
  const tagRegex = /(?:^|\s)#([a-zA-Z0-9_\uAC00-\uD7A3]+)/g;
  while ((match = tagRegex.exec(content)) !== null) {
    const rawTag = match[1].trim();
    if (rawTag) {
      tagSet.add(rawTag);
    }
  }

  return {
    links: Array.from(linkSet),
    tags: Array.from(tagSet),
  };
}
