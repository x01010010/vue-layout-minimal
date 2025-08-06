// TypeScript interfaces for the AppMainContent component

export interface MainContentProps {
  // Layout configuration
  contentPadding?: string;
  
  // Scrolling behavior
  enableCustomScrollbar?: boolean;
  scrollBehavior?: 'smooth' | 'auto';
  
  // Responsive behavior
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
}