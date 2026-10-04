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
  const [openFileIds, setOpenFileIds] = useState<string[]>([]);
  const [activeFileId, setActiveFileId] = useState<string | null>(null);
  const [newlyCreatedFileId, setNewlyCreatedFileId] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);

  const refreshNodes = useCallback(async () => {
    if (!activeVaultId) {
      setNodes([]);
      setActiveFileId(null);
      setOpenFileIds([]);
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
            content: `Creators Desk는 방해 없는 글쓰기와 생각의 연결을 위한 미니멀 마크다운 에디터입니다.\n\n## 주요 기능\n- **Live Preview & 읽기 뷰**: 마크다운 기호 없이 깔끔하게 렌더링된 문서를 바로 열람할 수 있습니다.\n- **[[지식 연결]] & #태그**: 노트 간의 유기적인 백링크와 태그를 지원합니다.\n- **몰입형 에디터**: 불필요한 줄 번호나 구분선 없이 생각의 흐름에만 집중할 수 있습니다.\n- **자동 동기화**: 작성 즉시 클라우드 및 로컬 환경에 실시간 저장됩니다.\n\n왼쪽 상단의 메뉴(☰)를 눌러 새 노트를 만들거나 폴더를 구성해보세요.\n`,
          });
          currentList = [starter];
          setNodes(currentList);
          setActiveFileId(starter.id);
          setOpenFileIds([starter.id]);
          manageSessionUseCase.setActiveFileId(activeVaultId, starter.id);
          return;
        }

        setNodes(currentList);
        const savedFileId = manageSessionUseCase.getLastActiveFileId(activeVaultId);
        const fileExists = currentList.some((n) => n.id === savedFileId && n.type === 'file');

        if (fileExists && savedFileId) {
          setActiveFileId(savedFileId);
          setOpenFileIds([savedFileId]);
        } else {
          const firstFile = currentList.find((n) => n.type === 'file');
          const fallbackId = firstFile ? firstFile.id : null;
          setActiveFileId(fallbackId);
          setOpenFileIds(fallbackId ? [fallbackId] : []);
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
    if (fileId) {
      setOpenFileIds((prev) => (prev.includes(fileId) ? prev : [...prev, fileId]));
    }
  }, [activeVaultId]);

  const closeFile = useCallback((fileId: string) => {
    setOpenFileIds((prev) => {
      const next = prev.filter((id) => id !== fileId);
      if (activeFileId === fileId) {
        const nextActive = next.length > 0 ? next[next.length - 1] : null;
        setActiveFileId(nextActive);
        if (activeVaultId) manageSessionUseCase.setActiveFileId(activeVaultId, nextActive);
      }
      return next;
    });
  }, [activeFileId, activeVaultId]);

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
      setOpenFileIds((prev) => (prev.includes(created.id) ? prev : [...prev, created.id]));
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

  const deleteNode = useCallback(
    async (id: string) => {
      await manageFileNodeUseCase.delete(id);
      closeFile(id);
      setNewlyCreatedFileId((prev) => (prev === id ? null : prev));
      await refreshNodes();
    },
    [closeFile, refreshNodes],
  );

  const deleteNodes = useCallback(
    async (ids: string[]) => {
      for (const id of ids) {
        await manageFileNodeUseCase.delete(id);
        closeFile(id);
      }
      await refreshNodes();
    },
    [closeFile, refreshNodes],
  );

  const openFiles = openFileIds
    .map((id) => nodes.find((n) => n.id === id && n.type === 'file'))
    .filter((n): n is FileNodeDto => Boolean(n));

  const activeFile = nodes.find((n) => n.id === activeFileId && n.type === 'file') ?? null;
  const isNewFile = Boolean(activeFileId && activeFileId === newlyCreatedFileId);

  return {
    nodes,
    openFiles,
    openFileIds,
    activeFile,
    activeFileId,
    isNewFile,
    isLoading,
    createFile,
    createFolder,
    renameNode,
    deleteNode,
    deleteNodes,
    selectFile,
    closeFile,
    refreshNodes,
  };
}
