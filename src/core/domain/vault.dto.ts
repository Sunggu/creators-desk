export interface VaultDto {
  id: string;
  key: string;       // Immutable storage path key (e.g. 'vlt_k8s9d7f6')
  alias: string;     // Mutable user-facing display name (e.g. 'Main Vault')
  name: string;      // Backward-compatible alias for UI
  createdAt: number;
  updatedAt: number;
}
