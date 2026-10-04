import { describe, expect, it } from 'vitest';
import {
  INVALID_FILE_NAME_CHARS_REGEX,
  INVALID_FILE_NAME_REGEX,
  getUniqueFileName,
  getUniqueFolderName,
  isValidFileName,
  sanitizeFileName,
} from './name-generator';

describe('name-generator utility', () => {
  it('identifies invalid file name characters with regex', () => {
    expect(INVALID_FILE_NAME_REGEX.test('normal-file')).toBe(false);
    expect(INVALID_FILE_NAME_REGEX.test('hello:world')).toBe(true);
    expect(INVALID_FILE_NAME_REGEX.test('folder/name')).toBe(true);
    expect(INVALID_FILE_NAME_REGEX.test('file*name')).toBe(true);
    expect(INVALID_FILE_NAME_REGEX.test('file?name')).toBe(true);
    expect(INVALID_FILE_NAME_REGEX.test('file<name>')).toBe(true);
    expect(INVALID_FILE_NAME_REGEX.test('file|name')).toBe(true);
    expect(INVALID_FILE_NAME_REGEX.test('file"name')).toBe(true);
    expect(INVALID_FILE_NAME_REGEX.test('path\\name')).toBe(true);
  });

  it('validates file names using isValidFileName', () => {
    expect(isValidFileName('My Document')).toBe(true);
    expect(isValidFileName('')).toBe(false);
    expect(isValidFileName('   ')).toBe(false);
    expect(isValidFileName('Invalid/Name')).toBe(false);
    expect(isValidFileName('Invalid:Name')).toBe(false);
  });

  it('sanitizes illegal file path characters using INVALID_FILE_NAME_CHARS_REGEX', () => {
    const raw = '  note/with:illegal*chars?  ';
    expect(sanitizeFileName(raw)).toBe('notewithillegalchars');
    expect(raw.replace(INVALID_FILE_NAME_CHARS_REGEX, '').trim()).toBe('notewithillegalchars');
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
