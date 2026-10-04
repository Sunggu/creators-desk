import type { Clock } from '../ports/clock.port';
import type { CreateFileNodeDto } from '../../domain/create-file-node.dto';
import type { FileNodeDto } from '../../domain/file-node.dto';
import { AppError } from '../../domain/errors/app-error';
import { generateId } from '../../domain/generate-id';
import type { FileRepository } from '../ports/file.repository';

export class ManageFileNodeUseCase {
  private readonly fileRepo: FileRepository;
  private readonly clock: Clock;

  constructor(fileRepo: FileRepository, clock?: Clock) {
    this.fileRepo = fileRepo;
    this.clock = clock ?? { now: () => Date.now() as any };
  }

  async createFile(dto: CreateFileNodeDto): Promise<FileNodeDto> {
    const trimmed = dto.name.trim();
    if (!trimmed) {
      throw new AppError('file.nameRequired');
    }

    const finalName = dto.type === 'file' && !trimmed.endsWith('.md')
      ? `${trimmed}.md`
      : trimmed;

    const now = this.clock.now();
    const node: FileNodeDto = {
      id: generateId('node'),
      vaultId: dto.vaultId,
      parentId: dto.parentId ?? null,
      name: finalName,
      type: dto.type,
      content: dto.content ?? '',
      createdAt: now,
      updatedAt: now,
    };

    return this.fileRepo.create(node);
  }

  async rename(id: string, newName: string): Promise<FileNodeDto> {
    const trimmed = newName.trim();
    if (!trimmed) {
      throw new AppError('file.nameRequired');
    }

    const existing = await this.fileRepo.findById(id);
    if (!existing) {
      throw new AppError('file.notFound', { fileId: id });
    }

    const finalName = existing.type === 'file' && !trimmed.endsWith('.md')
      ? `${trimmed}.md`
      : trimmed;

    return this.fileRepo.update(id, {
      name: finalName,
      updatedAt: this.clock.now(),
    });
  }

  async move(id: string, newParentId: string | null): Promise<FileNodeDto> {
    const target = await this.fileRepo.findById(id);
    if (!target) throw new AppError('file.notFound', { fileId: id });
    if (target.parentId === newParentId) return target;
    if (newParentId === id) throw new AppError('file.moveIntoSelf', { fileId: id });

    if (target.type === 'folder' && newParentId) {
      const allNodes = await this.fileRepo.findByVaultId(target.vaultId);
      const descendants = this.collectDescendantIds(id, allNodes);
      if (descendants.includes(newParentId)) {
        throw new AppError('file.moveIntoDescendant', { fileId: id });
      }
    }

    return this.fileRepo.update(id, {
      parentId: newParentId,
      updatedAt: this.clock.now(),
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
