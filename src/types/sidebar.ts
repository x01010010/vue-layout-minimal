// TypeScript interfaces for the AppSidebar component

export interface MenuItem {
  id: string;
  title: string;
  icon?: string;
  children?: MenuItem[];
  isExpanded?: boolean;
  action?: () => void;
}

export interface SidebarProps {
  sidebarState?: 'expanded' | 'collapsed';
  // Future props for sidebar configuration
  // Will be expanded as needed
}

export interface SidebarEmits {
  'menu-item-click': [item: MenuItem];
  'menu-expand': [item: MenuItem];
  'menu-collapse': [item: MenuItem];
  'parent-click-collapsed': [item: MenuItem];
}