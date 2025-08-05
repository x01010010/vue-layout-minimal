import type { Ref } from 'vue';

/**
 * TypeScript interfaces for layout state management
 * Defines the structure for sidebar visibility, width management, and responsive behavior
 */

/**
 * Sidebar visibility states
 */
export type SidebarState = 'expanded' | 'collapsed';

/**
 * Responsive breakpoint definitions
 */
export interface ResponsiveBreakpoints {
  mobile: number;
  tablet: number;
  desktop: number;
  widescreen: number;
}

/**
 * Sidebar configuration options
 */
export interface SidebarConfig {
  /** Default width when expanded (in pixels) */
  expandedWidth: number;
  /** Width when collapsed (in pixels) */
  collapsedWidth: number;
  /** Whether sidebar can be collapsed */
  collapsible: boolean;
  /** Whether to persist state in localStorage */
  persistent: boolean;
  /** localStorage key for persistence */
  persistenceKey: string;
}

/**
 * Layout state interface
 */
export interface LayoutState {
  /** Current sidebar visibility state */
  sidebarState: SidebarState;
  /** Current sidebar width in pixels */
  sidebarWidth: number;
  /** Whether sidebar is currently visible */
  sidebarVisible: boolean;
  /** Current screen breakpoint */
  currentBreakpoint: keyof ResponsiveBreakpoints;
  /** Whether layout is in mobile mode */
  isMobile: boolean;
  /** Whether layout is in desktop mode */
  isDesktop: boolean;
}

/**
 * Layout configuration interface
 */
export interface LayoutConfig {
  /** Sidebar configuration */
  sidebar: SidebarConfig;
  /** Responsive breakpoints */
  breakpoints: ResponsiveBreakpoints;
}

/**
 * Layout state composable return type
 */
export interface UseLayoutStateReturn {
  // State (readonly)
  readonly state: Readonly<LayoutState>;
  readonly config: Readonly<LayoutConfig>;
  
  // Actions
  toggleSidebar: () => void;
  setSidebarState: (state: SidebarState) => void;
  setSidebarVisible: (visible: boolean) => void;
  
  // Computed properties
  readonly sidebarState: Readonly<Ref<SidebarState>>;
  readonly sidebarWidth: Readonly<Ref<number>>;
  readonly sidebarVisible: Readonly<Ref<boolean>>;
  readonly isMobile: Readonly<Ref<boolean>>;
  readonly isDesktop: Readonly<Ref<boolean>>;
}