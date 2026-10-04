export type SidebarMenuId = 'explorer' | 'search' | 'outline' | 'plugins';

export interface SidebarPanelConfig {
  id: SidebarMenuId;
  label: string;
  iconName: string;
}
