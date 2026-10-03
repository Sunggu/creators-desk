import VaultLauncher from './components/vault/vault-launcher';
import WorkspaceLayout from './components/workspace/workspace-layout';
import { useVaults } from './hooks/use-vaults';

export default function App() {
  const {
    vaults,
    activeVault,
    isLoading,
    selectVault,
    createVault,
    deleteVault,
    exitVault,
  } = useVaults();

  if (activeVault) {
    return <WorkspaceLayout vault={activeVault} onExitVault={exitVault} />;
  }

  return (
    <VaultLauncher
      vaults={vaults}
      isLoading={isLoading}
      onSelectVault={selectVault}
      onCreateVault={createVault}
      onDeleteVault={deleteVault}
    />
  );
}