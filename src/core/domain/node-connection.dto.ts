export interface NodeLinkEdgeDto {
  sourceFileId: string;
  sourceFileName: string;
  targetName: string;
  targetFileId: string | null;
}

export interface NodeConnectionsDto {
  outgoing: NodeLinkEdgeDto[];
  backlinks: NodeLinkEdgeDto[];
}
