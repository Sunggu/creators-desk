/**
 * Identifier of a translatable resource, always namespaced as
 * `<namespace>.<key>` (e.g. `sidebar.newNote`).
 *
 * RULE: user-facing copy MUST live in `src/i18n/resources/**` and be referenced
 * by id. Components, hooks and use cases MUST NOT contain literal sentences.
 *
 * The concrete, compile-time-checked key union is derived from the baseline
 * (Korean) bundle in `src/i18n/resources/index.ts`. Domain layers only need to
 * treat it as an opaque id, which keeps them independent of the catalog.
 */
export type ResourceKey = string;