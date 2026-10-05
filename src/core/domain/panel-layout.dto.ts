import type { ResourceKey } from './resource-key.dto';

export type PanelType = 'explorer' | 'editor' | 'preview';

export type PanelSlot = 'left' | 'center' | 'right';

/**
 * Layout state for the workspace panel system.
 *
 * TITLES ARE RESOURCE IDS, not display strings. `titleKey` is translated at
 * render time, so switching language relabels open panels immediately instead of
 * freezing whatever language was active when the panel was created.
 *
 * The type is the domain's opaque {@link ResourceKey}; the presentation layer
 * narrows it to the compile-time-checked union when it translates.
 */
export interface PanelWindowConfig {
  id: string;
  type: PanelType;
  slot: PanelSlot;
  /** Resource id, e.g. `'panel.explorerTitle'`. Translated by the header. */
  titleKey: ResourceKey;
  fileId?: string | null;
  isClosable?: boolean;
}

export type LayoutPreset = 'standard' | 'split-editor-preview' | 'focus-editor';