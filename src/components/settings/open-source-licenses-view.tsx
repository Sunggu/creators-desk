import { PROJECT_LICENSE } from '../../core/project-license';
import { useTranslate } from '../../i18n/use-i18n';
import LicenseNoticeCard, { NoticePageLink } from './license-notice-card';
import SourceCodeOffer from './source-code-offer';

/** Explanatory bullets about how the notices are produced. */
const ABOUT_KEYS = [
  'licenses.aboutScope',
  'licenses.aboutGenerated',
  'licenses.aboutContact',
] as const;

export default function OpenSourceLicensesView() {
  const t = useTranslate();

  return (
    <div className="space-y-3 text-xs text-zinc-300">
      <p className="text-[11px] leading-relaxed text-zinc-400">{t('licenses.intro')}</p>

      <LicenseNoticeCard />
      <SourceCodeOffer />

      <section className="rounded-md border border-zinc-800 bg-[#141417] p-3">
        <h4 className="font-semibold text-zinc-100">{t('licenses.aboutHeading')}</h4>
        <ul className="mt-1.5 space-y-1 text-[11px] leading-relaxed text-zinc-400">
          {ABOUT_KEYS.map((key) => (
            <li key={key}>{t(key)}</li>
          ))}
        </ul>
        <p className="mt-2 text-[11px] text-zinc-400">
          {t('licenses.contactPrefix')}{' '}
          <a
            href={`mailto:${PROJECT_LICENSE.contactEmail}`}
            className="text-violet-300 hover:underline"
          >
            {PROJECT_LICENSE.contactEmail}
          </a>
        </p>
      </section>

      <div className="pt-1">
        <NoticePageLink />
      </div>
    </div>
  );
}
