export type SplitDirection = 'horizontal' | 'vertical';

export interface EditorGroupDto {
  id: string;
  fileIds: string[];
  activeFileId: string | null;
}

export interface EditorGridLayoutDto {
  direction: SplitDirection;
  groups: EditorGroupDto[];
  splitRatio: number;
}
