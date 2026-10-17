export type SplitDirection = 'horizontal' | 'vertical';

export interface EditorGroupDto {
  id: string;
  fileIds: string[];
  activeFileId: string | null;
  viewMode?: 'edit' | 'preview';
}

export type EditorSplitNodeDto =
  | {
      type: 'leaf';
      groupId: string;
    }
  | {
      type: 'split';
      id: string;
      direction: SplitDirection;
      children: EditorSplitNodeDto[];
    };

export interface EditorGridLayoutDto {
  direction: SplitDirection;
  groups: EditorGroupDto[];
  splitRatio: number;
  root?: EditorSplitNodeDto;
}

