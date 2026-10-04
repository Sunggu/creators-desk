import type { Clock } from '../ports/clock.port';
import type { FileRepository } from '../ports/file.repository';
import { AppError } from '../../domain/errors/app-error';

export class FileContentUseCase {
  private readonly fileRepo: FileRepository;
  private readonly clock: Clock;

  constructor(fileRepo: FileRepository, clock: Clock) {
    this.fileRepo = fileRepo;
    this.clock = clock;
  }

  async getContent(fileId: string): Promise<string> {
    const file = await this.fileRepo.findById(fileId);
    if (!file) {
      throw new AppError('file.notFound', { fileId });
    }
    return file.content ?? '';
  }

  async saveContent(fileId: string, content: string): Promise<void> {
    const existing = await this.fileRepo.findById(fileId);
    if (!existing) {
      throw new AppError('file.notFound', { fileId });
    }

    // Stamped here, in the application layer, so the value is identical no
    // matter which storage adapter is active.
    await this.fileRepo.update(fileId, {
      content,
      updatedAt: this.clock.now(),
    });
  }
}
