export type FileNodeType = 'file' | 'folder';

export interface FileNodeDto {
  id: string;
  vaultId: string;
  parentId: string | null;
  name: string;
  type: FileNodeType;
  content?: string;
  createdAt: number;
  updatedAt: number;
}
