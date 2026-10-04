import type { AppErrorCode } from './app-error-code.dto';
import type { AppErrorParams } from './app-error.dto';

/**
 * Domain-level failure carrying a translatable code instead of a hardcoded
 * sentence. Throwing this (rather than `new Error('Korean text')`) is what keeps
 * the application layer independent of any resource bundle.
 */
export class AppError extends Error {
  readonly code: AppErrorCode;
  readonly params: AppErrorParams;

  constructor(code: AppErrorCode, params: AppErrorParams = {}) {
    super(code);
    this.name = 'AppError';
    this.code = code;
    this.params = params;
  }
}

export function isAppError(value: unknown): value is AppError {
  return value instanceof AppError;
}