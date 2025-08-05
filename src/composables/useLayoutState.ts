import { ref, computed, reactive, watch, onMounted, onUnmounted, readonly } from 'vue';
import type {
  LayoutState,
  LayoutConfig,
  UseLayoutStateReturn,
  SidebarState,
  ResponsiveBreakpoints
} from '../types/layout';

/**
 * Default configuration for layout state management
 */
const DEFAULT_CONFIG: LayoutConfig = {
  sidebar: {
    expandedWidth: 280,
    collapsedWidth: 64,
    collapsible: true,
    persistent: true,
    persistenceKey: 'vue-layout-sidebar-state'
  },
  breakpoints: {
    mobile: 768,
    tablet: 1024,
    desktop: 1440,
    widescreen: 1920
  }
};

/**
 * Layout state management composable
 * Provides reactive state management for sidebar visibility, width, and responsive behavior
 */
export function useLayoutState(config: Partial<LayoutConfig> = {}): UseLayoutStateReturn {
  // Merge provided config with defaults
  const layoutConfig = reactive<LayoutConfig>({
    sidebar: { ...DEFAULT_CONFIG.sidebar, ...config.sidebar },
    breakpoints: { ...DEFAULT_CONFIG.breakpoints, ...config.breakpoints }
  });

  // Initialize reactive state
  const state = reactive<LayoutState>({
    sidebarState: 'expanded' as SidebarState,
    sidebarWidth: layoutConfig.sidebar.expandedWidth,
    sidebarVisible: true,
    currentBreakpoint: 'desktop',
    isMobile: false,
    isDesktop: true
  });

  // Reactive references for external access
  const sidebarState = ref<SidebarState>(state.sidebarState);
  const sidebarWidth = ref<number>(state.sidebarWidth);
  const sidebarVisible = ref<boolean>(state.sidebarVisible);
  const isMobile = ref<boolean>(state.isMobile);
  const isDesktop = ref<boolean>(state.isDesktop);

  // Responsive behavior management
  const currentScreenWidth = ref<number>(0);

  // Function to update responsive state based on screen width
  const updateResponsiveState = (): void => {
    const width = window.innerWidth;
    currentScreenWidth.value = width;
    
    // Determine current breakpoint
    let breakpoint: keyof ResponsiveBreakpoints = 'desktop';
    if (width < layoutConfig.breakpoints.mobile) {
      breakpoint = 'mobile';
    } else if (width < layoutConfig.breakpoints.tablet) {
      breakpoint = 'tablet';
    } else if (width < layoutConfig.breakpoints.desktop) {
      breakpoint = 'desktop';
    } else {
      breakpoint = 'widescreen';
    }
    
    // Update state
    state.currentBreakpoint = breakpoint;
    state.isMobile = breakpoint === 'mobile';
    state.isDesktop = breakpoint === 'desktop' || breakpoint === 'widescreen';
    
    // Update reactive refs
    isMobile.value = state.isMobile;
    isDesktop.value = state.isDesktop;
    
    // For desktop focus: ensure sidebar behavior is appropriate
    if (state.isDesktop && !layoutConfig.sidebar.collapsible) {
      // On desktop, if sidebar is not collapsible, ensure it's expanded
      if (state.sidebarState === 'collapsed') {
        updateSidebarState('expanded');
      }
    }
  };

  // Throttled resize handler to avoid excessive updates
  let resizeTimeout: number | null = null;
  const handleResize = (): void => {
    if (resizeTimeout) {
      clearTimeout(resizeTimeout);
    }
    
    resizeTimeout = window.setTimeout(() => {
      updateResponsiveState();
      resizeTimeout = null;
    }, 150); // 150ms throttle
  };

  // Initialize responsive state
  const initializeResponsiveState = (): void => {
    if (typeof window !== 'undefined') {
      updateResponsiveState();
      window.addEventListener('resize', handleResize);
    }
  };

  // Cleanup responsive listeners
  const cleanupResponsiveState = (): void => {
    if (typeof window !== 'undefined') {
      window.removeEventListener('resize', handleResize);
    }
    
    if (resizeTimeout) {
      clearTimeout(resizeTimeout);
      resizeTimeout = null;
    }
  };

  // Helper function to update all related state properties
  const updateSidebarState = (newState: SidebarState): void => {
    state.sidebarState = newState;
    sidebarState.value = newState;
    
    // Update width based on state
    const newWidth = newState === 'expanded'
      ? layoutConfig.sidebar.expandedWidth
      : layoutConfig.sidebar.collapsedWidth;
    
    state.sidebarWidth = newWidth;
    sidebarWidth.value = newWidth;
    
    // Update visibility (collapsed means still visible but narrow)
    const isVisible = true; // For desktop, sidebar is always visible
    state.sidebarVisible = isVisible;
    sidebarVisible.value = isVisible;
    
    // Save to localStorage if persistence is enabled
    if (layoutConfig.sidebar.persistent) {
      try {
        localStorage.setItem(layoutConfig.sidebar.persistenceKey, newState);
      } catch (error) {
        console.warn('Failed to save sidebar state to localStorage:', error);
      }
    }
  };

  // Action methods for sidebar state management
  const toggleSidebar = (): void => {
    if (!layoutConfig.sidebar.collapsible) {
      return; // Don't toggle if not collapsible
    }
    
    const newState: SidebarState = state.sidebarState === 'expanded' ? 'collapsed' : 'expanded';
    updateSidebarState(newState);
  };

  const setSidebarState = (newState: SidebarState): void => {
    if (!layoutConfig.sidebar.collapsible && newState === 'collapsed') {
      console.warn('Cannot collapse sidebar: collapsible is disabled');
      return;
    }
    
    updateSidebarState(newState);
  };

  const setSidebarVisible = (visible: boolean): void => {
    state.sidebarVisible = visible;
    sidebarVisible.value = visible;
    
    // If hiding sidebar, we might want to save this preference
    if (layoutConfig.sidebar.persistent) {
      try {
        const stateToSave = visible ? state.sidebarState : 'collapsed';
        localStorage.setItem(layoutConfig.sidebar.persistenceKey, stateToSave);
      } catch (error) {
        console.warn('Failed to save sidebar visibility to localStorage:', error);
      }
    }
  };

  // Function to load saved state from localStorage
  const loadSavedState = (): void => {
    if (!layoutConfig.sidebar.persistent) {
      return;
    }
    
    try {
      const savedState = localStorage.getItem(layoutConfig.sidebar.persistenceKey);
      if (savedState && (savedState === 'expanded' || savedState === 'collapsed')) {
        updateSidebarState(savedState as SidebarState);
      }
    } catch (error) {
      console.warn('Failed to load sidebar state from localStorage:', error);
    }
  };

  // Lifecycle management
  onMounted(() => {
    // Initialize responsive behavior
    initializeResponsiveState();
    
    // Load saved state from localStorage on mount
    loadSavedState();
    
    console.log('useLayoutState mounted - responsive state and saved state loaded');
  });

  onUnmounted(() => {
    // Cleanup responsive listeners
    cleanupResponsiveState();
    
    console.log('useLayoutState unmounted - cleanup completed');
  });

  // Return the composable interface
  return {
    // State (readonly)
    state: readonly(state),
    config: readonly(layoutConfig),
    
    // Actions
    toggleSidebar,
    setSidebarState,
    setSidebarVisible,
    
    // Computed properties
    sidebarState: readonly(sidebarState),
    sidebarWidth: readonly(sidebarWidth),
    sidebarVisible: readonly(sidebarVisible),
    isMobile: readonly(isMobile),
    isDesktop: readonly(isDesktop)
  };
}