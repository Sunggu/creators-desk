import { defaultKeymap, history, historyKeymap } from '@codemirror/commands';
import { markdown } from '@codemirror/lang-markdown';
import { defaultHighlightStyle, syntaxHighlighting } from '@codemirror/language';
import { EditorState } from '@codemirror/state';
import { EditorView, keymap, lineNumbers } from '@codemirror/view';
import { useEffect, useRef } from 'react';
import type { EditorStats } from '../../hooks/use-codemirror';

const obsidianTheme = EditorView.theme(
  {
    '&': {
      color: '#dcddde',
      backgroundColor: '#1e1e22',
      height: '100%',
      fontSize: '15px',
    },
    '.cm-scroller': {
      overflow: 'visible',
      fontFamily:
        '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, Inter, sans-serif',
    },
    '.cm-content': {
      padding: '16px 20px 160px 20px',
      lineHeight: '1.75',
      caretColor: '#a78bfa',
      maxWidth: '840px',
      marginLeft: 'auto',
      marginRight: 'auto',
    },
    '@media (min-width: 768px)': {
      '.cm-content': {
        padding: '24px 48px 180px 48px',
      },
    },
    '&.cm-focused .cm-cursor': {
      borderLeftColor: '#a78bfa',
      borderLeftWidth: '2px',
    },
    '&.cm-focused .cm-selectionBackground, ::selection': {
      backgroundColor: 'rgba(124, 58, 237, 0.35) !important',
    },
    '.cm-gutters': {
      backgroundColor: '#1e1e22',
      color: '#555560',
      borderRight: '1px solid #282830',
      minWidth: '32px',
    },
    '.cm-activeLineGutter': {
      backgroundColor: '#26262e',
      color: '#a1a1aa',
    },
    '.cm-activeLine': {
      backgroundColor: 'rgba(255, 255, 255, 0.025)',
    },
  },
  { dark: true },
);

interface ObsidianMarkdownViewProps {
  fileId: string;
  fileName: string;
  initialContent: string;
  onDocChange: (doc: string) => void;
  onStatsChange: (stats: EditorStats) => void;
}

export default function ObsidianMarkdownView({
  fileId,
  fileName,
  initialContent,
  onDocChange,
  onStatsChange,
}: ObsidianMarkdownViewProps) {
  const editorRootRef = useRef<HTMLDivElement | null>(null);
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
        lineNumbers(),
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
            if (debounceTimerRef.current) {
              clearTimeout(debounceTimerRef.current);
            }
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

    computeStats(startState);

    return () => {
      if (debounceTimerRef.current) clearTimeout(debounceTimerRef.current);
      view.destroy();
    };
  }, [fileId]);

  const cleanTitle = fileName.replace(/\.md$/i, '');

  return (
    <div className="h-full w-full overflow-y-auto bg-[#1e1e22]">
      {/* Obsidian Note Title Header */}
      <div className="max-w-[840px] mx-auto pt-6 px-4 md:px-12 pb-2 select-text">
        <h1 className="text-2xl md:text-3xl font-extrabold text-zinc-100 tracking-tight">
          {cleanTitle}
        </h1>
        <div className="mt-3 border-b border-[#282830]" />
      </div>

      {/* CodeMirror Mounting Target */}
      <div ref={editorRootRef} className="w-full" />
    </div>
  );
}
