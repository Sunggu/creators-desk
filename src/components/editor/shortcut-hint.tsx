import { useTranslate } from '../../i18n/use-i18n';

type ShortcutHintKey = 'editor.dragDropHint' | 'editor.shiftClickHint' | 'editor.ctrlClickHint' | 'editor.rightClickHint';
type ShortcutLabelKey = 'editor.dragDropLabel' | 'editor.shiftClickLabel' | 'editor.ctrlClickLabel' | 'editor.rightClickLabel';

interface ShortcutHintProps {
  hint: ShortcutHintKey;
  label: ShortcutLabelKey;
}

/** One "gesture: what it does" row in the editor's empty state. */
export default function ShortcutHint({ hint, label }: ShortcutHintProps) {
  const t = useTranslate();
  return (
    <div>
      <span className="text-zinc-400">{t(hint)}</span>: {t(label)}
    </div>
  );
}
