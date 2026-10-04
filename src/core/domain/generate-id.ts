/**
 * Entity identifier factory.
 *
 * Uses `crypto.randomUUID()` where available (browsers, Cloudflare Workers,
 * Node 19+, Bun) and degrades to a time-prefixed random token otherwise, so no
 * runtime needs a polyfill or a dependency.
 */
export function generateId(prefix: string): string {
  const uuid =
    typeof crypto !== 'undefined' && typeof crypto.randomUUID === 'function'
      ? crypto.randomUUID()
      : `${Date.now().toString(36)}-${Math.random().toString(36).slice(2, 12)}`;

  return `${prefix}-${uuid}`;
}