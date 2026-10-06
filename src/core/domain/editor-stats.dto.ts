export interface EditorStats {
  words: number;
  chars: number;
  cursorLine: number;
  cursorCol: number;
}

export const EMPTY_EDITOR_STATS: EditorStats = {
  words: 0,
  chars: 0,
  cursorLine: 1,
  cursorCol: 1,
};
