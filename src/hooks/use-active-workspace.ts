import { useCallback, useEffect, useState } from 'react';
import type { FileNodeDto } from '../core/domain/file-node.dto';
import { manageFileNodeUseCase, manageSessionUseCase } from '../infrastructure/di';
import { getUniqueFileName, getUniqueFolderName } from '../utils/name-generator';
import { STARTER_CONTENT } from '../utils/starter-template';

export function useActiveWorkspace(activeVaultId: string | null) {
  const [nodes, setNodes] = useState<FileNodeDto[]>([]);
  const [activeFileId, setActiveFileId] = useState<string | null>(null);
  const [newlyCreatedFileId, setNewlyCreatedFileId] = useState<string | null>(null);
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

        let currentList = list;
        if (currentList.length === 0) {
          const starter = await manageFileNodeUseCase.createFile({
            vaultId: activeVaultId,
            parentId: null,
            name: 'Welcome.md',
            type: 'file',
            content: STARTER_CONTENT,
          });
          currentList = [starter];
          setNodes(currentList);
          setActiveFileId(starter.id);
          manageSessionUseCase.setActiveFileId(activeVaultId, starter.id);
          return;
        }

        setNodes(currentList);
        const savedFileId = manageSessionUseCase.getLastActiveFileId(activeVaultId);
        const fileExists = currentList.some((n) => n.id === savedFileId && n.type === 'file');

        if (fileExists && savedFileId) {
          setActiveFileId(savedFileId);
        } else {
          const firstFile = currentList.find((n) => n.type === 'file');
          const fallbackId = firstFile ? firstFile.id : null;
          setActiveFileId(fallbackId);
          manageSessionUseCase.setActiveFileId(activeVaultId, fallbackId);
        }
      } finally {
        if (mounted) setIsLoading(false);
      }
    }

    loadWorkspace();
    return () => { mounted = false; };
  }, [activeVaultId]);

  const selectFile = useCallback((fileId: string | null) => {
    if (activeVaultId) {
      manageSessionUseCase.setActiveFileId(activeVaultId, fileId);
    }
    setActiveFileId(fileId);
  }, [activeVaultId]);

  /** Drops a deleted file from the mirrored active id. Tabs are owned by `useEditorGrid`. */
  const forgetFile = useCallback((fileId: string) => {
    setActiveFileId((prev) => {
      if (prev !== fileId) return prev;
      const nextActive = null;
      if (activeVaultId) manageSessionUseCase.setActiveFileId(activeVaultId, nextActive);
      return nextActive;
    });
  }, [activeVaultId]);

  const createFile = useCallback(
    async (customName?: string, parentId: string | null = null) => {
      if (!activeVaultId) return null;
      const name = customName?.trim() || getUniqueFileName(nodes.map((n) => n.name));
      const created = await manageFileNodeUseCase.createFile({
        vaultId: activeVaultId,
        parentId,
        name,
        type: 'file',
        content: '',
      });
      await refreshNodes();
      setNewlyCreatedFileId(created.id);
      selectFile(created.id);
      return created;
    },
    [activeVaultId, nodes, refreshNodes, selectFile],
  );

  const createFolder = useCallback(
    async (customName?: string, parentId: string | null = null) => {
      if (!activeVaultId) return null;
      const name = customName?.trim() || getUniqueFolderName(nodes.map((n) => n.name));
      const created = await manageFileNodeUseCase.createFile({
        vaultId: activeVaultId,
        parentId,
        name,
        type: 'folder',
      });
      await refreshNodes();
      return created;
    },
    [activeVaultId, nodes, refreshNodes],
  );

  const renameNode = useCallback(
    async (id: string, newName: string) => {
      const updated = await manageFileNodeUseCase.rename(id, newName);
      setNewlyCreatedFileId((prev) => (prev === id ? null : prev));
      await refreshNodes();
      return updated;
    },
    [refreshNodes],
  );

  const deleteNode = useCallback(async (id: string) => {
    await manageFileNodeUseCase.delete(id);
    forgetFile(id);
    setNewlyCreatedFileId((prev) => (prev === id ? null : prev));
    await refreshNodes();
  }, [forgetFile, refreshNodes]);

  const deleteNodes = useCallback(async (ids: string[]) => {
    for (const id of ids) {
      await manageFileNodeUseCase.delete(id);
      forgetFile(id);
    }
    await refreshNodes();
  }, [forgetFile, refreshNodes]);

  const moveNode = useCallback(async (id: string, newParentId: string | null) => {
    const updated = await manageFileNodeUseCase.move(id, newParentId);
    await refreshNodes();
    return updated;
  }, [refreshNodes]);

  const activeFile = nodes.find((n) => n.id === activeFileId && n.type === 'file') ?? null;
  const isNewFile = Boolean(activeFileId && activeFileId === newlyCreatedFileId);

  return {
    nodes,
    activeFile,
    activeFileId,
    newlyCreatedFileId,
    isNewFile,
    isLoading,
    createFile,
    createFolder,
    renameNode,
    moveNode,
    deleteNode,
    deleteNodes,
    selectFile,
    refreshNodes,
  };
}
