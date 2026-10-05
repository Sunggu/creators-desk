import ObsidianShell from './components/layout/obsidian-shell';
import { useVaults } from './hooks/use-vaults';
import { useTranslate } from './i18n/use-i18n';

export default function App() {
  const t = useTranslate();
  const {
    vaults,
    activeVault,
    isLoading,
    selectVault,
    createVault,
    deleteVault,
  } = useVaults();

  if (isLoading || !activeVault) {
    return (
      <div className="flex h-screen w-screen items-center justify-center bg-[#121215] text-zinc-500 select-none">
        <div className="flex flex-col items-center space-y-3">
          <div className="h-6 w-6 animate-spin rounded-full border-2 border-violet-500 border-t-transparent" />
          <span className="text-xs font-medium text-zinc-400">{t('app.loading')}</span>
        </div>
      </div>
    );
  }

  return (
    <ObsidianShell
      vault={activeVault}
      vaults={vaults}
      onSelectVault={selectVault}
      onCreateVault={createVault}
      onDeleteVault={deleteVault}
    />
  );
}