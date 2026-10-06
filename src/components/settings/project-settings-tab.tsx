import { useState } from 'react';
import type { VaultDto } from '../../core/domain/vault.dto';
import { useI18n } from '../../i18n/use-i18n';

interface ProjectSettingsTabProps {
  vault: VaultDto;
  onRenameVault?: (id: string, newAlias: string) => void;
}

/**
 * Active-vault identity pane.
 *
 * Separates the two kinds of identity the domain requires (Rule 8): the
 * immutable storage `key` is shown read-only, while the mutable `alias` is
 * editable.
 *
 * Timestamps render through the configured zone, from stored epoch milliseconds.
 */
export default function ProjectSettingsTab({ vault, onRenameVault }: ProjectSettingsTabProps) {
  const { t, formatDateTime } = useI18n();
  // Seeded on mount; the parent remounts this tab when the active vault changes
  // so an out-of-band alias update can never drift from the draft.
  const [alias, setAlias] = useState(vault.alias);

  const commit = () => {
    const next = alias.trim();
    if (next && next !== vault.alias) onRenameVault?.(vault.id, next);
  };

  return (
    <div className="space-y-4 text-xs text-zinc-300">
      <h4 className="font-semibold text-zinc-100">{t('settings.projectHeading')}</h4>

      <div className="space-y-3 rounded border border-zinc-800 bg-[#141417] p-3">
        <div>
          <label className="mb-1 block text-[11px] text-zinc-400">
            {t('settings.aliasLabel')}
          </label>
          <div className="flex space-x-2">
            <input
              type="text"
              value={alias}
              onChange={(e) => setAlias(e.target.value)}
              onBlur={commit}
              onKeyDown={(e) => {
                if (e.key === 'Enter') commit();
              }}
              className="flex-1 rounded border border-zinc-700 bg-[#1e1e24] px-2.5 py-1.5 text-zinc-100 outline-hidden focus:border-violet-500"
            />
            <button
              type="button"
              onClick={commit}
              className="cursor-pointer rounded bg-violet-600 px-3 py-1.5 font-medium text-white transition hover:bg-violet-500"
            >
              {t('common.save')}
            </button>
          </div>
        </div>

        <dl className="space-y-1 border-t border-zinc-800 pt-2 text-[11px] text-zinc-500">
          <IdentityRow label={t('settings.immutableKey')} value={vault.key} mono />
          <IdentityRow label={t('settings.uniqueId')} value={vault.id} mono />
          <IdentityRow label={t('settings.createdAt')} value={formatDateTime(vault.createdAt)} />
          <IdentityRow label={t('settings.updatedAt')} value={formatDateTime(vault.updatedAt)} />
        </dl>
      </div>
    </div>
  );
}

interface IdentityRowProps {
  label: string;
  value: string;
  mono?: boolean;
}

function IdentityRow({ label, value, mono = false }: IdentityRowProps) {
  return (
    <div className="flex gap-1">
      <dt>{label}:</dt>
      <dd className={mono ? 'font-mono text-zinc-400' : 'text-zinc-300'}>{value}</dd>
    </div>
  );
}