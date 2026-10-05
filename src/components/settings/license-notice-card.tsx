import { APP_VERSION } from '../../core/app-version';
import { NOTICE_PAGE_URL, PROJECT_LICENSE } from '../../core/project-license';
import { useTranslate } from '../../i18n/use-i18n';

/**
 * Product license identity.
 *
 * Legal *values* come from `PROJECT_LICENSE` and are never translated; only the
 * surrounding labels are, so the notice cannot drift from the actual licence.
 */
export default function LicenseNoticeCard({ className = '' }: { className?: string }) {
  const t = useTranslate();

  return (
    <section className={`rounded-md border border-zinc-800 bg-[#141417] p-3 ${className}`}>
      <h4 className="font-semibold text-zinc-100">{t('licenses.productLicenseHeading')}</h4>
      <dl className="mt-2 grid grid-cols-[5.5rem_1fr] gap-x-3 gap-y-1 text-[11px] text-zinc-400">
        <dt className="text-zinc-500">{t('licenses.productLabel')}</dt>
        <dd className="text-zinc-200">
          {PROJECT_LICENSE.productName}{' '}
          <span className="font-mono text-zinc-500">v{APP_VERSION}</span>
        </dd>
        <dt className="text-zinc-500">{t('licenses.licenseLabel')}</dt>
        <dd>
          <span className="rounded bg-violet-500/15 px-1.5 py-0.5 font-mono text-[10px] font-semibold text-violet-300">
            {PROJECT_LICENSE.licenseId}
          </span>
        </dd>
        <dt className="text-zinc-500">{t('licenses.copyrightLabel')}</dt>
        <dd className="text-zinc-300">
          {t('licenses.copyright', {
            year: PROJECT_LICENSE.copyrightYear,
            holder: PROJECT_LICENSE.copyrightHolder,
          })}
        </dd>
        <dt className="text-zinc-500">{t('licenses.licenseFileLabel')}</dt>
        <dd className="text-zinc-400">{t('licenses.licenseFileValue')}</dd>
      </dl>
    </section>
  );
}

export function NoticePageLink({ className = '' }: { className?: string }) {
  const t = useTranslate();

  return (
    <a
      href={NOTICE_PAGE_URL}
      target="_blank"
      rel="noreferrer noopener"
      className={`inline-flex items-center gap-1.5 rounded bg-violet-600 px-3 py-1.5 text-[11px] font-medium text-white transition hover:bg-violet-500 ${className}`}
    >
      <span aria-hidden="true">📜</span>
      {t('licenses.viewFull')}
    </a>
  );
}
