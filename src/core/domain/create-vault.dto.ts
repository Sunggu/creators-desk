export interface CreateVaultDto {
  alias?: string;
  name?: string;
  key?: string;
  /**
   * Body seeded into the welcome note.
   *
   * Passed in rather than hardcoded so the application layer never reaches for
   * a resource bundle: the presentation layer supplies already-localized copy.
   */
  starterContent?: string;
  /** File name for the seeded welcome note. */
  starterFileName?: string;
}
