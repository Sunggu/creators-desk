export interface FileStorageAdapter {
  get(key: string): Promise<string | null>;
  put(key: string, content: string): Promise<void>;
  delete(key: string): Promise<void>;
}
