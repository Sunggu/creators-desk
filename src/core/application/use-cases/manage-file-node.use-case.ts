import type { CreateFileNodeDto } from '../../domain/create-file-node.dto';
import type { FileNodeDto } from '../../domain/file-node.dto';
import type { FileRepository } from '../ports/file.repository';

export class ManageFileNodeUseCase {
  private readonly fileRepo: FileRepository;

  constructor(fileRepo: FileRepository) {
    this.fileRepo = fileRepo;
  }

  async createFile(dto: CreateFileNodeDto): Promise<FileNodeDto> {
    const trimmed = dto.name.trim();
    if (!trimmed) {
      throw new Error('Name cannot be empty');
    }

    const finalName = dto.type === 'file' && !trimmed.endsWith('.md')
      ? `${trimmed}.md`
      : trimmed;

    const now = Date.now();
    const id = typeof crypto !== 'undefined' && crypto.randomUUID
      ? crypto.randomUUID()
      : `node-${now}-${Math.random().toString(36).substring(2, 9)}`;

    const node: FileNodeDto = {
      id,
      vaultId: dto.vaultId,
      parentId: dto.parentId ?? null,
      name: finalName,
      type: dto.type,
      content: dto.type === 'file' ? (dto.content ?? '') : undefined,
      createdAt: now,
      updatedAt: now,
    };

    return this.fileRepo.create(node);
  }

  async rename(id: string, newName: string): Promise<FileNodeDto> {
    const trimmed = newName.trim();
    if (!trimmed) {
      throw new Error('Name cannot be empty');
    }

    const existing = await this.fileRepo.findById(id);
    if (!existing) {
      throw new Error('File not found');
    }

    const finalName = existing.type === 'file' && !trimmed.endsWith('.md')
      ? `${trimmed}.md`
      : trimmed;

    return this.fileRepo.update(id, {
      name: finalName,
      updatedAt: Date.now(),
    });
  }

  async delete(id: string): Promise<void> {
    const target = await this.fileRepo.findById(id);
    if (!target) return;

    if (target.type === 'folder') {
      const allNodes = await this.fileRepo.findByVaultId(target.vaultId);
      const toDeleteIds = this.collectDescendantIds(id, allNodes);
      toDeleteIds.push(id);

      for (const nodeId of toDeleteIds) {
        await this.fileRepo.delete(nodeId);
      }
    } else {
      await this.fileRepo.delete(id);
    }
  }

  async listByVault(vaultId: string): Promise<FileNodeDto[]> {
    const nodes = await this.fileRepo.findByVaultId(vaultId);
    return [...nodes].sort((a, b) => {
      // Folders first, then alphabetical
      if (a.type !== b.type) {
        return a.type === 'folder' ? -1 : 1;
      }
      return a.name.localeCompare(b.name);
    });
  }

  private collectDescendantIds(parentId: string, allNodes: FileNodeDto[]): string[] {
    const children = allNodes.filter((n) => n.parentId === parentId);
    const result: string[] = [];
    for (const child of children) {
      result.push(child.id);
      if (child.type === 'folder') {
        result.push(...this.collectDescendantIds(child.id, allNodes));
      }
    }
    return result;
  }
}
