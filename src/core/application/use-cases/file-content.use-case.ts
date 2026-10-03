import type { FileRepository } from '../ports/file.repository';

export class FileContentUseCase {
  private readonly fileRepo: FileRepository;

  constructor(fileRepo: FileRepository) {
    this.fileRepo = fileRepo;
  }

  async getContent(fileId: string): Promise<string> {
    const file = await this.fileRepo.findById(fileId);
    if (!file) {
      throw new Error(`File ${fileId} not found`);
    }
    return file.content ?? '';
  }

  async saveContent(fileId: string, content: string): Promise<void> {
    const existing = await this.fileRepo.findById(fileId);
    if (!existing) {
      throw new Error(`File ${fileId} not found`);
    }
    await this.fileRepo.update(fileId, {
      content,
      updatedAt: Date.now(),
    });
  }
}
