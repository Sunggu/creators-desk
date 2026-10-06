import { useState } from 'react';
import type { VaultDto } from '../../core/domain/vault.dto';
import { useTranslate } from '../../i18n/use-i18n';
import MonochromeIcon from '../../ui/icon/monochrome-icon';

interface ObsidianVaultModalProps {
  isOpen: boolean;
  activeVaultId: string;
  vaults: VaultDto[];
  onClose: () => void;
  onSelectVault: (id: string) => void;
  onCreateVault: (name: string) => Promise<VaultDto>;
  onDeleteVault: (id: string) => void;
}

export default function ObsidianVaultModal({
  isOpen,
  activeVaultId,
  vaults,
  onClose,
  onSelectVault,
  onCreateVault,
  onDeleteVault,
}: ObsidianVaultModalProps) {
  const t = useTranslate();
  const [newVaultName, setNewVaultName] = useState('');
  const [isCreating, setIsCreating] = useState(false);

  if (!isOpen) return null;

  const handleCreate = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newVaultName.trim()) return;
    try {
      setIsCreating(true);
      await onCreateVault(newVaultName.trim());
      setNewVaultName('');
      onClose();
    } finally {
      setIsCreating(false);
    }
  };

  return (
    <div
      onClick={onClose}
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-xs p-4"
    >
      <div
        onClick={(e) => e.stopPropagation()}
        className="w-full max-w-lg rounded-xl border border-[#2e2e38] bg-[#1a1a1f] p-6 shadow-2xl text-zinc-100"
      >
        <div className="flex items-center justify-between border-b border-[#292933] pb-3">
          <div>
            <h2 className="text-base font-bold text-zinc-100">{t('vault.manageTitle')}</h2>
            <p className="text-xs text-zinc-400">{t('vault.manageSubtitle')}</p>
          </div>
          <button
            onClick={onClose}
            className="rounded p-1 text-zinc-400 hover:bg-[#262630] hover:text-zinc-100"
          >
            <MonochromeIcon name="close" />
          </button>
        </div>

        {/* Existing Vaults */}
        <div className="mt-4 max-h-60 overflow-y-auto space-y-1.5 pr-1">
          {vaults.map((vault) => {
            const isActive = vault.id === activeVaultId;
            return (
              <div
                key={vault.id}
                onClick={() => {
                  onSelectVault(vault.id);
                  onClose();
                }}
                className={`group flex cursor-pointer items-center justify-between rounded-lg px-3.5 py-2.5 text-xs transition ${
                  isActive
                    ? 'bg-violet-600/20 text-violet-300 font-semibold border border-violet-500/40'
                    : 'bg-[#202026] text-zinc-300 hover:bg-[#282830] hover:text-zinc-100'
                }`}
              >
                <div className="flex items-center space-x-2.5">
                  <MonochromeIcon name="folder" className="h-4 w-4 text-zinc-400 group-hover:text-violet-400" />
                  <span>{vault.name}</span>
                  {isActive && (
                    <span className="rounded bg-violet-500/30 px-1.5 py-0.5 text-[10px] text-violet-300">
                      {t('vault.currentlyOpen')}
                    </span>
                  )}
                </div>

                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    if (confirm(t('vault.deleteConfirm', { name: vault.name }))) {
                      onDeleteVault(vault.id);
                    }
                  }}
                  className="opacity-0 group-hover:opacity-100 p-1 text-zinc-500 hover:text-rose-400 transition"
                  title={t('vault.deleteTitle')}
                >
                  <MonochromeIcon name="trash" className="h-3.5 w-3.5" />
                </button>
              </div>
            );
          })}
        </div>

        {/* Create Form */}
        <form onSubmit={handleCreate} className="mt-5 border-t border-[#292933] pt-4">
          <label className="block text-xs font-medium text-zinc-400">{t('vault.createLabel')}</label>
          <div className="mt-1.5 flex space-x-2">
            <input
              type="text"
              value={newVaultName}
              onChange={(e) => setNewVaultName(e.target.value)}
              placeholder={t('vault.namePlaceholder')}
              className="flex-1 rounded-lg border border-[#32323c] bg-[#121215] px-3 py-1.5 text-xs text-zinc-100 placeholder-zinc-500 outline-hidden focus:border-violet-500"
            />
            <button
              type="submit"
              disabled={isCreating || !newVaultName.trim()}
              className="rounded-lg bg-violet-600 px-3.5 py-1.5 text-xs font-semibold text-white hover:bg-violet-500 disabled:opacity-50 transition"
            >
              {t('common.create')}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
