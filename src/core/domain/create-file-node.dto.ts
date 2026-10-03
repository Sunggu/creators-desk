import type { FileNodeType } from './file-node.dto';

export interface CreateFileNodeDto {
  vaultId: string;
  parentId: string | null;
  name: string;
  type: FileNodeType;
  content?: string;
}
