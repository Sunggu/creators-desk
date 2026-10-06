import { EditorState } from '@codemirror/state';
import { describe, expect, it } from 'vitest';
import { computeEditorStats, countWords } from './editor-stats';

function state(doc: string, anchor = 0) {
  return EditorState.create({ doc, selection: { anchor } });
}

describe('countWords', () => {
  it('counts whitespace-delimited words', () => {
    expect(countWords('one two three')).toBe(3);
  });

  it('collapses runs of whitespace', () => {
    expect(countWords('  one \n\n two \t three  ')).toBe(3);
  });

  it('returns zero for an empty or whitespace-only document', () => {
    expect(countWords('')).toBe(0);
    expect(countWords('   \n  ')).toBe(0);
  });

  it('counts a single word', () => {
    expect(countWords('markdown')).toBe(1);
  });
});

describe('computeEditorStats', () => {
  it('reports characters as the raw document length', () => {
    expect(computeEditorStats(state('hello')).chars).toBe(5);
  });

  it('reports the word count of the whole document, newlines included', () => {
    expect(computeEditorStats(state('one two\nthree')).words).toBe(3);
  });

  it('reports a 1-based line number for the cursor', () => {
    expect(computeEditorStats(state('a\nbb\nccc', 4)).cursorLine).toBe(2);
  });

  it('reports a 1-based column relative to the cursor line', () => {
    // Offset 4 is the newline closing line 2, so the column is 3 on that line.
    expect(computeEditorStats(state('a\nbb\nccc', 4)).cursorCol).toBe(3);
    expect(computeEditorStats(state('a\nbb\nccc', 5)).cursorCol).toBe(1);
  });

  it('starts at line 1 column 1', () => {
    expect(computeEditorStats(state('abc'))).toMatchObject({ cursorLine: 1, cursorCol: 1 });
  });

  it('clamps a cursor at end-of-document to the final line', () => {
    expect(computeEditorStats(state('a\nbb', 4))).toMatchObject({ cursorLine: 2, cursorCol: 3 });
  });
});
