import { useMemo } from 'react';
import { marked } from 'marked';
import { useTranslate } from '../../i18n/use-i18n';
import { processObsidianSyntax } from '../../utils/obsidian-syntax';

interface ObsidianMarkdownPreviewProps {
  title: string;
  content: string;
  onSwitchToEdit?: () => void;
  onNavigateWikilink?: (target: string) => void;
}

export default function ObsidianMarkdownPreview({
  title,
  content,
  onSwitchToEdit,
  onNavigateWikilink,
}: ObsidianMarkdownPreviewProps) {
  const t = useTranslate();
  const cleanTitle = title.replace(/\.md$/i, '');

  const html = useMemo(() => {
    const processed = processObsidianSyntax(content || '');
    return marked.parse(processed, { async: false, breaks: true, gfm: true }) as string;
  }, [content]);

  const handleClick = (e: React.MouseEvent<HTMLDivElement>) => {
    const target = (e.target as HTMLElement).closest('[data-wikilink]') as HTMLElement | null;
    if (target) {
      e.preventDefault();
      const linkName = target.getAttribute('data-wikilink');
      if (linkName && onNavigateWikilink) {
        onNavigateWikilink(decodeURIComponent(linkName));
      }
    }
  };

  return (
    <div
      onDoubleClick={onSwitchToEdit}
      onClick={handleClick}
      className="h-full w-full overflow-y-auto bg-[#1e1e22] text-[#dcddde] select-text cursor-text"
      title={t('editor.doubleClickToEdit')}
    >
      <div className="w-full max-w-[840px] mx-auto px-4 md:px-12 pt-6 pb-32">
        {/* Document Title Header */}
        <h1 className="text-3xl md:text-4xl font-extrabold text-white tracking-tight pb-1">
          {cleanTitle}
        </h1>

        {/* Subtle Divider */}
        <div className="mt-2 mb-4 border-b border-[#282830]/80" />

        {/* Rendered HTML Markdown Body */}
        <article
          className="preview-markdown-body leading-relaxed text-[15px] md:text-base space-y-4 text-zinc-200"
          dangerouslySetInnerHTML={{ __html: html }}
        />
      </div>
    </div>
  );
}
