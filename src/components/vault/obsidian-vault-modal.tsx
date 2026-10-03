import { useState } from 'react';
import type { VaultDto } from '../../core/domain/vault.dto';

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
            <h2 className="text-base font-bold text-zinc-100">Vault 관리</h2>
            <p className="text-xs text-zinc-400">작업 공간을 전환하거나 새로 생성합니다.</p>
          </div>
          <button
            onClick={onClose}
            className="rounded p-1 text-zinc-400 hover:bg-[#262630] hover:text-zinc-100"
          >
            <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
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
                  <svg className="h-4 w-4 text-zinc-400 group-hover:text-violet-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.75} d="M3 7v10a2 2 0 002 2h14a2 2 0 002-2V9a2 2 0 00-2-2h-6l-2-2H5a2 2 0 00-2 2z" />
                  </svg>
                  <span>{vault.name}</span>
                  {isActive && (
                    <span className="rounded bg-violet-500/30 px-1.5 py-0.5 text-[10px] text-violet-300">
                      현재 열림
                    </span>
                  )}
                </div>

                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    if (confirm(`'${vault.name}' Vault를 삭제하시겠습니까?`)) {
                      onDeleteVault(vault.id);
                    }
                  }}
                  className="opacity-0 group-hover:opacity-100 p-1 text-zinc-500 hover:text-rose-400 transition"
                  title="Vault 삭제"
                >
                  <svg className="h-3.5 w-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                  </svg>
                </button>
              </div>
            );
          })}
        </div>

        {/* Create Form */}
        <form onSubmit={handleCreate} className="mt-5 border-t border-[#292933] pt-4">
          <label className="block text-xs font-medium text-zinc-400">새 Vault 생성</label>
          <div className="mt-1.5 flex space-x-2">
            <input
              type="text"
              value={newVaultName}
              onChange={(e) => setNewVaultName(e.target.value)}
              placeholder="Vault 이름 입력..."
              className="flex-1 rounded-lg border border-[#32323c] bg-[#121215] px-3 py-1.5 text-xs text-zinc-100 placeholder-zinc-500 outline-hidden focus:border-violet-500"
            />
            <button
              type="submit"
              disabled={isCreating || !newVaultName.trim()}
              className="rounded-lg bg-violet-600 px-3.5 py-1.5 text-xs font-semibold text-white hover:bg-violet-500 disabled:opacity-50 transition"
            >
              생성
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
