export type SidebarMenuId = 'explorer' | 'search';

export interface SidebarPanelConfig {
  id: SidebarMenuId;
  label: string;
  iconName: string;
}
