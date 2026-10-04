export interface DbAdapter {
  all<T = Record<string, unknown>>(
    sql: string,
    params?: unknown[],
  ): Promise<T[]>;
  first<T = Record<string, unknown>>(
    sql: string,
    params?: unknown[],
  ): Promise<T | null>;
  run(
    sql: string,
    params?: unknown[],
  ): Promise<{ changes?: number }>;
}
