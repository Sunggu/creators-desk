/**
 * Rewrites Obsidian-flavoured markdown into HTML that `marked` can render:
 * `[[wikilinks]]` become navigable anchors and `#tags` become badges.
 *
 * Pure and framework-free so the syntax rules are unit-testable on their own.
 */
export function processObsidianSyntax(rawText: string): string {
  let processed = rawText.replace(/\[\[(.*?)\]\]/g, (_, target) => {
    const cleanTarget = target.trim();
    return `<a href="#wikilink" data-wikilink="${encodeURIComponent(cleanTarget)}" class="wikilink-badge text-violet-400 font-medium hover:underline hover:text-violet-300">[[${cleanTarget}]]</a>`;
  });

  processed = processed.replace(/(^|\s)#([a-zA-Z0-9_\uAC00-\uD7A3]+)/g, (_, space, tag) => {
    return `${space}<span class="inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium bg-violet-950/60 text-violet-300 border border-violet-800/40">#${tag}</span>`;
  });

  return processed;
}