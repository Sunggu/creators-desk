import { useState } from 'react';
import type { LocaleCode } from '../../core/domain/locale/locale.dto';
import { useI18n } from '../../i18n/use-i18n';

/**
 * Display name for each locale, in its own language.
 *
 * Endonyms rather than English exonyms: a reader who cannot read the current UI
 * language still recognises their own.
 */
const LOCALE_LABELS: Record<LocaleCode, 'settings.localeKorean' | 'settings.localeEnglish'> = {
  ko: 'settings.localeKorean',
  en: 'settings.localeEnglish',
};

const LOCALE_ORDER: readonly LocaleCode[] = ['ko', 'en'];

export default function LocaleSetting() {
  const { t, locale, updatePreferences } = useI18n();
  // Mirrors the committed value so the control stays responsive even if the
  // parent defers persistence.
  const [pending, setPending] = useState<LocaleCode>(locale);

  const select = (next: LocaleCode) => {
    setPending(next);
    updatePreferences({ locale: next });
  };

  return (
    <div>
      <div className="mb-1 font-medium text-zinc-200">{t('settings.languageName')}</div>
      <p className="mb-1.5 text-[11px] text-zinc-500">{t('settings.languageDescription')}</p>
      <div className="flex gap-1.5" role="group" aria-label={t('settings.languageName')}>
        {LOCALE_ORDER.map((code) => (
          <button
            key={code}
            type="button"
            onClick={() => select(code)}
            aria-pressed={pending === code}
            className={`flex-1 cursor-pointer rounded border px-2.5 py-1.5 text-[11px] font-medium transition ${
              pending === code
                ? 'border-violet-500/60 bg-violet-600/20 text-violet-300'
                : 'border-zinc-700 bg-[#1e1e24] text-zinc-400 hover:text-zinc-200'
            }`}
          >
            {t(LOCALE_LABELS[code])}
          </button>
        ))}
      </div>
    </div>
  );
}