// TypeScript interfaces for the AppMainContent component

export interface MainContentProps {
  // Layout configuration
  showAside?: boolean;
  asideWidth?: string;
  contentPadding?: string;
  
  // Scrolling behavior
  enableCustomScrollbar?: boolean;
  scrollBehavior?: 'smooth' | 'auto';
  
  // Responsive behavior
  hideAsideOnMobile?: boolean;
  mobileBreakpoint?: number;
}

export interface ScrollableAreaConfig {
  maxHeight?: string;
  enableHorizontalScroll?: boolean;
  scrollbarWidth?: string;
  scrollbarColor?: string;
}

export interface ContentSection {
  id: string;
  title: string;
  content: string;
  type?: 'text' | 'card' | 'widget';
}

export interface MainContentEmits {
  'content-scroll': [scrollTop: number];
  'aside-toggle': [visible: boolean];
}