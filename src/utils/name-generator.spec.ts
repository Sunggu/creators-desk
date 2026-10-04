import { describe, expect, it } from 'vitest';
import {
  getUniqueFileName,
  getUniqueFolderName,
  sanitizeFileName,
} from './name-generator';

describe('name-generator utility', () => {
  it('sanitizes illegal file path characters', () => {
    const raw = '  note/with:illegal*chars?  ';
    expect(sanitizeFileName(raw)).toBe('notewithillegalchars');
  });

  it('generates Untitled.md when not existing', () => {
    expect(getUniqueFileName([])).toBe('Untitled.md');
    expect(getUniqueFileName(['Other.md'])).toBe('Untitled.md');
  });

  it('generates incremented untitled names when collision occurs', () => {
    const existing = ['Untitled.md', 'Untitled 1.md'];
    expect(getUniqueFileName(existing)).toBe('Untitled 2.md');
  });

  it('generates unique folder names', () => {
    expect(getUniqueFolderName([])).toBe('새 폴더');
    expect(getUniqueFolderName(['새 폴더', '새 폴더 1'])).toBe('새 폴더 2');
  });
});
