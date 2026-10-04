import { describe, expect, it } from 'vitest';
import {
  createResourceTranslator,
  resourceCatalog,
  verifyResourceCoverage,
  type ResourceKey,
} from './index';
import { SUPPORTED_LOCALES } from '../../core/domain/locale/locale.dto';
import type { AppErrorCode } from '../../core/domain/errors/app-error-code.dto';

describe('resource bundles', () => {
  it('has a bundle for every supported locale', () => {
    for (const locale of SUPPORTED_LOCALES) {
      expect(resourceCatalog[locale]).toBeDefined();
    }
  });

  it('covers every baseline key in every locale', () => {
    expect(verifyResourceCoverage()).toEqual([]);
  });

  it('keeps the same namespace set across locales', () => {
    const baseline = Object.keys(resourceCatalog.ko).sort();
    for (const locale of SUPPORTED_LOCALES) {
      expect(Object.keys(resourceCatalog[locale]).sort()).toEqual(baseline);
    }
  });
});

describe('error namespace', () => {
  it('provides a message for every AppErrorCode', () => {
    const translator = createResourceTranslator('ko');
    const codes: AppErrorCode[] = [
      'vault.nameRequired',
      'vault.notFound',
      'file.nameRequired',
      'file.notFound',
      'file.moveIntoSelf',
      'file.moveIntoDescendant',
    ];

    for (const code of codes) {
      const key = `error.${code}` as ResourceKey;
      expect(translator.has(key)).toBe(true);
      expect(translator.t(key)).not.toBe(key);
      expect(createResourceTranslator('en').has(key)).toBe(true);
    }
  });
});

describe('licence notice copy', () => {
  it('never promises a blanket commercial-use guarantee', () => {
    for (const locale of SUPPORTED_LOCALES) {
      const copy = JSON.stringify(resourceCatalog[locale].licenses);
      expect(copy).not.toMatch(/상업적 이용 보장|상업용 허용|Commercial use guaranteed|Commercial use OK/);
    }
  });

  it('states the copyleft source-code obligation instead', () => {
    for (const locale of SUPPORTED_LOCALES) {
      const translator = createResourceTranslator(locale);
      const heading = translator.t('licenses.sourceOfferHeading', { license: 'AGPL-3.0' });
      expect(heading).toContain('AGPL-3.0');
      expect(translator.t('licenses.sourceOfferNetworkBody')).not.toBe('');
      expect(translator.t('licenses.sourceOfferBundleBody')).not.toBe('');
    }
  });

  it('resolves every placeholder in the licence copy', () => {
    for (const locale of SUPPORTED_LOCALES) {
      const translator = createResourceTranslator(locale);
      expect(translator.t('licenses.copyright', { year: '2026', holder: 'Example' })).not.toContain(
        '{{',
      );
      expect(translator.t('licenses.intro')).not.toContain('{{');
    }
  });
});

describe('locale parity for user-facing chrome', () => {
  it('translates the same keys to different copy', () => {
    const ko = createResourceTranslator('ko');
    const en = createResourceTranslator('en');

    expect(ko.t('panel.explorerTitle')).toBe('파일 탐색기');
    expect(en.t('panel.explorerTitle')).toBe('File Explorer');
    expect(en.t('mobile.switchToReadMode')).not.toBe(ko.t('mobile.switchToReadMode'));
  });

  it('interpolates the seeded starter note in both locales', () => {
    for (const locale of SUPPORTED_LOCALES) {
      const copy = createResourceTranslator(locale).t('vault.starterContent', {
        appName: 'Creators Desk',
      });
      expect(copy).toContain('Creators Desk');
      expect(copy).not.toContain('{{');
    }
  });
});