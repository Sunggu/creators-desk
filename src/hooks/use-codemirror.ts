import { defaultKeymap, history, historyKeymap } from '@codemirror/commands';
import { markdown } from '@codemirror/lang-markdown';
import { defaultHighlightStyle, syntaxHighlighting } from '@codemirror/language';
import { EditorState } from '@codemirror/state';
import { EditorView, keymap, lineNumbers } from '@codemirror/view';
import { useEffect, useRef } from 'react';

const obsidianTheme = EditorView.theme(
  {
    '&': {
      color: '#dcddde',
      backgroundColor: '#1e1e22',
      height: '100%',
      fontSize: '15px',
    },
    '.cm-scroller': {
      overflow: 'auto',
      height: '100%',
    },
    '.cm-content': {
      fontFamily:
        '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, Inter, "Apple Color Emoji", sans-serif',
      padding: '32px 48px 120px 48px',
      lineHeight: '1.75',
      caretColor: '#a78bfa',
      maxWidth: '820px',
      marginLeft: 'auto',
      marginRight: 'auto',
    },
    '&.cm-focused .cm-cursor': {
      borderLeftColor: '#a78bfa',
      borderLeftWidth: '2px',
    },
    '&.cm-focused .cm-selectionBackground, ::selection': {
      backgroundColor: 'rgba(124, 58, 237, 0.32) !important',
    },
    '.cm-gutters': {
      backgroundColor: '#1e1e22',
      color: '#52525e',
      borderRight: '1px solid #282830',
      minWidth: '40px',
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

export interface EditorStats {
  words: number;
  chars: number;
  cursorLine: number;
  cursorCol: number;
}

interface UseCodeMirrorOptions {
  initialContent: string;
  onChange: (doc: string) => void;
  onStatsChange?: (stats: EditorStats) => void;
  debounceMs?: number;
}

export function useCodeMirror(
  containerRef: React.RefObject<HTMLDivElement | null>,
  options: UseCodeMirrorOptions,
) {
  const viewRef = useRef<EditorView | null>(null);
  const debounceTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const onChangeRef = useRef(options.onChange);
  onChangeRef.current = options.onChange;
  const onStatsChangeRef = useRef(options.onStatsChange);
  onStatsChangeRef.current = options.onStatsChange;

  useEffect(() => {
    if (!containerRef.current) return;

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
      doc: options.initialContent,
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
            const doc = update.state.doc.toString();
            if (debounceTimerRef.current) {
              clearTimeout(debounceTimerRef.current);
            }
            debounceTimerRef.current = setTimeout(() => {
              onChangeRef.current(doc);
            }, options.debounceMs ?? 300);
          }
        }),
      ],
    });

    const view = new EditorView({
      state: startState,
      parent: containerRef.current,
    });

    viewRef.current = view;
    computeStats(startState);

    return () => {
      if (debounceTimerRef.current) {
        clearTimeout(debounceTimerRef.current);
      }
      view.destroy();
      viewRef.current = null;
    };
  }, [containerRef, options.debounceMs]);

  useEffect(() => {
    const view = viewRef.current;
    if (!view) return;
    const currentDoc = view.state.doc.toString();
    if (options.initialContent !== currentDoc) {
      view.dispatch({
        changes: { from: 0, to: currentDoc.length, insert: options.initialContent },
      });
    }
  }, [options.initialContent]);

  return { viewRef };
}
