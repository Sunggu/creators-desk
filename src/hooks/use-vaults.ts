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

        let currentList = list;
        if (currentList.length === 0) {
          const defaultVault = await createVaultUseCase.execute({ name: 'Main Vault' });
          currentList = [defaultVault];
          if (!mounted) return;
          setVaults(currentList);
          setActiveVaultId(defaultVault.id);
          manageSessionUseCase.setActiveVaultId(defaultVault.id);
          return;
        }

        setVaults(currentList);
        const initialVaultId = await manageSessionUseCase.getInitialVaultId();
        if (mounted) {
          const targetId =
            initialVaultId && currentList.some((v) => v.id === initialVaultId)
              ? initialVaultId
              : currentList[0].id;
          setActiveVaultId(targetId);
          manageSessionUseCase.setActiveVaultId(targetId);
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
    const list = await refreshVaults();
    manageSessionUseCase.setActiveVaultId(created.id);
    setActiveVaultId(created.id);
    setVaults(list);
    return created;
  }, [refreshVaults]);

  const selectVault = useCallback((vaultId: string) => {
    manageSessionUseCase.setActiveVaultId(vaultId);
    setActiveVaultId(vaultId);
  }, []);

  const deleteVault = useCallback(
    async (vaultId: string) => {
      await deleteVaultUseCase.execute(vaultId);
      const remaining = await listVaultsUseCase.execute();
      if (remaining.length === 0) {
        const fallback = await createVaultUseCase.execute({ name: 'Main Vault' });
        setVaults([fallback]);
        setActiveVaultId(fallback.id);
        manageSessionUseCase.setActiveVaultId(fallback.id);
      } else {
        setVaults(remaining);
        if (activeVaultId === vaultId) {
          setActiveVaultId(remaining[0].id);
          manageSessionUseCase.setActiveVaultId(remaining[0].id);
        }
      }
    },
    [activeVaultId],
  );

  const activeVault = vaults.find((v) => v.id === activeVaultId) ?? vaults[0] ?? null;

  return {
    vaults,
    activeVault,
    activeVaultId,
    isLoading,
    createVault,
    selectVault,
    deleteVault,
    refreshVaults,
  };
}
