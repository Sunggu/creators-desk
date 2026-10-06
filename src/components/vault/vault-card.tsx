import type { VaultDto } from '../../core/domain/vault.dto';
import { useI18n } from '../../i18n/use-i18n';
import MonochromeIcon from '../../ui/icon/monochrome-icon';

interface VaultCardProps {
  vault: VaultDto;
  onSelect: (id: string) => void;
  onDelete: (id: string) => void;
}

export default function VaultCard({ vault, onSelect, onDelete }: VaultCardProps) {
  const { t, formatDate } = useI18n();

  // `updatedAt` is epoch milliseconds; the configured time zone is applied here,
  // at the edge, rather than baked into the stored value.
  const formattedDate = formatDate(vault.updatedAt);

  return (
    <div
      onClick={() => onSelect(vault.id)}
      className="group relative flex cursor-pointer flex-col justify-between rounded-xl border border-zinc-800 bg-zinc-900/60 p-5 transition-all duration-150 hover:border-sky-500/50 hover:bg-zinc-900"
    >
      <div className="flex items-start justify-between">
        <div className="flex items-center space-x-3">
          <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-sky-500/10 text-sky-400">
            <MonochromeIcon name="folder" className="h-5 w-5" />
          </div>
          <div>
            <h3 className="font-semibold text-zinc-100 group-hover:text-sky-300">{vault.name}</h3>
            <p className="text-xs text-zinc-400">
              {t('vault.lastModified', { date: formattedDate })}
            </p>
          </div>
        </div>

        <button
          onClick={(e) => {
            e.stopPropagation();
            if (confirm(t('vault.deleteConfirmWithFiles', { name: vault.name }))) {
              onDelete(vault.id);
            }
          }}
          className="opacity-0 transition-opacity duration-150 hover:text-rose-400 group-hover:opacity-100 text-zinc-500 p-1"
          title={t('vault.deleteTitle')}
        >
          <MonochromeIcon name="trash" />
        </button>
      </div>
    </div>
  );
}
