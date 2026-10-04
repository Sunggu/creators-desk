import { useCallback, useEffect, useState } from 'react';
import type { FileNodeDto } from '../core/domain/file-node.dto';
import {
  manageFileNodeUseCase,
  manageSessionUseCase,
} from '../infrastructure/di';
import {
  getUniqueFileName,
  getUniqueFolderName,
} from '../utils/name-generator';

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
            content: `# Welcome to Creators Desk\n\nCreators Desk는 웹에서 동작하는 가볍고 순수한 마크다운 에디터입니다.\n\n- **Obsidian 호환**: 폴더 및 마크다운 파일 구조\n- **방해 없는 집필**: 군더더기 없는 미니멀 다크 테마\n- **자동 저장**: 작성 즉시 브라우저에 안전하게 보관\n\n왼쪽 상단의 메뉴(☰)를 눌러 새 노트를 만들거나 폴더를 구성해보세요.\n`,
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

  const createFile = useCallback(
    async (customName?: string, parentId: string | null = null) => {
      if (!activeVaultId) return null;

      const name =
        customName?.trim() || getUniqueFileName(nodes.map((n) => n.name));

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
      const name =
        customName?.trim() || getUniqueFolderName(nodes.map((n) => n.name));

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

  const deleteNode = useCallback(
    async (id: string) => {
      await manageFileNodeUseCase.delete(id);
      if (activeFileId === id) {
        selectFile(null);
      }
      setNewlyCreatedFileId((prev) => (prev === id ? null : prev));
      await refreshNodes();
    },
    [activeFileId, refreshNodes, selectFile],
  );

  const activeFile = nodes.find((n) => n.id === activeFileId && n.type === 'file') ?? null;
  const isNewFile = Boolean(activeFileId && activeFileId === newlyCreatedFileId);

  return {
    nodes,
    activeFile,
    activeFileId,
    isNewFile,
    isLoading,
    createFile,
    createFolder,
    renameNode,
    deleteNode,
    selectFile,
    refreshNodes,
  };
}
