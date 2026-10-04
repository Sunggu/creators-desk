export type PanelType = 'explorer' | 'editor' | 'preview';

export type PanelSlot = 'left' | 'center' | 'right';

export interface PanelWindowConfig {
  id: string;
  type: PanelType;
  slot: PanelSlot;
  title: string;
  fileId?: string | null;
  isClosable?: boolean;
}

export type LayoutPreset = 'standard' | 'split-editor-preview' | 'focus-editor';
