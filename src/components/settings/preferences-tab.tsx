import { nowEpochMillis } from '../../core/domain/time/epoch-millis';
import { useNowEpoch } from '../../hooks/use-now-epoch';
import { useI18n } from '../../i18n/use-i18n';
import LocaleSetting from './locale-setting';
import TimeZoneSetting from './time-zone-setting';

/**
 * Editor preferences tab: static behaviour notes plus the two live controls.
 *
 * The date preview is deliberately shown next to the pickers - it makes the
 * epoch-millis contract visible: the stored number never changes, only the
 * rendering does.
 */
export default function PreferencesTab() {
  const { t, formatDateTime, formatNumber } = useI18n();
  const now = useNowEpoch();

  return (
    <div className="space-y-4 text-xs text-zinc-300">
      <section>
        <h4 className="mb-2 font-semibold text-zinc-100">{t('settings.preferencesHeading')}</h4>
        <div className="space-y-3 rounded border border-zinc-800 bg-[#141417] p-3">
          <StaticPreferenceRow
            name={t('settings.darkThemeName')}
            description={t('settings.darkThemeDescription')}
            badge={t('common.defaultEnabled')}
          />
          <StaticPreferenceRow
            name={t('settings.autoSaveName')}
            description={t('settings.autoSaveDescription')}
            badge={t('common.enabled')}
            tone="success"
          />
        </div>
      </section>

      <section>
        <h4 className="mb-2 font-semibold text-zinc-100">{t('settings.languageHeading')}</h4>
        <div className="space-y-4 rounded border border-zinc-800 bg-[#141417] p-3">
          <LocaleSetting />
          <TimeZoneSetting />
        </div>
      </section>

      <section>
        <h4 className="mb-2 font-semibold text-zinc-100">{t('settings.previewHeading')}</h4>
        <div className="space-y-1.5 rounded border border-zinc-800 bg-[#141417] p-3 text-[11px]">
          <div className="text-zinc-300">
            {t('settings.previewNow', { value: formatDateTime(now) })}
          </div>
          <div className="font-mono text-zinc-500">
            {t('settings.previewEpoch', { value: formatNumber(nowEpochMillis()) })}
          </div>
          <p className="pt-1 leading-relaxed text-zinc-500">{t('settings.previewNote')}</p>
        </div>
      </section>
    </div>
  );
}

interface StaticPreferenceRowProps {
  name: string;
  description: string;
  badge: string;
  tone?: 'neutral' | 'success';
}

function StaticPreferenceRow({ name, description, badge, tone = 'neutral' }: StaticPreferenceRowProps) {
  const badgeClass =
    tone === 'success'
      ? 'bg-emerald-500/20 font-medium text-emerald-300'
      : 'bg-zinc-800 text-zinc-400';

  return (
    <div className="flex items-center justify-between gap-3">
      <div>
        <div className="font-medium text-zinc-200">{name}</div>
        <div className="text-[11px] text-zinc-500">{description}</div>
      </div>
      <span className={`shrink-0 rounded px-2 py-0.5 text-[10px] ${badgeClass}`}>{badge}</span>
    </div>
  );
}