import { defaultKeymap, history, historyKeymap } from '@codemirror/commands';
import { markdown } from '@codemirror/lang-markdown';
import { defaultHighlightStyle, syntaxHighlighting } from '@codemirror/language';
import { EditorState } from '@codemirror/state';
import { EditorView, keymap } from '@codemirror/view';
import { useCallback, useEffect, useRef } from 'react';
import type { EditorStats } from '../core/domain/editor-stats.dto';
import { computeEditorStats } from './editor-stats';
import { obsidianEditorTheme } from './obsidian-editor-theme';

/** Debounce window before a keystroke batch is persisted. */
export const AUTOSAVE_DEBOUNCE_MS = 300;

interface UseMarkdownEditorOptions {
  /** Document loaded once per mount; the caller remounts via `key` per file. */
  initialContent: string;
  onDocChange: (doc: string) => void;
  onStatsChange: (stats: EditorStats) => void;
}

interface MarkdownEditorBinding {
  rootRef: React.RefObject<HTMLDivElement | null>;
  focus: () => void;
}

/**
 * Owns the CodeMirror lifecycle for one note: mount, report stats, debounce
 * autosave, and flush any pending edit on unmount so switching tabs can never
 * silently discard the last keystrokes.
 */
export function useMarkdownEditor({
  initialContent,
  onDocChange,
  onStatsChange,
}: UseMarkdownEditorOptions): MarkdownEditorBinding {
  const rootRef = useRef<HTMLDivElement | null>(null);
  const viewRef = useRef<EditorView | null>(null);
  const timerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const pendingDocRef = useRef<string | null>(null);
  const onDocChangeRef = useRef(onDocChange);
  const onStatsChangeRef = useRef(onStatsChange);
  const isApplyingRemoteRef = useRef(false);
  const initialContentRef = useRef(initialContent);

  useEffect(() => {
    onDocChangeRef.current = onDocChange;
    onStatsChangeRef.current = onStatsChange;
  }, [onDocChange, onStatsChange]);

  useEffect(() => {
    const root = rootRef.current;
    if (!root) return;

    const view = new EditorView({
      state: EditorState.create({
        doc: initialContentRef.current,
        extensions: [
          history(),
          syntaxHighlighting(defaultHighlightStyle, { fallback: true }),
          markdown(),
          obsidianEditorTheme,
          EditorView.lineWrapping,
          keymap.of([...defaultKeymap, ...historyKeymap]),
          EditorView.updateListener.of((update) => {
            if (update.docChanged || update.selectionSet) {
              onStatsChangeRef.current(computeEditorStats(update.state));
            }
            if (!update.docChanged) return;
            if (isApplyingRemoteRef.current) return;

            pendingDocRef.current = update.state.doc.toString();
            if (timerRef.current) clearTimeout(timerRef.current);
            timerRef.current = setTimeout(() => {
              pendingDocRef.current = null;
              timerRef.current = null;
              onDocChangeRef.current(update.state.doc.toString());
            }, AUTOSAVE_DEBOUNCE_MS);
          }),
        ],
      }),
      parent: root,
    });

    viewRef.current = view;
    onStatsChangeRef.current(computeEditorStats(view.state));

    return () => {
      // Flush the debounced edit before teardown so tab switches never lose text.
      if (timerRef.current) {
        clearTimeout(timerRef.current);
        timerRef.current = null;
        const pending = pendingDocRef.current;
        pendingDocRef.current = null;
        if (pending !== null) onDocChangeRef.current(pending);
      }
      view.destroy();
      viewRef.current = null;
    };
  }, []);

  useEffect(() => {
    const view = viewRef.current;
    if (!view) return;
    if (pendingDocRef.current !== null) return;
    if (view.state.doc.toString() === initialContent) return;

    const mainSel = view.state.selection.main;
    const clampedAnchor = Math.min(mainSel.anchor, initialContent.length);
    const clampedHead = Math.min(mainSel.head, initialContent.length);

    isApplyingRemoteRef.current = true;
    try {
      view.dispatch({
        changes: { from: 0, to: view.state.doc.length, insert: initialContent },
        selection: { anchor: clampedAnchor, head: clampedHead },
      });
    } finally {
      isApplyingRemoteRef.current = false;
    }
  }, [initialContent]);

  const focus = useCallback(() => {
    viewRef.current?.focus();
  }, []);

  return { rootRef, focus };
}
