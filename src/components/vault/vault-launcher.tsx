import { useState } from 'react';
import type { VaultDto } from '../../core/domain/vault.dto';
import CreateVaultDialog from './create-vault-dialog';
import VaultCard from './vault-card';
import MonochromeIcon from '../../ui/icon/monochrome-icon';

interface VaultLauncherProps {
  vaults: VaultDto[];
  isLoading: boolean;
  onSelectVault: (vaultId: string) => void;
  onCreateVault: (name: string) => Promise<VaultDto>;
  onDeleteVault: (vaultId: string) => void;
}

export default function VaultLauncher({
  vaults,
  isLoading,
  onSelectVault,
  onCreateVault,
  onDeleteVault,
}: VaultLauncherProps) {
  const [isDialogOpen, setIsDialogOpen] = useState(false);

  return (
    <main className="flex min-h-screen flex-col items-center justify-center bg-zinc-950 p-6 text-zinc-100">
      <div className="w-full max-w-2xl space-y-8">
        <header className="flex flex-col items-center text-center">
          <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-sky-500/10 text-sky-400 ring-1 ring-sky-500/30">
            <MonochromeIcon name="inbox" className="h-7 w-7" />
          </div>
          <h1 className="mt-4 text-3xl font-extrabold tracking-tight text-zinc-100">
            Creators Desk
          </h1>
          <p className="mt-1.5 text-sm text-zinc-400">
            순수 마크다운 집필 및 지식 관리를 위한 웹 워크스페이스
          </p>
        </header>

        <div className="rounded-2xl border border-zinc-800/80 bg-zinc-900/40 p-6 backdrop-blur-sm">
          <div className="flex items-center justify-between border-b border-zinc-800 pb-4">
            <div>
              <h2 className="text-base font-semibold text-zinc-200">내 Vault 목록</h2>
              <p className="text-xs text-zinc-400">작업할 프로젝트를 선택하거나 새로 만드세요</p>
            </div>
            <button
              onClick={() => setIsDialogOpen(true)}
              className="inline-flex items-center space-x-1.5 rounded-lg bg-sky-500 px-3.5 py-2 text-xs font-semibold text-zinc-950 shadow-xs hover:bg-sky-400 transition"
            >
              <MonochromeIcon name="plus" />
              <span>새 Vault 만들기</span>
            </button>
          </div>

          <div className="mt-6">
            {isLoading ? (
              <div className="py-12 text-center text-xs text-zinc-500">
                저장소를 불러오는 중...
              </div>
            ) : vaults.length === 0 ? (
              <div className="flex flex-col items-center justify-center py-12 text-center">
                <div className="rounded-full bg-zinc-800/60 p-3 text-zinc-500">
                  <MonochromeIcon name="inbox" className="h-6 w-6" />
                </div>
                <p className="mt-3 text-sm font-medium text-zinc-300">생성된 Vault가 없습니다</p>
                <p className="mt-1 text-xs text-zinc-500">
                  첫 Vault를 생성하고 나만의 노트를 작성해보세요.
                </p>
                <button
                  onClick={() => setIsDialogOpen(true)}
                  className="mt-4 text-xs font-semibold text-sky-400 hover:text-sky-300 hover:underline"
                >
                  지금 생성하기
                </button>
              </div>
            ) : (
              <div className="grid gap-3 sm:grid-cols-2">
                {vaults.map((vault) => (
                  <VaultCard
                    key={vault.id}
                    vault={vault}
                    onSelect={onSelectVault}
                    onDelete={onDeleteVault}
                  />
                ))}
              </div>
            )}
          </div>
        </div>
      </div>

      <CreateVaultDialog
        isOpen={isDialogOpen}
        onClose={() => setIsDialogOpen(false)}
        onSubmit={async (name) => {
          await onCreateVault(name);
        }}
      />
    </main>
  );
}
