export interface VaultDto {
  id: string;
  key: string;       // Immutable storage path key (e.g. 'vlt_k8s9d7f6')
  alias: string;     // Mutable user-facing display name (e.g. 'Main Vault')
  name: string;      // Backward-compatible alias for UI
  /** Epoch milliseconds (UTC). Never a local-time string. */
  createdAt: number;
  /** Epoch milliseconds (UTC). Never a local-time string. */
  updatedAt: number;
}

/**
 * Neutral, non-localized file name seeded into every new vault.
 *
 * A file name is user data rather than interface copy, so it stays out of the
 * resource bundles - but it must never be localized either, otherwise switching
 * languages would rename a file the user already has.
 */
export const DEFAULT_STARTER_FILE_NAME = 'Welcome.md';