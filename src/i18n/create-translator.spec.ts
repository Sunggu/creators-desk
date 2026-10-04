import { createTranslator, findMissingKeys } from './create-translator';
import { describe, expect, it } from 'vitest';
import type { TranslationTable } from './translator.dto';

const ko: TranslationTable = {
  common: {
    save: '저장',
    selected: '{{count}}개 선택됨',
    saved: '저장됨',
  },
};

const en: TranslationTable = {
  common: {
    save: 'Save',
    selected_one: '{{count}} item selected',
    selected_other: '{{count}} items selected',
    saved: 'Saved',
  },
};

const catalog = { ko, en };

describe('createTranslator', () => {
  it('resolves a key in the active locale', () => {
    expect(createTranslator('ko', catalog).t('common.save')).toBe('저장');
    expect(createTranslator('en', catalog).t('common.save')).toBe('Save');
  });

  it('substitutes placeholders', () => {
    expect(createTranslator('ko', catalog).t('common.selected', { count: 3 })).toBe('3개 선택됨');
  });

  it('selects plural variants for English', () => {
    const t = createTranslator('en', catalog).t;
    expect(t('common.selected', { count: 1 })).toBe('1 item selected');
    expect(t('common.selected', { count: 5 })).toBe('5 items selected');
  });

  it('uses the base form for Korean, which has a single plural category', () => {
    const t = createTranslator('ko', catalog).t;
    expect(t('common.selected', { count: 1 })).toBe('1개 선택됨');
    expect(t('common.selected', { count: 7 })).toBe('7개 선택됨');
  });

  it('falls back per-key to the baseline locale', () => {
    const partial: TranslationTable = { common: { save: 'Save' } };
    const t = createTranslator('en', { ko, en: partial }).t;
    expect(t('common.save')).toBe('Save');
    expect(t('common.saved')).toBe('저장됨');
  });

  it('returns the key itself when nothing matches, never an empty string', () => {
    const t = createTranslator('en', catalog).t;
    expect(t('common.missing')).toBe('common.missing');
  });

  it('leaves unknown placeholders verbatim so gaps are visible', () => {
    const partial: TranslationTable = { common: { greet: '안녕 {{name}}님 {{surname}}' } };
    const t = createTranslator('ko', { ko: partial, en: partial }).t;
    expect(t('common.greet', { name: '민수' })).toBe('안녕 민수님 {{surname}}');
  });

  it('exposes has() for existence checks', () => {
    const t = createTranslator('ko', catalog);
    expect(t.has('common.save')).toBe(true);
    expect(t.has('common.missing')).toBe(false);
  });

  it('falls back to the baseline key when count is not a number', () => {
    expect(createTranslator('en', catalog).t('common.selected', { count: '3' as never })).toBe('3개 선택됨');
  });
});

describe('findMissingKeys', () => {
  it('reports nothing for a complete bundle', () => {
    expect(findMissingKeys(catalog)).toEqual([]);
  });

  it('reports keys missing from a non-baseline locale, collapsing plural families', () => {
    const partial: TranslationTable = { common: { save: 'Save' } };
    expect(findMissingKeys({ ko, en: partial })).toEqual([
      'en:common.selected',
      'en:common.saved',
    ]);
  });

  it('does not flag a family the locale covers with a single base key', () => {
    const noVariants: TranslationTable = { common: { save: 'Save', selected: 'x', saved: 'y' } };
    expect(findMissingKeys({ ko, en: noVariants })).toEqual([]);
  });
});