import { PROJECT_LICENSE } from '../../core/project-license';
import { useTranslate } from '../../i18n/use-i18n';

/**
 * Corresponding-source notice (AGPL-3.0 §13).
 *
 * Required by the licence this product is distributed under, which is why the
 * heading and body live in the resource bundles: a translated product still has
 * to satisfy the same obligation in every locale.
 */
export default function SourceCodeOffer({ className = '' }: { className?: string }) {
  const t = useTranslate();

  return (
    <section className={`rounded-md border border-emerald-500/30 bg-emerald-500/5 p-3 ${className}`}>
      <div className="flex items-center gap-2">
        <span className="flex h-2 w-2 shrink-0 rounded-full bg-emerald-400" aria-hidden="true" />
        <h4 className="text-[12px] font-semibold text-emerald-300">
          {t('licenses.sourceOfferHeading', { license: PROJECT_LICENSE.licenseId })}
        </h4>
      </div>
      <p className="mt-1.5 text-[11px] leading-relaxed text-zinc-400">
        {t('licenses.sourceOfferNetworkBody')}
      </p>
      <p className="mt-1.5 text-[11px] leading-relaxed text-zinc-400">
        {t('licenses.sourceOfferBundleBody')}
      </p>
      <a
        href={PROJECT_LICENSE.sourceUrl}
        target="_blank"
        rel="noreferrer noopener"
        className="mt-2 inline-block break-all font-mono text-[11px] text-emerald-400 hover:underline"
      >
        {PROJECT_LICENSE.sourceUrl}
      </a>
    </section>
  );
}
