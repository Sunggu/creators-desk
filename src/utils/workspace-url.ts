export interface WorkspaceUrlParams {
  vaultId: string | null;
  fileId: string | null;
}

/**
 * Parses vault and file identifiers from a URL query search string.
 */
export function parseWorkspaceUrl(search: string): WorkspaceUrlParams {
  const query = search.startsWith('?') ? search.slice(1) : search;
  const params = new URLSearchParams(query);
  const vaultId = params.get('vault')?.trim() || null;
  const fileId = params.get('file')?.trim() || null;
  return { vaultId, fileId };
}

/**
 * Builds a workspace URL path with vault and file search query parameters.
 */
export function buildWorkspaceUrl(
  vaultId: string | null,
  fileId: string | null,
  pathname = '/',
): string {
  const params = new URLSearchParams();
  if (vaultId) params.set('vault', vaultId);
  if (fileId) params.set('file', fileId);
  const query = params.toString();
  return query ? `${pathname}?${query}` : pathname;
}

/**
 * Updates browser history in-place with the current workspace vault & file.
 */
export function syncWorkspaceUrlToHistory(
  vaultId: string | null,
  fileId: string | null,
): void {
  if (typeof window === 'undefined' || !window.history?.replaceState) return;
  const pathname = window.location?.pathname || '/';
  const nextUrl = buildWorkspaceUrl(vaultId, fileId, pathname);
  const currentUrl = `${pathname}${window.location?.search || ''}`;
  if (currentUrl !== nextUrl) {
    window.history.replaceState(null, '', nextUrl);
  }
}
