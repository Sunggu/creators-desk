import type { EditorState } from '@codemirror/state';
import type { EditorStats } from '../core/domain/editor-stats.dto';

/** Whitespace-delimited word count; blank documents count as zero. */
export function countWords(doc: string): number {
  const trimmed = doc.trim();
  return trimmed ? trimmed.split(/\s+/).length : 0;
}

/**
 * Derives the status-bar readout from the editor state. Pure so word/char and
 * cursor-position rules can be verified without mounting CodeMirror.
 */
export function computeEditorStats(state: EditorState): EditorStats {
  const doc = state.doc.toString();
  const head = state.selection.main.head;
  const line = state.doc.lineAt(head);
  return {
    words: countWords(doc),
    chars: doc.length,
    cursorLine: line.number,
    cursorCol: head - line.from + 1,
  };
}
