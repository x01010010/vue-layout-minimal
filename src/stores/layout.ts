import { defineStore } from 'pinia';
import { ref, computed, reactive, readonly } from 'vue';
import type {
  LayoutState,
  LayoutConfig,
  SidebarState,
  ResponsiveBreakpoints,
} from '../types/layout';

const DEFAULT_CONFIG: LayoutConfig = {
  sidebar: {
    expandedWidth: 280,
    collapsedWidth: 64,
    collapsible: true,
    persistent: true,
    persistenceKey: 'vue-layout-sidebar-state',
  },
  breakpoints: {
    mobile: 768,
    tablet: 1024,
    desktop: 1440,
    widescreen: 1920,
  },
};

export const useLayoutStore = defineStore('layout', () => {
  const config = reactive<LayoutConfig>(DEFAULT_CONFIG);

  const state = reactive<LayoutState>({
    sidebarState: 'expanded',
    sidebarWidth: config.sidebar.expandedWidth,
    sidebarVisible: true,
    currentBreakpoint: 'desktop',
    isMobile: false,
    isDesktop: true,
  });

  let resizeTimeout: number | null = null;

  function updateResponsiveState() {
    const width = window.innerWidth;
    let breakpoint: keyof ResponsiveBreakpoints = 'desktop';
    if (width < config.breakpoints.mobile) {
      breakpoint = 'mobile';
    } else if (width < config.breakpoints.tablet) {
      breakpoint = 'tablet';
    } else if (width < config.breakpoints.desktop) {
      breakpoint = 'desktop';
    } else {
      breakpoint = 'widescreen';
    }
    state.currentBreakpoint = breakpoint;
    state.isMobile = breakpoint === 'mobile';
    state.isDesktop = breakpoint === 'desktop' || breakpoint === 'widescreen';

    if (state.isDesktop && !config.sidebar.collapsible) {
      if (state.sidebarState === 'collapsed') {
        setSidebarState('expanded');
      }
    }
  }

  function handleResize() {
    if (resizeTimeout) {
      clearTimeout(resizeTimeout);
    }
    resizeTimeout = window.setTimeout(() => {
      updateResponsiveState();
      resizeTimeout = null;
    }, 150);
  }

  function initializeLayout(initialConfig: Partial<LayoutConfig> = {}) {
    Object.assign(config.sidebar, initialConfig.sidebar);
    Object.assign(config.breakpoints, initialConfig.breakpoints);

    if (typeof window !== 'undefined') {
      updateResponsiveState();
      window.addEventListener('resize', handleResize);
    }
    loadSavedState();
    console.log('useLayoutStore initialized');
  }

  function cleanupLayout() {
    if (typeof window !== 'undefined') {
      window.removeEventListener('resize', handleResize);
    }
    if (resizeTimeout) {
      clearTimeout(resizeTimeout);
      resizeTimeout = null;
    }
    console.log('useLayoutStore cleaned up');
  }

  function updateSidebarState(newState: SidebarState) {
    state.sidebarState = newState;
    state.sidebarWidth =
      newState === 'expanded'
        ? config.sidebar.expandedWidth
        : config.sidebar.collapsedWidth;
    state.sidebarVisible = true;

    if (config.sidebar.persistent) {
      try {
        localStorage.setItem(config.sidebar.persistenceKey, newState);
      } catch (error) {
        console.warn('Failed to save sidebar state to localStorage:', error);
      }
    }
  }

  function toggleSidebar() {
    if (!config.sidebar.collapsible) {
      return;
    }
    const newState: SidebarState =
      state.sidebarState === 'expanded' ? 'collapsed' : 'expanded';
    updateSidebarState(newState);
  }

  function setSidebarState(newState: SidebarState) {
    if (!config.sidebar.collapsible && newState === 'collapsed') {
      console.warn('Cannot collapse sidebar: collapsible is disabled');
      return;
    }
    updateSidebarState(newState);
  }

  function setSidebarVisible(visible: boolean) {
    state.sidebarVisible = visible;
    if (config.sidebar.persistent) {
      try {
        const stateToSave = visible ? state.sidebarState : 'collapsed';
        localStorage.setItem(config.sidebar.persistenceKey, stateToSave);
      } catch (error) {
        console.warn(
          'Failed to save sidebar visibility to localStorage:',
          error
        );
      }
    }
  }

  function loadSavedState() {
    if (!config.sidebar.persistent) {
      return;
    }
    try {
      const savedState = localStorage.getItem(config.sidebar.persistenceKey);
      if (savedState && (savedState === 'expanded' || savedState === 'collapsed')) {
        updateSidebarState(savedState as SidebarState);
      }
    } catch (error) {
      console.warn('Failed to load sidebar state from localStorage:', error);
    }
  }

  return {
    // State
    state: readonly(state),
    config: readonly(config),

    // Getters
    sidebarState: computed(() => state.sidebarState),
    sidebarWidth: computed(() => state.sidebarWidth),
    sidebarVisible: computed(() => state.sidebarVisible),
    isMobile: computed(() => state.isMobile),
    isDesktop: computed(() => state.isDesktop),

    // Actions
    initializeLayout,
    cleanupLayout,
    toggleSidebar,
    setSidebarState,
    setSidebarVisible,
  };
});