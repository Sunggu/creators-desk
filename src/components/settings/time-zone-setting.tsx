import { useI18n } from '../../i18n/use-i18n';

/**
 * Time-zone picker.
 *
 * The stored value is an IANA identifier (or the `system` sentinel); the label
 * carries the current UTC offset so the choice is unambiguous. The option list is
 * built lazily by the provider on first call, because enumerating every zone the
 * runtime knows costs a few hundred `Intl` constructions.
 *
 * The offset shown next to each zone is computed for *now*, so a zone whose DST
 * rule differs appears with the offset that actually applies today.
 */
export default function TimeZoneSetting() {
  const { t, timeZone, resolvedTimeZone, isSystemTimeZone, listTimeZoneOptions, updatePreferences } =
    useI18n();

  const options = listTimeZoneOptions();

  return (
    <div>
      <div className="mb-1 font-medium text-zinc-200">{t('settings.timeZoneName')}</div>
      <p className="mb-1.5 text-[11px] text-zinc-500">{t('settings.timeZoneDescription')}</p>
      <select
        value={timeZone}
        onChange={(e) => updatePreferences({ timeZone: e.target.value })}
        aria-label={t('settings.timeZoneName')}
        className="w-full cursor-pointer rounded border border-zinc-700 bg-[#1e1e24] px-2.5 py-1.5 text-[11px] text-zinc-100 outline-hidden focus:border-violet-500"
      >
        {options.map((option) => (
          <option key={option.value} value={option.value} className="bg-[#1e1e24]">
            {option.label}
          </option>
        ))}
      </select>
      <p className="mt-1 text-[11px] text-zinc-500">
        {isSystemTimeZone
          ? t('settings.timeZoneAuto', { zone: resolvedTimeZone })
          : resolvedTimeZone}
      </p>
    </div>
  );
}