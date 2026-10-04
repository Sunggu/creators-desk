import { defaultKeymap, history, historyKeymap } from '@codemirror/commands';
import { markdown } from '@codemirror/lang-markdown';
import { defaultHighlightStyle, syntaxHighlighting } from '@codemirror/language';
import { EditorState } from '@codemirror/state';
import { EditorView, keymap } from '@codemirror/view';
import { useEffect, useRef } from 'react';
import type { EditorStats } from '../../hooks/use-codemirror';
import ObsidianInlineTitle from './obsidian-inline-title';

const obsidianTheme = EditorView.theme(
  {
    '&': {
      color: '#dcddde',
      backgroundColor: '#1e1e22',
      height: '100%',
      fontSize: '15px',
      outline: 'none',
    },
    '.cm-scroller': {
      overflow: 'visible',
      fontFamily:
        '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, Inter, sans-serif',
    },
    '.cm-content': {
      padding: '0 0 160px 0',
      lineHeight: '1.75',
      caretColor: '#a78bfa',
      maxWidth: '100%',
    },
    '&.cm-focused .cm-cursor': {
      borderLeftColor: '#a78bfa',
      borderLeftWidth: '2px',
    },
    '&.cm-focused .cm-selectionBackground, ::selection': {
      backgroundColor: 'rgba(124, 58, 237, 0.3) !important',
    },
    '.cm-activeLine': {
      backgroundColor: 'rgba(255, 255, 255, 0.015)',
    },
    '.cm-header': { fontWeight: '700', color: '#ffffff' },
    '.cm-header-1': { fontSize: '1.75rem', lineHeight: '1.3' },
    '.cm-header-2': { fontSize: '1.4rem', lineHeight: '1.35' },
    '.cm-header-3': { fontSize: '1.2rem', lineHeight: '1.4' },
    '.cm-strong': { fontWeight: '700', color: '#ffffff' },
    '.cm-em': { fontStyle: 'italic', color: '#e4e4e7' },
    '.cm-link': { color: '#a78bfa', textDecoration: 'underline' },
    '.cm-url': { color: '#818cf8' },
  },
  { dark: true },
);

interface ObsidianMarkdownViewProps {
  fileId: string;
  fileName: string;
  initialContent: string;
  onDocChange: (doc: string) => void;
  onStatsChange: (stats: EditorStats) => void;
  onRenameFile?: (id: string, newName: string) => Promise<unknown> | void;
  autoFocusTitle?: boolean;
}

export default function ObsidianMarkdownView({
  fileId,
  fileName,
  initialContent,
  onDocChange,
  onStatsChange,
  onRenameFile,
  autoFocusTitle = false,
}: ObsidianMarkdownViewProps) {
  const editorRootRef = useRef<HTMLDivElement | null>(null);
  const viewRef = useRef<EditorView | null>(null);
  const debounceTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const onDocChangeRef = useRef(onDocChange);
  onDocChangeRef.current = onDocChange;
  const onStatsChangeRef = useRef(onStatsChange);
  onStatsChangeRef.current = onStatsChange;

  useEffect(() => {
    if (!editorRootRef.current) return;

    const computeStats = (state: EditorState) => {
      const doc = state.doc.toString();
      const chars = doc.length;
      const trimmed = doc.trim();
      const words = trimmed ? trimmed.split(/\s+/).length : 0;
      const head = state.selection.main.head;
      const line = state.doc.lineAt(head);
      onStatsChangeRef.current?.({
        words,
        chars,
        cursorLine: line.number,
        cursorCol: head - line.from + 1,
      });
    };

    const startState = EditorState.create({
      doc: initialContent,
      extensions: [
        history(),
        syntaxHighlighting(defaultHighlightStyle, { fallback: true }),
        markdown(),
        obsidianTheme,
        EditorView.lineWrapping,
        keymap.of([...defaultKeymap, ...historyKeymap]),
        EditorView.updateListener.of((update) => {
          if (update.docChanged || update.selectionSet) {
            computeStats(update.state);
          }
          if (update.docChanged) {
            const newDoc = update.state.doc.toString();
            if (debounceTimerRef.current) clearTimeout(debounceTimerRef.current);
            debounceTimerRef.current = setTimeout(() => {
              onDocChangeRef.current(newDoc);
            }, 300);
          }
        }),
      ],
    });

    const view = new EditorView({
      state: startState,
      parent: editorRootRef.current,
    });
    viewRef.current = view;
    computeStats(startState);

    return () => {
      if (debounceTimerRef.current) clearTimeout(debounceTimerRef.current);
      view.destroy();
      viewRef.current = null;
    };
  }, [fileId]);

  const cleanTitle = fileName.replace(/\.md$/i, '');

  const handleContainerClick = (e: React.MouseEvent) => {
    if (e.target === e.currentTarget && viewRef.current) {
      viewRef.current.focus();
    }
  };

  return (
    <div
      onClick={handleContainerClick}
      className="h-full w-full overflow-y-auto bg-[#1e1e22] cursor-text"
    >
      <div className="w-full max-w-[840px] mx-auto px-4 md:px-12 pt-6 pb-32">
        {/* Obsidian Editable Inline Title */}
        <ObsidianInlineTitle
          title={cleanTitle}
          onRename={(newTitle) => onRenameFile?.(fileId, `${newTitle}.md`)}
          onEnter={() => viewRef.current?.focus()}
          autoFocus={autoFocusTitle}
        />

        {/* Subtle Divider */}
        <div className="mt-2 mb-4 border-b border-[#282830]/80" />

        {/* CodeMirror Mounting Target */}
        <div ref={editorRootRef} className="w-full min-h-[400px]" />
      </div>
    </div>
  );
}
