import { useCallback, useEffect, useState } from 'react';
import type { VaultDto } from '../core/domain/vault.dto';
import {
  createVaultUseCase,
  deleteVaultUseCase,
  listVaultsUseCase,
  manageSessionUseCase,
} from '../infrastructure/di';

export function useVaults() {
  const [vaults, setVaults] = useState<VaultDto[]>([]);
  const [activeVaultId, setActiveVaultId] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  const refreshVaults = useCallback(async () => {
    const list = await listVaultsUseCase.execute();
    setVaults(list);
    return list;
  }, []);

  useEffect(() => {
    let mounted = true;
    async function init() {
      setIsLoading(true);
      try {
        const list = await listVaultsUseCase.execute();
        if (!mounted) return;
        setVaults(list);

        const initialVaultId = await manageSessionUseCase.getInitialVaultId();
        if (mounted && initialVaultId) {
          setActiveVaultId(initialVaultId);
        }
      } finally {
        if (mounted) setIsLoading(false);
      }
    }
    init();
    return () => {
      mounted = false;
    };
  }, []);

  const createVault = useCallback(async (name: string): Promise<VaultDto> => {
    const created = await createVaultUseCase.execute({ name });
    await refreshVaults();
    manageSessionUseCase.setActiveVaultId(created.id);
    setActiveVaultId(created.id);
    return created;
  }, [refreshVaults]);

  const selectVault = useCallback((vaultId: string) => {
    manageSessionUseCase.setActiveVaultId(vaultId);
    setActiveVaultId(vaultId);
  }, []);

  const exitVault = useCallback(() => {
    manageSessionUseCase.setActiveVaultId(null);
    setActiveVaultId(null);
  }, []);

  const deleteVault = useCallback(async (vaultId: string) => {
    await deleteVaultUseCase.execute(vaultId);
    if (activeVaultId === vaultId) {
      setActiveVaultId(null);
    }
    await refreshVaults();
  }, [activeVaultId, refreshVaults]);

  const activeVault = vaults.find((v) => v.id === activeVaultId) ?? null;

  return {
    vaults,
    activeVault,
    activeVaultId,
    isLoading,
    createVault,
    selectVault,
    exitVault,
    deleteVault,
    refreshVaults,
  };
}
