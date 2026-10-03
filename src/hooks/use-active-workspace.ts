import { useCallback, useEffect, useState } from 'react';
import type { FileNodeDto } from '../core/domain/file-node.dto';
import {
  manageFileNodeUseCase,
  manageSessionUseCase,
} from '../infrastructure/di';

export function useActiveWorkspace(activeVaultId: string | null) {
  const [nodes, setNodes] = useState<FileNodeDto[]>([]);
  const [activeFileId, setActiveFileId] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);

  const refreshNodes = useCallback(async () => {
    if (!activeVaultId) {
      setNodes([]);
      setActiveFileId(null);
      return [];
    }
    const list = await manageFileNodeUseCase.listByVault(activeVaultId);
    setNodes(list);
    return list;
  }, [activeVaultId]);

  useEffect(() => {
    let mounted = true;
    async function loadWorkspace() {
      if (!activeVaultId) return;
      setIsLoading(true);
      try {
        const list = await manageFileNodeUseCase.listByVault(activeVaultId);
        if (!mounted) return;
        setNodes(list);

        const savedFileId = manageSessionUseCase.getLastActiveFileId(activeVaultId);
        const fileExists = list.some((n) => n.id === savedFileId && n.type === 'file');

        if (fileExists && savedFileId) {
          setActiveFileId(savedFileId);
        } else {
          const firstFile = list.find((n) => n.type === 'file');
          const fallbackId = firstFile ? firstFile.id : null;
          setActiveFileId(fallbackId);
          manageSessionUseCase.setActiveFileId(activeVaultId, fallbackId);
        }
      } finally {
        if (mounted) setIsLoading(false);
      }
    }

    loadWorkspace();
    return () => {
      mounted = false;
    };
  }, [activeVaultId]);

  const selectFile = useCallback((fileId: string | null) => {
    if (activeVaultId) {
      manageSessionUseCase.setActiveFileId(activeVaultId, fileId);
    }
    setActiveFileId(fileId);
  }, [activeVaultId]);

  const createFile = useCallback(async (name: string, parentId: string | null = null) => {
    if (!activeVaultId) return null;
    const created = await manageFileNodeUseCase.createFile({
      vaultId: activeVaultId,
      parentId,
      name,
      type: 'file',
      content: `# ${name.replace(/\.md$/i, '')}\n\n`,
    });
    await refreshNodes();
    selectFile(created.id);
    return created;
  }, [activeVaultId, refreshNodes, selectFile]);

  const createFolder = useCallback(async (name: string, parentId: string | null = null) => {
    if (!activeVaultId) return null;
    const created = await manageFileNodeUseCase.createFile({
      vaultId: activeVaultId,
      parentId,
      name,
      type: 'folder',
    });
    await refreshNodes();
    return created;
  }, [activeVaultId, refreshNodes]);

  const renameNode = useCallback(async (id: string, newName: string) => {
    const updated = await manageFileNodeUseCase.rename(id, newName);
    await refreshNodes();
    return updated;
  }, [refreshNodes]);

  const deleteNode = useCallback(async (id: string) => {
    await manageFileNodeUseCase.delete(id);
    if (activeFileId === id) {
      selectFile(null);
    }
    await refreshNodes();
  }, [activeFileId, refreshNodes, selectFile]);

  const activeFile = nodes.find((n) => n.id === activeFileId && n.type === 'file') ?? null;

  return {
    nodes,
    activeFile,
    activeFileId,
    isLoading,
    createFile,
    createFolder,
    renameNode,
    deleteNode,
    selectFile,
    refreshNodes,
  };
}
