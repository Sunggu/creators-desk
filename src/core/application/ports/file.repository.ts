import type { FileNodeDto } from '../../domain/file-node.dto';

export interface FileRepository {
  findByVaultId(vaultId: string): Promise<FileNodeDto[]>;
  findById(id: string): Promise<FileNodeDto | null>;
  create(node: FileNodeDto): Promise<FileNodeDto>;
  update(id: string, updates: Partial<FileNodeDto>): Promise<FileNodeDto>;
  delete(id: string): Promise<void>;
  deleteByVaultId(vaultId: string): Promise<void>;
}
