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

      let name = customName?.trim();
      if (!name) {
        const existingNames = new Set(nodes.map((n) => n.name.toLowerCase()));
        if (!existingNames.has('untitled.md')) {
          name = 'Untitled.md';
        } else {
          let i = 1;
          while (existingNames.has(`untitled ${i}.md`)) {
            i++;
          }
          name = `Untitled ${i}.md`;
        }
      }

      const cleanTitle = name.replace(/\.md$/i, '');
      const created = await manageFileNodeUseCase.createFile({
        vaultId: activeVaultId,
        parentId,
        name,
        type: 'file',
        content: `# ${cleanTitle}\n\n`,
      });
      await refreshNodes();
      selectFile(created.id);
      return created;
    },
    [activeVaultId, nodes, refreshNodes, selectFile],
  );

  const createFolder = useCallback(
    async (customName?: string, parentId: string | null = null) => {
      if (!activeVaultId) return null;
      let name = customName?.trim();
      if (!name) {
        const existingNames = new Set(nodes.map((n) => n.name.toLowerCase()));
        if (!existingNames.has('새 폴더')) {
          name = '새 폴더';
        } else {
          let i = 1;
          while (existingNames.has(`새 폴더 ${i}`)) {
            i++;
          }
          name = `새 폴더 ${i}`;
        }
      }

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
      await refreshNodes();
    },
    [activeFileId, refreshNodes, selectFile],
  );

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
