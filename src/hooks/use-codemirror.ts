import { defaultKeymap, history, historyKeymap } from '@codemirror/commands';
import { markdown } from '@codemirror/lang-markdown';
import { defaultHighlightStyle, syntaxHighlighting } from '@codemirror/language';
import { EditorState } from '@codemirror/state';
import { EditorView, keymap, lineNumbers } from '@codemirror/view';
import { useEffect, useRef } from 'react';

const obsidianTheme = EditorView.theme({
  '&': {
    color: '#e4e4e7',
    backgroundColor: '#09090b',
    height: '100%',
    fontSize: '15px',
  },
  '.cm-content': {
    fontFamily: 'ui-monospace, SFMono-Regular, Menlo, Monaco, Consolas, monospace',
    padding: '24px 32px',
    lineHeight: '1.7',
    caretColor: '#38bdf8',
  },
  '&.cm-focused .cm-cursor': {
    borderLeftColor: '#38bdf8',
  },
  '&.cm-focused .cm-selectionBackground, ::selection': {
    backgroundColor: 'rgba(56, 189, 248, 0.25)',
  },
  '.cm-gutters': {
    backgroundColor: '#09090b',
    color: '#52525b',
    borderRight: '1px solid #18181b',
  },
  '.cm-activeLineGutter': {
    backgroundColor: '#18181b',
    color: '#a1a1aa',
  },
  '.cm-activeLine': {
    backgroundColor: 'rgba(39, 39, 42, 0.3)',
  },
}, { dark: true });

interface UseCodeMirrorOptions {
  initialContent: string;
  onChange: (doc: string) => void;
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

  useEffect(() => {
    if (!containerRef.current) return;

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

    return () => {
      if (debounceTimerRef.current) {
        clearTimeout(debounceTimerRef.current);
      }
      view.destroy();
      viewRef.current = null;
    };
    // Re-initialize only when containerRef changes or new file mounted
  }, [containerRef, options.debounceMs]);

  // Keep doc in sync if initialContent changed externally
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
