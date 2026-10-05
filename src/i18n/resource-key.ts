import type { ResourceKey as DomainResourceKey } from '../core/domain/resource-key.dto';
import type { ResourceKey as CheckedResourceKey } from './resources';
import type { HasResourceFn } from './translate-fn.dto';

/**
 * Narrows an **opaque** resource key - one typed as the domain's `ResourceKey`,
 * which is a plain `string` - into the compile-time-checked union `t()` expects.
 *
 * Why a boundary cast is unavoidable: the domain layer must not import the
 * catalog (Rule 3), so a DTO can only state "this field holds a resource id".
 * Presentation code then has to pass that id to `t()`, which demands a key the
 * compiler can verify. The cast is centralised here, at the single crossing
 * point, instead of being repeated - and silently diverging - per component.
 *
 * Pair with {@link isResolvableResourceKey} to check the id resolves at runtime;
 * `panel-window-header.tsx` does exactly that.
 */
export function asResourceKey(key: DomainResourceKey): CheckedResourceKey {
  return key as CheckedResourceKey;
}

/** True when an opaque key resolves in the active bundle or the baseline. */
export function isResolvableResourceKey(
  has: HasResourceFn,
  key: DomainResourceKey,
): boolean {
  return has(key as CheckedResourceKey);
}
