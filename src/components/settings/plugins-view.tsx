import { useTranslate } from '../../i18n/use-i18n';

/**
 * File extensions the editor recognises, with the resource ids of their labels.
 *
 * Kept as ids rather than copy so the table stays data and the wording stays in
 * the bundles - and so a new extension cannot introduce an untranslated string.
 */
const FORMATS = [
  { ext: '.md', id: 'md', builtIn: true },
  { ext: '.txt', id: 'txt', builtIn: false },
  { ext: '.json', id: 'json', builtIn: false },
  { ext: '.png / .jpg', id: 'image', builtIn: false },
] as const;

export default function PluginsView() {
  const t = useTranslate();

  return (
    <div className="space-y-4 text-xs text-zinc-300">
      <div className="rounded-md border border-violet-500/30 bg-violet-500/10 p-3.5">
        <h4 className="font-semibold text-violet-300">{t('plugins.architectureHeading')}</h4>
        <p className="mt-1.5 text-[11px] leading-relaxed text-zinc-400">
          {t('plugins.architectureBody')}
        </p>
      </div>

      <div className="space-y-2">
        <h4 className="font-semibold text-zinc-100">{t('plugins.formatsHeading')}</h4>
        <div className="space-y-2">
          {FORMATS.map((format) => (
            <FormatRow key={format.ext} ext={format.ext} builtIn={format.builtIn} id={format.id} />
          ))}
        </div>
      </div>
    </div>
  );
}

type FormatId = (typeof FORMATS)[number]['id'];

interface FormatRowProps {
  ext: string;
  builtIn: boolean;
  id: FormatId;
}

function FormatRow({ ext, builtIn, id }: FormatRowProps) {
  const t = useTranslate();

  return (
    <div className="rounded border border-zinc-800 bg-[#141417] p-3">
      <div className="mb-1 flex items-center justify-between">
        <span className="font-mono font-bold text-zinc-100">{ext}</span>
        <span
          className={`rounded px-1.5 py-0.5 text-[10px] font-medium ${
            builtIn ? 'bg-emerald-500/20 text-emerald-300' : 'bg-zinc-800 text-zinc-400'
          }`}
        >
          {builtIn ? t('plugins.statusBuiltIn') : t('plugins.statusPlanned')}
        </span>
      </div>
      <div className="text-[11px] font-medium text-zinc-300">{t(`plugins.format_${id}_name`)}</div>
      <div className="text-[11px] text-zinc-400">{t(`plugins.format_${id}_desc`)}</div>
    </div>
  );
}