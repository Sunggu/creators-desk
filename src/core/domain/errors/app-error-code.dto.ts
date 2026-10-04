/**
 * Stable, locale-independent failure identifiers.
 *
 * A code is also a resource key in the `error` namespace, so the presentation
 * layer can render it through the same translator as any other string while the
 * application layer stays free of any i18n dependency.
 */
export type AppErrorCode =
  | 'vault.nameRequired'
  | 'vault.notFound'
  | 'file.nameRequired'
  | 'file.notFound'
  | 'file.moveIntoSelf'
  | 'file.moveIntoDescendant';