import type { EditorStats } from '../../core/domain/editor-stats.dto';
import { useMarkdownEditor } from '../../editor/use-markdown-editor';
import ObsidianInlineTitle from './obsidian-inline-title';

interface ObsidianMarkdownViewProps {
  fileId: string;
  fileName: string;
  initialContent: string;
  onDocChange: (doc: string) => void;
  onStatsChange: (stats: EditorStats) => void;
  onRenameFile?: (id: string, newName: string) => Promise<unknown> | void;
  autoFocusTitle?: boolean;
}

/**
 * Note surface: inline title, divider, and the CodeMirror mount point. All
 * editor behaviour lives in `useMarkdownEditor`; this file only arranges layout.
 */
export default function ObsidianMarkdownView({
  fileId,
  fileName,
  initialContent,
  onDocChange,
  onStatsChange,
  onRenameFile,
  autoFocusTitle = false,
}: ObsidianMarkdownViewProps) {
  const { rootRef, focus } = useMarkdownEditor({ initialContent, onDocChange, onStatsChange });
  const cleanTitle = fileName.replace(/\.md$/i, '');

  return (
    <div className="h-full w-full overflow-y-auto bg-[#1e1e22]">
      <div className="w-full max-w-[840px] mx-auto px-4 md:px-12 pt-6 pb-32">
        <ObsidianInlineTitle
          title={cleanTitle}
          onRename={(newTitle) => onRenameFile?.(fileId, `${newTitle}.md`)}
          onEnter={focus}
          autoFocus={autoFocusTitle}
        />

        <div className="mt-2 mb-4 border-b border-[#282830]/80" />

        <div ref={rootRef} className="w-full min-h-[400px] cursor-text" />
      </div>
    </div>
  );
}
